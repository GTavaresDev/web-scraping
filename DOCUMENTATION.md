# Documentação Técnica do Projeto

## 1. Visão Geral do Desafio

O desafio proposto consistiu em construir uma aplicação full-stack capaz de consultar o rastreamento público do ecossistema SSW a partir de um CPF, extrair os dados relevantes por scraping e apresentar essas informações em uma interface web moderna, responsiva e orientada à experiência do usuário.

Do ponto de vista técnico, o problema não era apenas “buscar dados e renderizar uma lista”. O ponto central era lidar com um sistema externo legado, sem contrato formal de integração pública estável para esse caso de uso, sem resposta JSON pública acessível e com uma navegação baseada em HTML tradicional, formulários POST e páginas intermediárias. Isso desloca a complexidade do problema para dois eixos:

- entender o comportamento real do portal público do SSW
- transformar HTML de terceiros em um modelo de dados consistente para a aplicação

O cenário também traz uma limitação estrutural importante: embora o SSW possua uma WebAPI com resposta estruturada em JSON, esse caminho depende de credenciais de transportadora e não está disponível no contexto deste desafio. Na prática, isso obriga a solução a operar sobre a camada pública HTML, o que muda completamente as decisões de arquitetura, tratamento de erros e estratégia de performance.

O objetivo final da aplicação foi, portanto, entregar uma solução com as seguintes propriedades:

- validar corretamente o CPF informado
- executar o fluxo público de rastreamento do SSW por HTTP
- extrair listagem e eventos detalhados dos pacotes
- devolver os dados em uma API interna tipada
- exibir uma experiência de busca, listagem e detalhe em português
- evitar re-scraping desnecessário durante a navegação do usuário

Em outras palavras, o desafio exigiu mais do que construir uma interface. Exigiu projetar uma camada de integração resiliente com um sistema sem contrato oficial público utilizável.

## 2. Principais Desafios Técnicos

### 2.1 Ausência de API pública

O primeiro desafio real foi a ausência de uma API pública apropriada para o fluxo de destinatário pessoa física. Embora exista uma WebAPI do SSW com estrutura JSON bem definida, esse endpoint exige autenticação com `dominio`, `usuario` e `senha`, ou seja, credenciais institucionais da transportadora. Esse requisito torna a WebAPI inviável no contexto do desafio.

Isso teve impacto direto na arquitetura:

- não era possível modelar a integração como um cliente de API JSON convencional
- não havia contrato estável documentado para o cenário público
- toda a camada de integração precisou ser construída com base em scraping HTTP e parsing de HTML

Essa limitação também aumentou a responsabilidade da aplicação. Em vez de consumir dados já normalizados, a solução passou a ser responsável por:

- descobrir o fluxo real do formulário público
- montar as requisições corretas
- interpretar páginas HTML
- derivar estados de negócio a partir de texto livre

Esse tipo de integração é intrinsecamente mais frágil que uma API formal, porque a estabilidade do sistema consumidor passa a depender não de um contrato de dados, mas da estrutura visual e semântica de páginas web de terceiros.

### 2.2 Fluxo real do SSW (não trivial)

Um dos pontos mais importantes do projeto foi descobrir que o fluxo real do portal público não era o mais simples descrito inicialmente. O processo correto observado no HTML público foi:

1. `GET /2/rastreamento_pf`
2. `POST /2/resultSSW_dest`
3. `GET /2/ssw_SSWDetalhado?id=...&md=...`

Esse fluxo tem consequências arquiteturais relevantes.

O `GET` inicial não serve apenas para “abrir a página”. Ele é necessário para descobrir:

- a action real do formulário
- o nome do campo de CPF
- os campos ocultos necessários, especialmente `rpf`

Na implementação prática surgiu um detalhe crítico: esses campos ocultos não são apenas metadados auxiliares. Eles fazem parte do contrato real do formulário. Se forem extraídos incorretamente, o SSW não retorna erro explícito de integração; ele simplesmente responde com a tela de “Nenhuma informação encontrada”. Isso tornou a montagem exata do body do POST um ponto central da solução.

Em seguida, o `POST` para `/2/resultSSW_dest` não retorna o detalhe completo da remessa. Ele retorna uma listagem resumida com:

- nota fiscal
- pedido
- último status conhecido
- unidade
- data/hora resumida
- links internos para a visão detalhada

O detalhe completo, incluindo a linha do tempo completa de eventos, só aparece após uma nova requisição para `/2/ssw_SSWDetalhado`.

Isso torna o scraping mais complexo por três razões:

- existe uma etapa obrigatória de descoberta do formulário
- a resposta principal não contém toda a informação necessária para a interface final
- a obtenção do dataset completo exige múltiplas requisições dependentes

Na prática, o problema não é um scraping de uma única página. É um mini workflow de navegação HTTP com encadeamento de requisições.

### 2.3 HTML não estruturado / instável

Outro desafio relevante foi a qualidade estrutural do HTML retornado pelo SSW. O portal expõe tabelas, `tr` com `onclick`, mistura de texto e markup visual, `<font>`, `<br>`, rótulos em células de tabela e conteúdo parcialmente acoplado à apresentação.

Isso cria dificuldades objetivas para o parsing com Cheerio:

- nem sempre existem seletores semânticos claros
- boa parte da informação está distribuída em texto com quebras de linha
- alguns dados dependem da posição relativa entre células
- o link real do detalhe não vem como um `href` clássico, mas embutido em `onclick`

Esse cenário impede uma abordagem ingênua do tipo “selecionar classes e mapear campos”. O parser precisou adotar heurísticas:

- leitura por rótulo de tabela para encontrar dados como destinatário, nota e pedido
- extração do path de detalhe a partir de `onclick`
- normalização agressiva de whitespace e entidades HTML
- fallback para valores indisponíveis quando a estrutura não oferece um campo de forma confiável

Também foi necessário aceitar que o HTML do SSW é uma dependência instável. O parser foi escrito para ser tolerante, mas não existe garantia de imutabilidade da estrutura externa.

Um aprendizado importante surgiu justamente aqui: bugs de scraping nem sempre aparecem como exceções. Durante a depuração, a aplicação recebia HTML válido do SSW, mas o conteúdo era semanticamente errado para o caso de uso, porque a requisição estava sendo montada com campos ocultos corrompidos. Ou seja, o sistema “funcionava” do ponto de vista de transporte, mas o resultado de negócio era falso.

### 2.4 Separação entre listagem e detalhe

Esse foi o problema estrutural mais importante do desafio.

A listagem pública devolvida após o POST não contém a linha do tempo completa do pacote. Ela informa apenas um estado resumido do item e um link para “Mais detalhes”. Ou seja, a listagem não é suficiente para montar a tela de detalhe exigida pelo desafio.

Isso criou uma tensão de design:

- a interface precisava abrir o detalhe sem novo scraping após o clique
- mas os dados completos não estão na listagem
- logo, a API interna precisava antecipar a coleta dos detalhes completos no primeiro carregamento

Essa constatação foi decisiva para a definição do contrato do endpoint interno. Um retorno contendo apenas `PackageSummary[]` seria insuficiente para atender o requisito de navegação instantânea para a tela de detalhe sem nova chamada ao SSW.

Por isso, a solução adotou um payload combinado:

- `packages`: visão resumida para renderizar a lista
- `detailsById`: mapa com os detalhes completos para cada item

Essa decisão resolve o problema da UI, mas ao mesmo tempo aumenta o custo do scraping inicial, porque o backend precisa buscar o detalhe de cada pacote ainda durante a primeira consulta.

### 2.5 Performance e múltiplas requisições

Assim que ficou claro que o detalhe completo exigia outra requisição por pacote, surgiu o desafio de performance.

O custo total do fluxo deixa de ser:

- 1 GET + 1 POST

e passa a ser:

- 1 GET de formulário
- 1 POST de listagem
- N GETs de detalhe, onde N é o número de pacotes retornados

Esse modelo introduz riscos claros:

- aumento de latência total da consulta
- maior chance de timeout
- maior exposição a indisponibilidade parcial do SSW
- risco de sobrecarga ou bloqueio se o número de itens for grande

Em um sistema real, isso exigiria políticas mais agressivas de controle de concorrência, caching e proteção contra rate limit. Mesmo em um desafio técnico, era importante modelar a solução já reconhecendo esse custo e organizando o código para que essas otimizações possam ser adicionadas sem reescrever toda a aplicação.

### 2.6 Bug real na busca por CPF e processo de correção

O principal problema encontrado durante o desenvolvimento foi um falso negativo funcional: a busca por CPF validava corretamente a entrada e executava o fluxo do SSW, mas retornava que não havia encomendas relacionadas, mesmo usando um CPF conhecido com pacotes válidos.

Esse problema exigiu uma depuração em etapas, porque a falha não era óbvia:

1. confirmar manualmente, com `curl`, que o CPF de teste realmente possuía encomendas
2. comparar a resposta do fluxo manual com a resposta obtida pelo backend
3. isolar scraper, parser e route para descobrir em qual camada o problema surgia
4. inspecionar o body exato enviado para o SSW

O diagnóstico mostrou dois problemas distintos.

O primeiro e mais importante estava na extração dos campos ocultos do formulário. A implementação inicial usava `cheerio.map()` retornando tuplas `[name, value]`. O comportamento do Cheerio nesse caso faz flatten do retorno, o que destruiu a estrutura esperada de pares. Em vez de produzir algo como:

- `urlori=/2/rastreamento_pf`
- `rpf=<uuid>`

o código acabava gerando um objeto inválido, e o POST final saía com body semelhante a:

- `0=3`
- `u=r`
- `%2F=2`
- `r=p`
- `cnpjdest=00644516151`

Do ponto de vista do SSW, isso não era um request válido para o fluxo PF. O sistema respondia com uma página HTML de “Nenhuma informação encontrada”, o que mascarava a origem real do erro.

A solução aplicada foi:

- abandonar o uso de `map()` do Cheerio para esse caso
- converter explicitamente os elementos para array com `toArray()`
- mapear cada `input[type='hidden']` para uma tupla `[name, value]`
- reduzir esse array para um objeto confiável antes de montar o `URLSearchParams`

Depois dessa correção, o endpoint voltou a retornar a listagem correta para o CPF de teste.

O segundo problema apareceu logo em seguida e afetava a qualidade dos dados retornados. As células de data/hora e unidade usam `<br>` como separador semântico. Ao usar `.text()` diretamente, essas quebras se perdiam e o parser concatenava valores como:

- `13/03/2618:00`
- `SAO PAULO / SPDLG MAN`

Isso fazia o último evento e o `currentStatus` da listagem ficarem errados, porque a normalização temporal e a separação entre localização e unidade quebravam.

A solução foi introduzir uma extração específica por fragmento HTML:

- substituir `<br>` por `\n`
- depois extrair o texto já preservando a separação entre linhas
- usar essas linhas para montar corretamente `dateTime`, `location` e `unit`

Com isso, a API passou a retornar:

- 3 encomendas para o CPF `00644516151`
- último status correto como `entregue`
- `dateTime` no formato `16/03/26 13:31`
- `location` como `APARECIDA DE GOIANIA / GO`

## 3. Decisões de Arquitetura

### 3.1 Uso de scraping HTTP (e não Puppeteer)

A decisão principal foi começar com scraping HTTP direto, sem browser headless. Essa foi a escolha mais racional por três motivos.

Primeiro, o fluxo público do SSW mostrou-se baseado em formulário HTML tradicional, sem exigir renderização client-side complexa para expor os dados. Isso torna desnecessário o custo operacional de Puppeteer ou Playwright na primeira versão.

Segundo, scraping HTTP direto é muito mais leve:

- menor consumo de CPU e memória
- menor tempo de inicialização em ambiente serverless
- menos atrito de deploy em plataformas como Vercel

Terceiro, a solução fica conceitualmente mais simples. Em vez de automatizar um browser inteiro, a aplicação opera diretamente no protocolo HTTP, o que facilita inspeção, logging, retry e tratamento de falhas.

Na prática, surgiu um detalhe adicional relevante: o fluxo que se mostrou mais confiável para reproduzir o comportamento real do SSW foi o mesmo validado manualmente com `curl`. Por isso, o scraper foi consolidado usando `curl` via subprocesso no backend. Essa decisão não foi estética; foi uma escolha pragmática para reproduzir exatamente o request que se mostrou funcional no ambiente real.

Essa escolha não é dogmática. Ela é adequada enquanto o SSW continuar expondo esse fluxo por HTML estático. A migração para browser headless faria sentido se o portal passasse a exigir:

- renderização forte via JavaScript
- tokens gerados apenas em runtime de navegador
- mecanismos anti-bot que inviabilizem POST direto
- dependência de eventos client-side para carregar o conteúdo

No estado atual observado, a escolha por HTTP direto foi tecnicamente a melhor relação entre robustez e simplicidade.

### 3.2 Separação em camadas (Scraper / Parser / API)

A solução foi organizada em camadas para evitar acoplamento entre problemas diferentes.

`scraper.ts`

- responsável por executar as requisições HTTP contra o SSW
- descobre o formulário
- faz o POST inicial
- busca páginas de detalhe
- traduz falhas de rede em erros tipados
- reproduz fielmente o request validado manualmente com `curl`

`parser.ts`

- responsável por interpretar HTML e produzir estruturas de domínio
- não conhece o transporte HTTP
- pode ser testado alimentando apenas strings HTML
- concentra as heurísticas e normalizações

`route.ts`

- responsável por validar a entrada
- orquestrar scraper e parser
- montar o contrato final de resposta
- traduzir exceções em HTTP status code e JSON estruturado

Essa separação traz benefícios claros:

- melhora a legibilidade do código
- reduz o custo de manutenção
- isola mudanças futuras no transporte do scraper
- evita lógica de parsing espalhada na API
- facilita evolução para testes por fixture no parser

Ela também foi decisiva para a correção do bug principal. Como scraper, parser e API estavam desacoplados, foi possível responder objetivamente:

- o request está sendo montado errado?
- o HTML retornado está certo e o parser está falhando?
- ou o problema está apenas na serialização da resposta?

Sem essa separação, o processo de depuração seria muito mais lento e impreciso.

Sem essa separação, seria muito fácil cair em um anti-pattern comum em desafios de scraping: colocar requisição, parsing, regra de negócio e serialização HTTP tudo dentro de um único handler. Isso normalmente funciona no curto prazo, mas se torna difícil de depurar e ampliar.

### 3.3 Endpoint único (`/api/tracking`)

Foi adotado um endpoint único para a integração interna: `POST /api/tracking`.

A justificativa é simples: a aplicação faz uma consulta orientada a CPF e, a partir desse CPF, precisa devolver tudo o que a UI necessita para:

- montar a listagem
- permitir abertura imediata do detalhe

Não havia ganho real em quebrar isso em dois endpoints internos, porque o gargalo principal está no SSW externo, não na aplicação local. Criar uma API separada de detalhe só faria sentido se a UI fosse desenhada para carregar o detalhe sob demanda, o que entraria em conflito com a exigência de evitar novo scraping ao navegar entre lista e detalhe.

Os trade-offs dessa escolha são reais:

- o payload fica maior
- a primeira consulta pode ser mais lenta
- o backend assume o custo upfront de buscar detalhes completos

Mas os benefícios superam os custos para este caso:

- contrato simples para o frontend
- menos round-trips internos
- cache client-side natural
- experiência de navegação instantânea após a primeira busca

### 3.4 Retorno de resumo + detalhes juntos

Esse foi um ajuste importante em relação ao modelo inicial de tipos. O contrato original centrado apenas em `PackageSummary[]` não era suficiente para suportar a navegação sem re-scraping.

O problema era objetivo:

- a lista usa resumo
- a tela de detalhe usa timeline completa
- a timeline não existe na listagem
- o requisito era não fazer novo scrape ao abrir o detalhe

A solução adotada foi retornar:

```ts
{
  packages: PackageSummary[],
  detailsById: Record<string, PackageDetail>
}
```

Essa forma de retorno resolve simultaneamente o consumo da lista e do detalhe.

`packages`

- oferece uma estrutura enxuta para o rendering da tela de listagem
- evita obrigar a lista a percorrer eventos completos

`detailsById`

- garante acesso direto ao detalhe completo por identificador
- reduz a complexidade de lookup no client
- evita transformar a navegação em nova rodada de scraping

Do ponto de vista da UI, o benefício é importante: depois da primeira busca, abrir o detalhe passa a ser uma operação puramente local.

### 3.5 Gerenciamento de estado no client

No frontend, a decisão foi usar um provider simples com `Context` e persistência em `sessionStorage`.

Essa escolha foi motivada por três fatores:

- o estado é relativamente pequeno e localizado
- não havia necessidade de uma biblioteca externa de state management
- a informação precisa sobreviver a refresh simples da navegação

O provider guarda:

- CPF consultado
- payload com `packages`
- mapa `detailsById`
- timestamp da coleta

O `sessionStorage` complementa isso persistindo os dados da última busca durante a sessão do navegador. Isso atende dois objetivos:

- evitar nova chamada ao backend ao navegar entre lista e detalhe
- permitir que um refresh da rota ainda mantenha os dados disponíveis

Essa solução é pragmática. Não introduz dependência extra, resolve o requisito funcional e mantém o fluxo previsível. Se o sistema evoluísse para múltiplas buscas simultâneas, histórico de consultas ou sincronização entre abas, provavelmente seria necessário um modelo de estado mais sofisticado.

## 4. Estratégia de Parsing

A estratégia de parsing foi construída em duas frentes: listagem e detalhe.

Na listagem, o principal desafio era que os dados não vinham organizados em elementos semânticos claros. O HTML usa linhas de tabela com `onclick`, `<br>`, `<font>` e blocos textuais com formatação visual. Por isso, o parser precisou combinar duas abordagens:

- Cheerio para localizar áreas gerais da página
- heurísticas orientadas à estrutura bruta do `tr` para extrair cada item de forma resiliente

Os campos da listagem foram derivados da seguinte forma:

- destinatário: encontrado por leitura do rótulo `Destinatário:` na tabela
- NF e pedido: extraídos da primeira célula da linha
- local e data/hora: extraídos da segunda célula
- status resumido: extraído do título textual da terceira célula
- link de detalhe: extraído do `onclick` da linha ou do link “Mais detalhes”

No detalhe, o parsing foi mais direto, porque a estrutura da página detalhada é relativamente mais previsível:

- rótulos em `td` permitem localizar destinatário, coleta, NF e pedido
- a tabela de eventos permite iterar por linha e montar a timeline

O status foi derivado a partir de texto livre, não de um enum retornado pelo SSW. Isso exigiu mapear palavras-chave observadas para estados canônicos da aplicação:

- `ENTREGUE`, `MERCADORIA ENTREGUE`, `ENTREGA REALIZADA` → `entregue`
- `SAIDA DE UNIDADE`, `SAIDA PARA ENTREGA`, `EM TRANSITO` → `em_transito`
- `CHEGADA EM UNIDADE`, `CHEGADA EM UNIDADE DE TRANSBORDO` → `em_transferencia`
- `DOCUMENTO DE TRANSPORTE EMITIDO` → `pendente`
- termos contendo `DEVOLV` → `devolvido`

Quando o texto não encaixa em nenhuma regra conhecida, o parser aplica fallback e normaliza a string para um identificador estável. Isso evita quebra total do fluxo apenas porque surgiu um novo tipo de status no HTML.

Também houve tratamento explícito de inconsistências:

- normalização de espaços e `&nbsp;`
- preservação de quebras de linha vindas de `<br>`
- fallback para “Informação indisponível”
- ordenação dos eventos do mais recente para o mais antigo
- separação entre `location` e `unit` quando possível

Esse conjunto de heurísticas torna o parser tolerante sem fingir que o HTML é um contrato formal.

O aprendizado mais importante aqui foi que HTML visualmente correto não significa texto semanticamente correto após o parsing. O bug das datas e localidades concatenadas existia mesmo com o HTML intacto. O erro estava em como o texto era extraído, e não em como o SSW o enviava.

## 5. Tratamento de Erros

O tratamento de erros foi pensado como parte da arquitetura, não como um detalhe de implementação.

### CPF inválido

O CPF é validado antes de qualquer chamada ao SSW. O algoritmo implementado:

- remove caracteres não numéricos
- exige 11 dígitos
- rejeita sequências repetidas
- recalcula os dois dígitos verificadores

Quando inválido, a API responde com:

- status `400`
- código `INVALID_CPF`

No frontend, isso é refletido como erro de validação inline, sem navegação.

### Timeout da SSW

Cada chamada ao SSW usa timeout de 15 segundos. Em caso de timeout:

- a camada de scraper tenta uma nova vez
- se falhar novamente, lança `SSW_UNAVAILABLE`

Na API, isso é traduzido em:

- status `502`
- mensagem amigável indicando indisponibilidade temporária do SSW

Essa decisão diferencia falha de rede externa de erro interno da aplicação.

### HTML inesperado

Como o sistema depende de scraping, uma categoria crítica de falha é “o HTML veio, mas não parece conter o que esperamos”.

Esse caso é tratado por:

- detecção de strings conhecidas de falha/manutenção
- falha ao localizar formulário
- falha ao localizar campo de CPF
- ausência de estruturas mínimas esperadas no parsing

Nesses cenários, o scraper/parser lança `SCRAPING_FAILED`, e a API responde com `502`.

### Nenhuma encomenda

Esse cenário não é tratado como erro técnico. Se o CPF for válido e o fluxo não retornar pacotes, a API responde com sucesso e payload vazio.

Isso é importante porque “nenhum dado” é uma resposta de negócio válida, não um erro de integração.

No frontend, esse caso gera um estado vazio explícito com mensagem e ação para nova busca.

O ponto importante, após a correção do bug do CPF, é distinguir vazio legítimo de vazio falso. Antes da correção, a aplicação também retornava lista vazia, mas por um erro de montagem do POST. Depois do ajuste, a resposta vazia voltou a significar efetivamente “nenhuma encomenda encontrada”, e não “requisição malformada”.

### Sistema fora do ar

Quando o conteúdo do SSW indica indisponibilidade ou quando a comunicação externa falha de forma consistente, a aplicação retorna erro estruturado e evita expor stack trace ao usuário.

Esse tratamento impede que falhas do sistema externo contaminem a experiência com mensagens genéricas ou respostas inconsistentes.

## 6. Estratégia de Performance

A performance foi tratada em três frentes.

### Controle de múltiplas requisições

O fluxo exige uma requisição adicional por pacote para obter o detalhe completo. No estado atual implementado, isso é feito em lote com `Promise.all`, o que simplifica a montagem do payload, mas deixa explícita a necessidade de evolução para um controle de concorrência mais refinado caso o volume de pacotes cresça.

A arquitetura já permite essa evolução porque scraper, parser e route estão separados. Isso significa que introduzir um limitador de concorrência no scraper não exigirá reescrever a API nem a UI.

### Timeout + retry

O scraper aplica timeout de 15 segundos e retry único em caso de timeout. Essa é uma forma simples, mas importante, de evitar travamentos longos por indisponibilidade transitória.

O retry não resolve problemas estruturais do SSW, mas reduz o impacto de instabilidades breves de rede.

### Cache no client

Depois que os dados chegam ao frontend, a navegação não dispara nova chamada ao backend. Isso reduz:

- latência percebida ao abrir detalhes
- carga sobre a API interna
- carga indireta sobre o SSW

O cache em `sessionStorage` também ajuda em refresh simples durante a mesma sessão.

Com o bug do backend corrigido, essa estratégia passou a entregar o comportamento esperado: a primeira busca carrega os pacotes corretos, e toda a navegação subsequente entre lista e detalhe passa a ser instantânea no client.

## 7. Decisões de Frontend

### Por que usar Next.js App Router

O App Router foi uma escolha natural porque o projeto precisava combinar:

- páginas server-rendered
- route handlers para API interna
- organização por rotas
- loading states por segmento

O modelo do App Router se encaixa bem nesse tipo de solução híbrida, em que o frontend não é apenas uma SPA consumindo uma API externa, mas parte de uma aplicação unificada.

### Uso de Server + Client Components

As páginas foram mantidas enxutas, e a interatividade foi concentrada em componentes client-side específicos:

- formulário de busca
- provider de estado
- views dependentes do cache no navegador

Essa divisão mantém o código mais previsível:

- o que depende de navegação e armazenamento local fica no client
- o shell da aplicação e a estrutura de rotas continuam alinhados ao modelo do App Router

### Tailwind como padrão único de estilização

Foi mantida a restrição de usar Tailwind como padrão único de styling, com `globals.css` apenas como ponto de entrada global. Isso traz consistência para o projeto:

- reduz dispersão de estilos
- evita CSS modular ad hoc
- facilita manutenção visual
- deixa a estilização acoplada ao componente, o que é útil em um desafio de escopo controlado

### Estrutura de componentes

A UI foi organizada em três grupos:

- `components/ui`
  - primitives reutilizáveis como botão, card, input, skeleton e alert
- `components/layout`
  - header e footer
- `components/tracking`
  - componentes de domínio como formulário, lista, badge, timeline, views e provider

Essa organização separa bem:

- componentes genéricos
- shell estrutural
- comportamento específico do problema de rastreamento

## 8. Limitações Conhecidas

É importante ser preciso aqui.

### Dependência do HTML da SSW

A solução depende diretamente do HTML público do SSW. Se o markup mudar de forma relevante, o parser pode deixar de funcionar corretamente mesmo que o sistema continue “no ar”.

### Possível quebra futura do parser

Como parte da extração depende de heurísticas, a robustez está limitada pelo grau de estabilidade do HTML externo. O parser tenta ser tolerante, mas não existe garantia de compatibilidade futura sem monitoramento.

### Latência por múltiplas requisições

O custo do scraping cresce com o número de pacotes retornados. Em casos com muitos itens, o tempo total de resposta tende a aumentar porque o backend precisa buscar o detalhe de cada um.

### Dados incompletos em alguns casos

Nem todos os campos são garantidos pelo HTML público. Em cenários específicos, alguns valores podem aparecer ausentes, e a aplicação responde com fallback textual em vez de falhar.

### Dependência do comportamento atual do fluxo HTTP público

A solução está estabilizada sobre o comportamento atualmente observado do portal público do SSW. Isso inclui não apenas a estrutura do HTML, mas também a forma exata como o request precisa ser enviado. Mudanças futuras no comportamento do formulário, nos campos ocultos ou no fluxo interno podem exigir ajuste no scraper.

## 9. Possíveis Melhorias Futuras

### Cache server-side

Adicionar um cache distribuído, como Redis, reduziria drasticamente o número de scrapes repetidos para o mesmo CPF em janelas curtas de tempo.

### Fila de scraping

Para ambientes com volume maior, seria razoável mover o scraping para uma fila assíncrona, desacoplando a requisição do usuário do custo total de coleta.

### Uso da API oficial

Se credenciais institucionais estivessem disponíveis, o ideal seria substituir o scraping pela WebAPI oficial. Isso reduziria fragilidade, simplificaria parsing e melhoraria previsibilidade.

### Monitoramento de mudanças no HTML

Como o sistema depende de scraping, monitorar mudanças estruturais no HTML do SSW seria essencial em produção. Isso pode ser feito com:

- smoke tests periódicos
- snapshots de HTML
- alertas em caso de parse vazio ou taxa anormal de erro

### Testes automatizados mais robustos

O parser foi organizado para permitir testes por fixtures HTML, mas uma evolução natural seria adicionar:

- fixtures reais anonimizadas
- testes de regressão por estrutura
- cobertura explícita para novos tipos de status
- testes de integração contra mocks do fluxo HTTP

## 10. Conclusão

O projeto resultou em uma solução com boa organização interna para um problema que, na prática, é significativamente mais complexo do que “consumir uma API e renderizar dados”. O principal mérito da arquitetura foi tratar o scraping como uma integração séria, com separação de responsabilidades, contratos tipados, tratamento explícito de falhas e preocupação com a experiência do usuário.

Os pontos fortes da solução são:

- validação de entrada consistente
- modelagem tipada do domínio
- separação clara entre transporte, parsing e exposição da API
- frontend organizado para navegar sem re-scraping
- documentação honesta das limitações
- processo de depuração rastreável para problemas reais de integração

Do ponto de vista estrutural, a solução é escalável porque a complexidade foi isolada onde ela realmente pertence:

- o scraper pode evoluir sem quebrar a UI
- o parser pode ser fortalecido com testes e novas heurísticas
- a estratégia de cache pode ser aprimorada sem alterar o contrato principal
- a troca futura para uma API oficial é viável porque a aplicação já possui uma camada interna de abstração

O aprendizado mais relevante da implementação foi que o problema funcional mais crítico não estava no frontend, nem no roteamento, nem na modelagem do contrato da API. Ele estava em um detalhe aparentemente pequeno da extração dos campos ocultos do formulário HTML. Em integrações por scraping, esse tipo de detalhe pode invalidar a funcionalidade inteira sem produzir erro explícito. A solução final ficou mais robusta justamente porque esse risco foi identificado, isolado e corrigido de forma objetiva.

# SSW Tracker

Sistema de rastreamento de encomendas por CPF construído com Next.js, TypeScript e scraping do portal público do SSW. O projeto foi estruturado para separar claramente interface, domínio, pipeline de coleta e contratos de dados, facilitando manutenção, evolução e leitura técnica.

## Visão geral da arquitetura

O projeto adota uma organização por camadas com foco em separação de responsabilidades:

- `app/`  
  Camada de rotas do Next.js App Router. Aqui ficam as páginas, loading states de rota e a API interna.

- `components/pages/`  
  Composição das telas da aplicação. Essa camada conecta páginas do App Router aos blocos visuais e de domínio.

- `components/ui/`  
  Componentes de interface reutilizáveis, como `Button`, `Card`, `Input`, `Alert` e `Skeleton`.

- `features/`  
  Camada de domínio da interface. No projeto atual, `features/tracking` concentra os componentes e o provider responsáveis pelo fluxo de rastreamento.

- `services/`  
  Camada de orquestração. O service centraliza o pipeline de negócio e tira essa responsabilidade da rota HTTP.

- `utils/`  
  Utilitários especializados, incluindo validator, scraper, parser, formatters e constantes.

- `types/`  
  Contratos tipados do domínio e da API, organizados por responsabilidade.

- `config/`  
  Camada centralizada para configuração e variáveis de ambiente.

### Fluxo principal

```text
input -> validator -> scraper -> parser -> service -> API response
```

Na prática:

1. O usuário informa um CPF.
2. O validator valida e normaliza o valor.
3. O scraper consulta o portal público do SSW e obtém o HTML.
4. O parser converte o HTML em estruturas tipadas.
5. O service orquestra o pipeline e monta a resposta final.
6. A API route apenas adapta o resultado para HTTP/JSON.

## Estrutura de pastas

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── pages/
│   └── ui/
├── config/
├── features/
│   └── tracking/
├── services/
├── types/
└── utils/
    ├── formatters/
    ├── parsers/
    ├── scrapers/
    └── validators/
```

## Pipeline de scraping

O pipeline foi dividido em etapas pequenas e previsíveis.

### 1. Validator

O validator recebe o CPF informado pelo usuário, remove máscara, verifica tamanho e calcula os dígitos verificadores.

Responsabilidade:

- validar se o CPF é estruturalmente válido
- retornar uma versão normalizada para uso no pipeline

### 2. Scraper

O scraper faz a comunicação com o portal público do SSW usando requisições HTTP simples. Ele busca:

- a página/formulário público
- a listagem de encomendas vinculadas ao CPF
- os detalhes de cada encomenda encontrada

Responsabilidade:

- coletar HTML bruto
- encapsular falhas de rede, timeout e indisponibilidade do serviço externo

### 3. Parser

O parser transforma o HTML retornado pelo SSW em objetos tipados do domínio.

Responsabilidade:

- extrair lista de encomendas
- extrair detalhes e eventos
- mapear status, datas e descrições em estruturas TypeScript

### 4. Service

O service é o orquestrador do pipeline.

Responsabilidade:

- validar o CPF
- chamar scraper e parser na ordem correta
- montar `packages` e `detailsById`
- devolver um `TrackingResponse` pronto para a camada HTTP

## Como rodar o projeto localmente

### Instalação

```bash
npm install
cp .env.example .env
```

### Desenvolvimento

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

### Validação local

```bash
npm run lint
npm run build
```

## Variáveis de ambiente

O repositório versiona um arquivo `.env.example` com as variáveis necessárias. Ao clonar o projeto, crie seu arquivo local a partir dele:

```bash
cp .env.example .env
```

O arquivo `.env` é local, não deve ser commitado e fica fora do versionamento.

Exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

### Diretriz de uso

- `.env.example` documenta as variáveis obrigatórias do projeto.
- `.env` deve existir apenas no ambiente local ou na plataforma de deploy.
- O acesso às variáveis deve ser centralizado em `src/config/index.ts`.
- O restante do projeto não deve acessar `process.env` diretamente.

Exemplo de acesso centralizado:

```ts
import { env } from "@/config";

env.apiUrl;
env.appEnv;
```

Essa abordagem facilita manutenção, evita espalhar configuração pela base e deixa a origem das variáveis explícita.

## Uso da API

### Endpoint principal

```http
POST /api/tracking
```

### Exemplo de request

```json
{
  "cpf": "12345678900"
}
```

### Resposta de sucesso

O contrato real de sucesso retorna `data` com `packages` e `detailsById`, além de `scrapedAt`.

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "abc123",
        "recipient": "Nome do destinatário",
        "nfNumber": "123456",
        "orderNumber": "78910",
        "currentStatus": "em_transito",
        "lastEvent": {
          "dateTime": "27/03/2026 14:30",
          "location": "São Paulo - SP",
          "unit": "Unidade SP",
          "description": "Mercadoria em trânsito",
          "status": "em_transito"
        },
        "eventCount": 4
      }
    ],
    "detailsById": {
      "abc123": {
        "id": "abc123",
        "recipient": "Nome do destinatário",
        "nfNumber": "123456",
        "orderNumber": "78910",
        "pickupDate": null,
        "currentStatus": "em_transito",
        "events": [
          {
            "dateTime": "27/03/2026 14:30",
            "location": "São Paulo - SP",
            "unit": "Unidade SP",
            "description": "Mercadoria em trânsito",
            "status": "em_transito"
          }
        ]
      }
    }
  },
  "scrapedAt": "2026-03-28T03:30:18.493Z"
}
```

Quando não há encomendas para o CPF informado, a API mantém `success: true` e devolve coleções vazias.

### Resposta de erro

```json
{
  "success": false,
  "error": "mensagem",
  "code": "ERROR_CODE"
}
```

### Códigos de erro

- `INVALID_CPF`  
  CPF inválido ou mal formatado.

- `SCRAPING_FAILED`  
  Falha ao interpretar ou processar a resposta do portal externo.

- `SSW_UNAVAILABLE`  
  O serviço externo não respondeu adequadamente ou excedeu o tempo limite.

- `INTERNAL_ERROR`  
  Falha interna não tratada especificamente.

Observação:

- O tipo `NO_PACKAGES` existe no domínio, mas o comportamento atual da API para ausência de resultados é retornar sucesso com listas vazias.

## Uso em produção

### Deploy

O deploy recomendado é na Vercel, por ser a plataforma mais direta para aplicações Next.js com App Router.

Fluxo sugerido:

1. conectar o repositório à Vercel
2. configurar as variáveis de ambiente
3. executar build de produção
4. publicar a aplicação

### Variáveis de ambiente em produção

Configure pelo menos:

```env
NEXT_PUBLIC_API_URL=https://seu-dominio.com
NEXT_PUBLIC_APP_ENV=production
```

### Cuidados com scraping

Como o projeto depende de scraping em um portal externo, alguns cuidados são importantes:

- mudanças no HTML do SSW podem quebrar o parser
- indisponibilidade do serviço externo impacta a API
- excesso de chamadas pode exigir controle de taxa
- timeouts e falhas transitórias precisam ser monitorados

### Logs e monitoramento

Mesmo em uma aplicação simples, é recomendável observar:

- volume de erros por código
- tempo médio de resposta da rota `/api/tracking`
- falhas recorrentes do serviço externo
- padrões de timeout e indisponibilidade

Em produção, isso pode ser feito com logs estruturados, alertas básicos e integração com ferramentas de observabilidade.

## Decisões técnicas

### Uso de `features/`

A camada `features/` reduz acoplamento entre domínio e componentes genéricos, além de eliminar redundância estrutural. O tracking passou a ter uma fronteira mais clara dentro da interface.

### Separação entre scraper e parser

Scraper e parser têm responsabilidades diferentes:

- scraper busca HTML
- parser transforma HTML em dados de domínio

Isso melhora testabilidade, manutenção e clareza do fluxo.

### Service layer

A camada de service centraliza a lógica de orquestração e impede que a rota Next.js concentre regras de negócio. Com isso, a rota permanece fina e focada em HTTP.

### Configuração centralizada

A camada `config/` evita espalhar `process.env` pelo projeto e torna o acesso a configuração mais previsível e seguro.

## Boas práticas adotadas

- Separação clara de responsabilidades
- Organização por domínio
- Tipagem forte com TypeScript
- Contratos explícitos em `types/`
- Adapter HTTP fino na API
- Componentes reutilizáveis na camada `ui`
- Naming consistente entre pastas e responsabilidades

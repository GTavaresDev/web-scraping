# Scraping Notes

## Endpoint público confirmado

Fluxo observado em 28/03/2026:

1. `GET https://ssw.inf.br/2/rastreamento_pf`
2. `POST https://ssw.inf.br/2/resultSSW_dest`
3. `GET https://ssw.inf.br/2/ssw_SSWDetalhado?id=...&md=...`

## Formato da requisição

### GET inicial

- URL: `https://ssw.inf.br/2/rastreamento_pf`
- Objetivo: descobrir o formulário ativo e extrair campos ocultos.

### POST da busca por CPF

- URL real do formulário: `/2/resultSSW_dest`
- Método: `POST`
- Content-Type: `application/x-www-form-urlencoded`
- Campos observados:
  - `urlori=/2/rastreamento_pf`
  - `rpf=<uuid dinâmico>`
  - `cnpjdest=<cpf apenas números>`

Exemplo:

```text
urlori=%2F2%2Frastreamento_pf&rpf=03d27039-7d8e-4f71-87b2-bc042ceb2ead&cnpjdest=00644516151
```

### GET do detalhe

- URL extraída do HTML da listagem:
  - `/2/ssw_SSWDetalhado?id=<token>&md=<token>`

## Estrutura do HTML de resposta

### Listagem

- A listagem pública retorna uma tabela com linhas clicáveis.
- Cada pacote aparece em um `tr` com `onclick="opx('/2/SSWDetalhado?...')"` e link auxiliar `Mais detalhes`.
- Colunas relevantes:
  - Nota fiscal e pedido
  - Unidade, data e hora do último evento
  - Situação resumida

### Detalhe

- O detalhe retorna outra tabela com:
  - `Destinatário`
  - `N Coleta`
  - `N Fiscal`
  - `N Pedido`
  - tabela de eventos com `Data/Hora`, `Unidade` e `Situação`

## Estratégia de parsing

- Listagem:
  - extração de linhas por regex no HTML bruto do `tr onclick`
  - uso de fragmentos Cheerio por célula para limpar HTML e texto
- Detalhe:
  - uso de Cheerio para localizar rótulos e tabela de eventos

## Regras de derivação de status

- `ENTREGUE`, `ENTREGA REALIZADA`, `MERCADORIA ENTREGUE` → `entregue`
- `SAIDA DE UNIDADE`, `SAIDA PARA ENTREGA`, `EM TRANSITO` → `em_transito`
- `CHEGADA EM UNIDADE`, `CHEGADA EM UNIDADE DE TRANSBORDO` → `em_transferencia`
- `DOCUMENTO DE TRANSPORTE EMITIDO` → `pendente`
- termos contendo `DEVOLV` → `devolvido`
- fallback → slug do texto normalizado

## Quirks e observações

- O enunciado mencionava `/2/ssw_resultSSW`, mas o fluxo público real de PF usa `/2/resultSSW_dest`.
- O campo de CPF no HTML público é `cnpjdest`.
- O campo oculto `rpf` muda por request e precisa ser lido da página antes do POST.
- O detalhe completo não vem na listagem; é necessário fazer uma segunda rodada de requests por pacote.
- Durante a validação local:
  - probes HTTP isolados retornaram a listagem real com pacotes
  - o endpoint `POST /api/tracking` dentro do runtime do Next ainda respondeu payload vazio, então esse ponto permanece como limitação aberta da integração

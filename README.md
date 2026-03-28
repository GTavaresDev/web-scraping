# SSW Tracker

## Visão geral

Aplicação full-stack em Next.js para consultar encomendas do portal público do SSW por CPF. A solução valida o CPF, consulta a listagem pública, tenta montar os detalhes completos de cada pacote e apresenta uma interface em português com busca, listagem e linha do tempo de eventos.

## Stack tecnológica

- Next.js 16 com App Router
- TypeScript em modo `strict`
- Tailwind CSS para toda a camada visual
- Cheerio para parsing de HTML
- Axios como dependência do projeto para a etapa de investigação e comparação do fluxo HTTP
- Route Handlers para a API interna
- Context + `sessionStorage` para cache client-side

## Decisões de arquitetura

- Scraping HTTP direto
  - O portal público do SSW expõe um fluxo acessível via formulário HTML, então a abordagem principal usa requisições HTTP simples, sem browser headless.
- Separação entre scraper, parser e API
  - `src/lib/scraper.ts` cuida da comunicação HTTP.
  - `src/lib/parser.ts` transforma HTML em dados tipados.
  - `src/app/api/tracking/route.ts` orquestra validação, scraping, parsing e resposta JSON.
- Cache client-side
  - O resultado completo é guardado em contexto e `sessionStorage` para evitar novo scrape ao navegar da lista para o detalhe.

## Como rodar localmente

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

Para validar build:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Estrutura do projeto

```text
src/
├── app/
│   ├── api/tracking/route.ts
│   ├── detail/[trackingId]/
│   ├── tracking/[cpf]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── tracking/
│   └── ui/
├── lib/
│   ├── classNames.ts
│   ├── parser.ts
│   ├── scraper.ts
│   ├── types.ts
│   └── validators.ts
└── utils/
    ├── constants.ts
    └── formatters.ts
```

## Documentação da API

### `POST /api/tracking`

Body:

```json
{
  "cpf": "00644516151"
}
```

Resposta de sucesso:

```json
{
  "success": true,
  "data": {
    "packages": [],
    "detailsById": {}
  },
  "scrapedAt": "2026-03-28T03:30:18.493Z"
}
```

Erros possíveis:

- `INVALID_CPF`
- `SCRAPING_FAILED`
- `SSW_UNAVAILABLE`
- `INTERNAL_ERROR`

## Limitações conhecidas

- O fluxo HTTP público real do SSW foi confirmado manualmente e também via probes isolados, mas durante a validação end-to-end do `POST /api/tracking` dentro do runtime do Next o endpoint ainda está retornando payload vazio para o CPF de teste. Isso indica uma divergência específica entre o runtime do app e os probes isolados do scraping.
- O parser foi preparado para HTML real observado em março de 2026. Mudanças estruturais no markup do SSW podem exigir ajuste.
- O campo `pickupDate` usa o valor exposto como `N Coleta` quando presente, porque esse é o dado disponível no HTML público detalhado.

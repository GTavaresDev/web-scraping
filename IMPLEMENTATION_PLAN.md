# Plano de Implementação — SSW Tracker em `web-scraping`

## Resumo
- Usar `web-scraping` como base do desafio.
- Implementar o app com Next + TypeScript + Tailwind, scraping HTTP direto e cache client-side para evitar novo scrape.
- Manter `globals.css` apenas como entrada global do Tailwind.

## Mudanças de Implementação
- Reestruturar o projeto para `src/` e ajustar layout, metadata e aliases.
- Definir tipos em `src/lib/types.ts` usando apenas `type`.
- Implementar `src/lib/validators.ts` com validação real de CPF.
- Implementar `src/lib/scraper.ts` com o fluxo real do SSW:
  - `GET /2/rastreamento_pf`
  - `POST /2/resultSSW_dest`
  - descoberta dos links `/2/ssw_SSWDetalhado?...`
  - `GET` dos detalhes por pacote
- Implementar `src/lib/parser.ts` com parser da listagem e do detalhe.
- Implementar `POST /api/tracking` com respostas tipadas.
- Implementar store client-side com `sessionStorage`.
- Implementar home, lista, detalhe, skeletons e estados de erro.
- Documentar a solução em `README.md` e `SCRAPING_NOTES.md`.

## Sequência de Execução
1. Reestruturar o app e o layout base.
2. Definir tipos e utilitários centrais.
3. Implementar CPF validator.
4. Implementar scraper HTTP.
5. Implementar parser da listagem e do detalhe.
6. Implementar `POST /api/tracking`.
7. Implementar store client-side e fluxo home → lista → detalhe.
8. Polir UX, loading, responsividade e acessibilidade.
9. Finalizar documentação e validações.

## Premissas
- O fluxo público real usa `POST /2/resultSSW_dest` e detalhes em `/2/ssw_SSWDetalhado`.
- O endpoint único vai retornar resumos e detalhes juntos.
- Não haverá scraping headless na primeira versão.

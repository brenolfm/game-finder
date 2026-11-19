# GAME FINDER

Aplicativo web instalável (PWA) para descobrir jogos de PS5, explorar o catálogo PlayStation Plus e receber recomendações.

## Publicação

O GitHub Actions publica automaticamente a pasta raiz no GitHub Pages a cada atualização na branch `main`.

URL: https://brenolfm.github.io/game-finder/

## Biblioteca PS5

A biblioteca geral consulta, por letra, o projeto comunitário [Ephellon/game-store-catalog](https://github.com/Ephellon/game-store-catalog), que publica listas extraídas das lojas digitais. A base consultada informa 10.439 títulos PS5 e data de atualização 17/11/2026. A fonte declara que os dados podem não ser atualizados regularmente; por isso, a presença de um jogo na lista não garante disponibilidade ou preço no Brasil. Sempre confirme na PlayStation Store Brasil.

## Fontes adicionais

- RAWG é opcional. A chave pessoal, se configurada pelo usuário, fica somente no armazenamento local do navegador e não deve ser commitada no GitHub.
- A RAWG exige atribuição e uma chave pessoal própria para cada usuário/projeto. A biblioteca básica de PS5 não depende dela.
- O catálogo PlayStation Plus deve conter apenas títulos verificados para a região Brasil. A lista `catalogo-psplus.json` ainda não é uma sincronização oficial automática.

## Atualizações e cache

As alterações em `main` são publicadas automaticamente pelo GitHub Actions. O service worker guarda a estrutura básica do app; catálogo, imagens e consultas externas exigem conexão com a internet.

## Privacidade e afiliação

Favoritos e chave RAWG ficam armazenados localmente no aparelho. O GAME FINDER é um projeto independente e não é afiliado à Sony Interactive Entertainment.

# GAME FINDER

Aplicativo web instalável (PWA) para descobrir jogos de PS5, explorar o catálogo PlayStation Plus e receber recomendações.

## Publicação

O GitHub Actions publica automaticamente a pasta raiz no GitHub Pages a cada atualização na branch `main`.

URL do aplicativo: https://brenolfm.github.io/game-finder/

## Como atualizar

Faça alterações nos arquivos do repositório e envie para a branch `main`. O workflow **Publicar GAME FINDER no GitHub Pages** fará a publicação automaticamente.

## Dados e privacidade

- A chave RAWG, quando configurada, fica somente no armazenamento local do navegador. Não colocar chaves no repositório.
- A lista do catálogo PS Plus fica em `catalogo-psplus.json` e deve conter somente títulos verificados para a região Brasil.
- O service worker guarda a estrutura básica do aplicativo para abrir a interface mesmo sem conexão. Consultas e imagens externas exigem internet.

O GAME FINDER é um projeto independente, sem afiliação à Sony. Dados de jogos são fornecidos pela RAWG quando conectada.
# GAME FINDER

Aplicativo web instalável (PWA) para explorar jogos de PS5, consultar detalhes adicionais e guardar favoritos.

## Publicação

O GitHub Actions publica automaticamente a branch `main` no GitHub Pages.

URL: https://brenolfm.github.io/game-finder/

## Estrutura

- `index.html`: estrutura semântica da aplicação.
- `styles.css`: sistema visual responsivo, com prioridade para celular.
- `app.js`: navegação, catálogo, recomendações, favoritos, conexões e galeria de capturas in-game via RAWG.
- `sw.js`: cache do shell da aplicação e estratégia offline básica.

## Fontes e limitações

- A biblioteca PS5 consulta por letra o projeto comunitário [Ephellon/game-store-catalog](https://github.com/Ephellon/game-store-catalog). É uma fonte não oficial; a presença de um registro não garante disponibilidade, edição ou preço no Brasil.
- A RAWG é opcional e fornece dados adicionais, incluindo capturas in-game. Ao abrir um jogo da biblioteca, o app pesquisa uma correspondência na RAWG e consulta `/games/{id}/screenshots`. A chave inserida pelo usuário é armazenada no `localStorage` do navegador e enviada diretamente à API nas consultas. Em uma aplicação estática, ela pode ser vista por quem tiver acesso ao navegador e às ferramentas de desenvolvedor. Não há chave embutida no repositório.
- O catálogo brasileiro de PlayStation Plus não está sincronizado nem preenchido com uma lista verificada. A interface deixa isso explícito e direciona à fonte oficial.

## Privacidade e armazenamento

Favoritos e chave RAWG ficam no armazenamento local de cada navegador. Não há conta, servidor próprio, sincronização entre dispositivos ou recuperação automática desses dados. Limpar os dados do navegador pode removê-los.

## Funcionamento offline

O service worker mantém em cache os arquivos principais da interface. A consulta de jogos, detalhes, imagens e fontes externas depende de internet. O modo offline não representa um catálogo completo baixado localmente.

## Auditoria — revisão 2026-11-19

### Correções realizadas nesta revisão
- Interface reorganizada com prioridade para telas pequenas, navegação inferior no celular e navegação em linha no desktop.
- Hierarquia visual, espaçamento, botões e campos padronizados; áreas de toque e foco de teclado melhorados.
- CSS e JavaScript separados do HTML para facilitar manutenção.
- Capas renderizadas como imagens com carregamento tardio e verificação de URL/host.
- Mensagens de erro mais claras para chave inválida, limite da API e falha de conexão.
- Botão de conexão RAWG agora testa a chave antes de salvá-la.
- Recomendações simplificadas para não prometer filtros de duração/cooperativo que não eram aplicados.
- Metadados de catálogo deixam de exibir número/data inventados quando a fonte de metadados falha.
- Tela PS Plus explicita que o catálogo brasileiro ainda não está integrado.

### Pendências conhecidas
- A RAWG continua sendo chamada diretamente do navegador. Para proteger uma chave compartilhada da aplicação, será necessário um proxy/backend com segredo em variável de ambiente e controle de uso. Não é seguro embutir segredo em site estático público.
- A chave da RAWG configurada no navegador não sincroniza entre aparelhos.
- A biblioteca comunitária depende de uma fonte externa e internet; não é a lista oficial nem prova disponibilidade brasileira.
- O aplicativo lê o arquivo `catalogo-psplus.json` para exibir uma lista estruturada (campos esperados: `name`, `platform`, `tier`, `checked_at`). O arquivo permanece vazio até que exista uma fonte brasileira confiável e cada título seja verificado. Não há sincronização oficial automática.
- Favoritos são locais; não há backup, exportação ou sincronização.
- A interface ainda depende de fontes e imagens externas. A instalação PWA não baixa toda a biblioteca para uso offline.
- Recomenda-se validar visualmente em Android real e desktop, além de conferir a execução do GitHub Actions após a publicação.

### Avaliação de risco
- **Crítico para credenciais compartilhadas:** não colocar chave RAWG em arquivos do repositório. A aplicação não faz isso.
- **Médio — dependências externas:** indisponibilidade, mudanças de formato ou limites nas fontes podem interromper a descoberta de jogos.
- **Médio — dados locais:** limpar dados do navegador pode apagar favoritos e chave.
- **Alto para expectativa do usuário:** catálogo PS Plus não está conectado; permanece identificado como pendente em vez de apresentar falsos resultados.

Esta auditoria foi feita por inspeção do código e validação estática. Não equivale a teste completo em todos os modelos de telefone, navegadores ou contas de API.

## Capturas in-game

Ao abrir um título listado na biblioteca ou nos destaques, o aplicativo usa o nome para procurar uma correspondência PS5 na RAWG e carregar até 12 capturas de tela. A galeria aparece dentro da ficha do jogo e permite abrir cada imagem em tamanho maior. É necessário configurar a chave RAWG em Ajustes; se a RAWG não tiver correspondência ou capturas para o título, o app informa isso em vez de inventar imagens. Cada galeria inclui atribuição/link à RAWG.

## Sinopses em português e experiência de coleção

- Ao abrir uma ficha de jogo da RAWG ou um título do catálogo PS5, o GAME FINDER busca a descrição disponível, tenta traduzi-la automaticamente para português e gera um resumo curto para leitura rápida.
- A descrição traduzida e a original ficam disponíveis em seções expansíveis. Quando a tradução não responde, o app informa a falha e mantém uma prévia do texto original.
- A tradução é feita sob demanda por serviços externos sem chave própria; há um provedor alternativo. Esses serviços podem impor limites, mudar ou ficar indisponíveis. O GAME FINDER mantém a navegação e os demais dados mesmo quando a tradução falha.
- Traduções recentes ficam em cache local (até 24 sinopses) para reduzir chamadas repetidas. Uma descrição muito extensa pode ser limitada a um trecho para manter a ficha rápida.
- A tela **Minha biblioteca** permite classificar jogos como **Quero jogar**, **Jogando**, **Zerado** e **Arquivado**, além de continuar usando os favoritos. Esses dados ficam no navegador e não são enviados a um servidor.
- O service worker passou a guardar os arquivos JSON das letras do catálogo PS5 já consultadas. Isso permite reabrir essas partes da biblioteca quando estiver sem internet; letras ainda não visitadas continuam dependendo da primeira conexão.

## Otimizações e limites desta versão

- As fichas e capturas RAWG são reutilizadas em memória durante a sessão para evitar consultas repetidas.
- As capturas sem resultado e falhas temporárias são tratadas de forma diferente, evitando apresentar uma falha de rede como se o jogo não tivesse imagens.
- Fechar a ficha invalida consultas assíncronas antigas, para impedir que uma resposta atrasada altere o jogo que está aberto.
- A tradução automática é baseada em serviços públicos de terceiros; não é uma tradução editorial revisada e pode cometer erros em nomes próprios, termos de fantasia e expressões específicas.
- A coleção e os favoritos continuam locais. Não há login, sincronização entre dispositivos, alertas push de lançamento ou recursos sociais. Esses recursos exigiriam uma arquitetura adicional.

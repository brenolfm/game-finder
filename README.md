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
- O filtro PS Plus usa um recorte de 24 registros PS5 da primeira página da listagem PSNDeals Brasil consultada em 18/11/2026, cruzado com o anúncio oficial brasileiro de novembro. Ele diferencia títulos do Catálogo Extra (incluídos também no Deluxe), clássicos Deluxe e testes por tempo limitado. Não é uma sincronização automática nem representa o catálogo brasileiro completo; a disponibilidade pode mudar.

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
- O filtro PS Plus usa um recorte brasileiro de 24 registros PS5 datado de 18/11/2026; não é catálogo completo nem sincronização oficial.

### Pendências conhecidas
- A RAWG continua sendo chamada diretamente do navegador. Para proteger uma chave compartilhada da aplicação, será necessário um proxy/backend com segredo em variável de ambiente e controle de uso. Não é seguro embutir segredo em site estático público.
- A chave da RAWG configurada no navegador não sincroniza entre aparelhos.
- A biblioteca comunitária depende de uma fonte externa e internet; não é a lista oficial nem prova disponibilidade brasileira.
- O aplicativo lê `catalogo-psplus.json`, com 24 registros PS5 da primeira página da listagem regional PSNDeals consultada em 18/11/2026 e adições do mês confirmadas pelo PlayStation Blog. O recorte não é exaustivo e não há sincronização automática.
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
- A coleção pode ser exportada para um arquivo JSON e importada em outro aparelho. A importação mescla os jogos com os dados existentes; a chave RAWG não entra no backup.
- O service worker passou a guardar os arquivos JSON das letras do catálogo PS5 já consultadas. Isso permite reabrir essas partes da biblioteca quando estiver sem internet; letras ainda não visitadas continuam dependendo da primeira conexão.

## Otimizações e limites desta versão

- As fichas e capturas RAWG são reutilizadas em memória durante a sessão para evitar consultas repetidas.
- As capturas sem resultado e falhas temporárias são tratadas de forma diferente, evitando apresentar uma falha de rede como se o jogo não tivesse imagens.
- Fechar a ficha invalida consultas assíncronas antigas, para impedir que uma resposta atrasada altere o jogo que está aberto.
- A tradução automática é baseada em serviços públicos de terceiros; não é uma tradução editorial revisada e pode cometer erros em nomes próprios, termos de fantasia e expressões específicas.
- A coleção e os favoritos continuam locais. Não há login, sincronização entre dispositivos, alertas push de lançamento ou recursos sociais. Esses recursos exigiriam uma arquitetura adicional.

## Navegação em duas áreas e filtros

- A navegação principal foi simplificada para **Recomendar** e **Todos os jogos**. Os ajustes ficam no botão do cabeçalho; favoritos e progresso foram incorporados à área de biblioteca em um painel recolhível.
- A biblioteca completa carrega os 27 arquivos por letra sob demanda (incluindo títulos que começam por números) e deduplica por ID do produto. A referência comunitária informava 10.439 registros em 17/11/2026.
- O campo de busca atualiza os resultados enquanto o usuário digita, com atraso curto para evitar consultas repetidas, e oferece sugestões de nomes encontrados.
- Filtros disponíveis: nativo PS5 ou PS4 + PS5; recorte PS Plus Deluxe; avaliação mínima RAWG; ordenação A–Z, Z–A, maior nota e menor nota.
- A ordenação por avaliação usa um índice local construído a partir das 160 primeiras correspondências retornadas pela RAWG entre os jogos PS5 mais bem avaliados. Portanto, títulos sem correspondência aparecem sem nota e ficam ao final; isso não equivale a uma nota verificada para os 10.439 jogos.
- O filtro PS Plus é um recorte parcial e datado, não deve ser entendido como a lista completa de jogos incluídos no plano.

# GAME FINDER

Aplicativo web instalável (PWA) para explorar jogos de PS5, consultar detalhes adicionais e guardar favoritos.

## Publicação

O GitHub Actions publica automaticamente a branch `main` no GitHub Pages.

URL: https://brenolfm.github.io/game-finder/

## Estrutura

- `index.html`: estrutura semântica da aplicação.
- `styles.css`: sistema visual responsivo, com prioridade para celular.
- `app.js`: navegação, catálogo, recomendações, favoritos e conexões.
- `sw.js`: cache do shell da aplicação e estratégia offline básica.

## Fontes e limitações

- A biblioteca PS5 consulta por letra o projeto comunitário [Ephellon/game-store-catalog](https://github.com/Ephellon/game-store-catalog). É uma fonte não oficial; a presença de um registro não garante disponibilidade, edição ou preço no Brasil.
- A RAWG é opcional e fornece dados adicionais. A chave inserida pelo usuário é armazenada no `localStorage` do navegador e enviada diretamente à API RAWG nas consultas. Em uma aplicação estática, ela pode ser vista por quem tiver acesso ao navegador e às ferramentas de desenvolvedor. Não há chave embutida no repositório.
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
- O catálogo Extra/Deluxe brasileiro precisa de uma fonte autorizada/confiável, estrutura de atualização e verificação periódica antes de ser apresentado como atualizado.
- Favoritos são locais; não há backup, exportação ou sincronização.
- A interface ainda depende de fontes e imagens externas. A instalação PWA não baixa toda a biblioteca para uso offline.
- Recomenda-se validar visualmente em Android real e desktop, além de conferir a execução do GitHub Actions após a publicação.

### Avaliação de risco
- **Crítico para credenciais compartilhadas:** não colocar chave RAWG em arquivos do repositório. A aplicação não faz isso.
- **Médio — dependências externas:** indisponibilidade, mudanças de formato ou limites nas fontes podem interromper a descoberta de jogos.
- **Médio — dados locais:** limpar dados do navegador pode apagar favoritos e chave.
- **Alto para expectativa do usuário:** catálogo PS Plus não está conectado; permanece identificado como pendente em vez de apresentar falsos resultados.

Esta auditoria foi feita por inspeção do código e validação estática. Não equivale a teste completo em todos os modelos de telefone, navegadores ou contas de API.
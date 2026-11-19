# Auditoria técnica — GAME FINDER

**Data:** 19/11/2026  
**Repositório:** https://github.com/brenolfm/game-finder  
**Aplicativo:** https://brenolfm.github.io/game-finder/

## Escopo verificado

Inspeção do HTML, CSS, JavaScript, manifesto PWA, service worker, arquivo de catálogo PS Plus e fluxo de publicação GitHub Actions. Foi feita validação estática de sintaxe JavaScript/service worker, parsing dos JSONs, referências de IDs do DOM e nomes de funções chamados pelos eventos HTML.

**Limite:** esta revisão não é um teste end-to-end em todos os modelos Android/iOS, nem uma chamada autenticada à RAWG usando a chave salva no navegador. A conferência visual final precisa ocorrer no telefone real.

## Melhorias implementadas

- Layout refeito com prioridade mobile-first: navegação inferior no celular, navegação horizontal no desktop, cartões e campos padronizados e hierarquia visual simplificada.
- Áreas de toque, foco de teclado, textos alternativos das capas e mensagens de estado/erro aprimorados.
- Estrutura separada em `index.html`, `styles.css` e `app.js`.
- Service worker passou a pré-carregar os novos assets e foi atualizado para invalidar o cache antigo.
- Chave RAWG é testada antes de ser salva no armazenamento local.
- Mensagens para chave inválida, bloqueio/limite da API e falha de conexão foram melhoradas.
- Capas de jogos usam hosts HTTPS permitidos e carregamento tardio.
- O questionário foi simplificado: antes perguntava sobre tempo e cooperação, mas a busca não aplicava esses filtros. Agora só oferece o filtro de gênero que realmente é enviado à RAWG.
- A biblioteca deixa de exibir data/contagem de referência inventada quando o arquivo de metadados não responde.
- O catálogo Plus lê `catalogo-psplus.json`, com um recorte de 24 registros PS5 do Brasil consultado em 18/11/2026; a lista é parcial e não se atualiza automaticamente.
- O acesso de instalação PWA permanece disponível em Ajustes.

## Situação por área

| Área | Situação | Observação |
|---|---|---|
| Layout mobile | Revisado | Navegação fixa inferior e cartões adaptáveis; validar no aparelho real |
| Layout desktop | Revisado | Largura e navegação próprias para telas grandes |
| Biblioteca PS5 | Funcional com internet | Depende de fonte comunitária externa |
| Detalhes RAWG | Implementado | Exige chave configurada no navegador |
| Recomendações | Parcial | Usa plataforma, gênero e avaliações disponíveis |
| Favoritos | Funcional localmente | Não sincroniza entre aparelhos |
| PS Plus Brasil | Parcial | Recorte regional de 24 registros recentes; sem integração automática e sem catálogo completo |
| PWA | Configurada | Shell pode ficar em cache; catálogo e dados externos exigem internet |
| Segurança de chave | Adequada para teste local | Não há segredo embutido no repositório; chave no navegador não é segredo de servidor |

## Riscos e pendências

### 1. Chave RAWG e aplicação pública
O site é estático e público. A chave não está no GitHub, mas, quando cadastrada, fica no armazenamento local do navegador e é enviada nas requisições à RAWG. Uma pessoa com acesso ao aparelho e às ferramentas de desenvolvedor pode visualizá-la. Isso é aceitável para teste pessoal, mas não é uma arquitetura segura para distribuir uma chave compartilhada a todos os visitantes. Para produção multiusuário, será necessário um proxy/backend com segredo configurado no servidor, limites de uso e monitoramento.

### 2. Catálogo PlayStation Plus
Não existe integração oficial automática implementada. O arquivo `catalogo-psplus.json` contém um recorte de 24 registros PS5 consultados na primeira página da listagem regional PSNDeals em 18/11/2026, cruzados com o anúncio oficial brasileiro de novembro. Não representa o catálogo inteiro e não se atualiza automaticamente. A próxima etapa requer uma fonte de dados confiável, região Brasil, data de verificação e processo de atualização.

### 3. Fonte da biblioteca PS5
A lista vem de uma base comunitária, não oficial. Pode conter atrasos, duplicidades ou registros sem disponibilidade comercial brasileira. A loja brasileira deve ser usada para confirmar edição, preço e disponibilidade.

### 4. Armazenamento e sincronização
Favoritos e chave ficam no `localStorage` de cada navegador. Limpar dados do site pode apagar essas informações. Não há conta, backup, exportação ou sincronização entre celular e computador.

### 5. Funcionamento offline
A estrutura da aplicação é armazenada em cache, mas a busca, imagens, detalhes e recomendações dependem de internet. Não é um catálogo completo disponível offline.

### 6. Acessibilidade e testes adicionais
A navegação por teclado e os estados de foco foram melhorados. Ainda seria desejável adicionar controle de foco completo ao modal, fechar com tecla Esc e testar leitores de tela, tamanhos de fonte e rotação de tela.

## Resultado dos testes estáticos

- JavaScript da aplicação: sintaxe válida.
- Service worker: sintaxe válida.
- Manifesto PWA: JSON válido.
- Catálogo PS Plus: JSON válido.
- IDs DOM consultados pelo JavaScript: referências verificadas; o botão de favorito do modal é criado dinamicamente.
- Eventos HTML: funções correspondentes presentes.
- Chave RAWG compartilhada anteriormente: não encontrada nos arquivos do repositório.
- GitHub Actions: publicação concluída com sucesso na revisão atual.

## Recomendação de próximos passos

1. Abrir o aplicativo no Android e testar navegação inferior, leitura de cards, modal e campos.
2. Em Ajustes, testar e salvar a chave RAWG nesse navegador.
3. Pesquisar um jogo, abrir detalhes, conferir capturas e favoritar/desfavoritar.
4. Depois, trabalhar na fonte do catálogo Plus Brasil e, se o projeto for distribuído, migrar a RAWG para um proxy de API protegido.


## Adendo — galeria de imagens in-game (19/11/2026)

- A ficha dos títulos da biblioteca PS5 procura uma correspondência na RAWG usando o nome normalizado e o filtro de plataforma PS5.
- Quando encontra uma correspondência confiável, consulta o endpoint de capturas do jogo e mostra até 12 imagens in-game, com abertura em tamanho maior.
- A aplicação mantém as imagens em cache de memória durante a sessão para reduzir chamadas repetidas.
- Se não houver chave configurada, correspondência confiável ou capturas, a ficha mostra uma mensagem explicativa. Não substitui imagens de gameplay por capas.
- A galeria inclui link de atribuição à RAWG.
- A pesquisa e as capturas dependem da chave configurada no navegador e da disponibilidade dos dados na RAWG; títulos pouco conhecidos podem não ter capturas.

## Revisão de experiência e otimização — 18/11/2026

### Melhorias aplicadas

- **Sinopse em português:** a ficha agora tenta localizar a descrição completa na RAWG também para os jogos abertos a partir do catálogo geral de PS5.
- **Resumo primeiro:** a descrição é traduzida automaticamente e reduzida a uma prévia curta; a ficha permite expandir a tradução completa e consultar o texto original.
- **Resiliência da tradução:** há um serviço principal e uma alternativa sem chave própria. Quando ambos falham, a aplicação informa a indisponibilidade e mantém o texto original. A tradução depende de serviços públicos de terceiros e não é garantida.
- **Cache local de tradução:** até 24 sinopses recentes ficam armazenadas no navegador, associadas ao jogo e ao texto de origem.
- **Coleção inspirada em rastreadores de jogos:** a tela Minha biblioteca agora organiza os títulos em Quero jogar, Jogando, Zerados e Arquivados; a lista de favoritos continua disponível.
- **Cache offline do catálogo:** os arquivos JSON das letras já consultadas passam a ser guardados pelo service worker. O modo offline cobre apenas os trechos visitados anteriormente, não todo o catálogo.
- **Requisições reutilizadas:** detalhes e capturas da RAWG ficam em memória durante a sessão para reduzir chamadas duplicadas.
- **Controle de consultas antigas:** trocar ou fechar a ficha invalida respostas assíncronas anteriores.
- **Correções funcionais encontradas na revisão:** foram restabelecidas as rotinas de renderização da coleção e de montagem do questionário, que eram referenciadas pelo aplicativo sem estarem definidas no arquivo da versão revisada.

### Testes realizados nesta revisão

- Sintaxe do app.js: válida após as alterações.
- Sintaxe do sw.js: válida após a alteração do cache.
- IDs estáticos usados pelo JavaScript: conferidos contra o HTML; os IDs criados dinamicamente foram identificados separadamente.
- Funções declaradas: verificada a ausência de nomes duplicados após a limpeza.
- Cache do service worker: versão de shell atualizada para v9; cache de dados externo limitado aos arquivos JSON do catálogo comunitário PS5.
- Não foi possível executar uma sessão autenticada de ponta a ponta com a chave RAWG guardada no navegador do usuário nem testar visualmente em seu Android. A validação final no aparelho continua necessária, especialmente para a tradução externa e para o comportamento offline.

### Limitações mantidas

- O resumo é automático e extrativo, não uma sinopse escrita por um editor ou por um modelo generativo. Pode selecionar frases menos relevantes em descrições muito longas.
- Serviços de tradução gratuitos podem impor limites, responder com erro ou alterar seus endpoints. A aplicação mantém um fallback e não bloqueia o restante da ficha.
- A coleção e os favoritos ficam no armazenamento local do navegador. Há exportação e importação manual em JSON, com mesclagem dos dados; ainda não existe sincronização automática entre dispositivos. Limpar os dados do site sem um backup pode apagá-los.
- Os alertas de lançamento, perfis, avaliações sociais e compartilhamento de coleções do Stash dependem de serviços adicionais e não foram copiados para esta aplicação estática.
- O arquivo catalogo-psplus.json contém um recorte regional de 24 registros PS5 consultados em 18/11/2026; não é uma lista completa nem se atualiza automaticamente.


## Reorganização da biblioteca — 19/11/2026

### Navegação e busca
- Navegação principal reduzida a duas abas: Recomendar e Todos os jogos. Ajustes ficam no cabeçalho; Minha coleção foi movida para um painel recolhível na biblioteca.
- A biblioteca carrega os 27 arquivos do catálogo comunitário por lotes de quatro, deduplica os registros por UUID/URL/nome e permite selecionar uma letra ou pesquisar em tempo real.
- O campo de busca é atualizado automaticamente enquanto o usuário digita e preenche sugestões locais com os nomes encontrados na seleção atual.
- Filtros adicionados: nativo PS5 / PS4 + PS5, recorte PS Plus Deluxe e avaliação mínima RAWG. Ordenação: A–Z, Z–A, maior nota e menor nota.
- A referência de metadados da fonte comunitária indicava 10.439 registros em 17/11/2026. A lista não é uma base oficial da Sony e pode conter alterações, edições ou disponibilidade regional diferentes.

### Avaliações e PS Plus
- A nota RAWG é obtida sob demanda a partir de quatro páginas (até 160 resultados) de jogos PS5 ordenados por avaliação e armazenada localmente por sete dias. A classificação cobre somente os títulos que a RAWG retorna e cujo nome pode ser associado com segurança; os demais ficam sem nota.
- O filtro PS Plus usa 24 registros PS5 da primeira página regional PSNDeals consultada em 18/11/2026, combinados com as adições brasileiras anunciadas oficialmente pela Sony em novembro. A seleção distingue Extra (também incluído no Deluxe), Clássicos Deluxe e Testes Deluxe.
- Limitação: os 24 registros não representam os 596 resultados apontados pela listagem completa do PSNDeals, portanto o filtro Deluxe ainda não é exaustivo. A disponibilidade deve ser confirmada no console e na página da PlayStation Store.
- A avaliação de catálogo não foi chamada nesta revisão com a chave pessoal do usuário, pois ela permanece no armazenamento local do aparelho. A correspondência real e o tempo de carregamento precisam de conferência no telefone.

### Testes estáticos
- Sintaxe JavaScript e service worker: válida.
- Manifesto e JSON PS Plus: parse válidos.
- Funções: sem duplicidades; referências estáticas do DOM resolvidas.
- Interface: duas abas principais e painel de coleção dentro da biblioteca.
- Matching local testado com amostras: Hell Let Loose e Freedom Wars Remastered são reconhecidos no filtro; jogos não cadastrados não aparecem como incluídos na PS Plus.
- O comportamento visual no Android e as chamadas reais à RAWG e aos 27 arquivos externos não foram executados end-to-end nesta sessão.


## Ajustes finais da reorganização — 19/11/2026

- A aba Recomendar mostra uma indicação principal por vez e permite avançar para outra sugestão sem refazer o questionário.
- A ordenação por menor nota consulta resultados RAWG em ordem ascendente, não apenas a inversão dos títulos mais bem avaliados.
- As correspondências entre nomes do catálogo e notas RAWG ficam em cache de memória por modo de ordenação, evitando recalcular a mesma comparação em cada passo do sort.
- Os cards da biblioteca mostram rótulos explícitos: Extra + Deluxe, Clássico Deluxe ou Teste Deluxe.
- O cache do shell PWA foi atualizado para v12 após as mudanças na interface e no aplicativo.

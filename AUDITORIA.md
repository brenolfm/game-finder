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
- O catálogo Plus agora lê `catalogo-psplus.json`; permanece vazio até haver dados regionais verificados.
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
| PS Plus Brasil | Pendente | Arquivo vazio; sem API oficial sincronizada |
| PWA | Configurada | Shell pode ficar em cache; catálogo e dados externos exigem internet |
| Segurança de chave | Adequada para teste local | Não há segredo embutido no repositório; chave no navegador não é segredo de servidor |

## Riscos e pendências

### 1. Chave RAWG e aplicação pública
O site é estático e público. A chave não está no GitHub, mas, quando cadastrada, fica no armazenamento local do navegador e é enviada nas requisições à RAWG. Uma pessoa com acesso ao aparelho e às ferramentas de desenvolvedor pode visualizá-la. Isso é aceitável para teste pessoal, mas não é uma arquitetura segura para distribuir uma chave compartilhada a todos os visitantes. Para produção multiusuário, será necessário um proxy/backend com segredo configurado no servidor, limites de uso e monitoramento.

### 2. Catálogo PlayStation Plus
Não existe integração oficial automática implementada. O arquivo `catalogo-psplus.json` está vazio. A seção não inventa resultados e direciona à fonte oficial. A próxima etapa requer uma fonte de dados confiável, região Brasil, data de verificação e processo de atualização.

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
- O arquivo catalogo-psplus.json permanece sem dados regionais verificados; esta revisão não altera a situação da seção PS Plus.

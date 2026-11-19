
const KEY='gf_rawg_key',FAV='gf_favorites',PLUS='gf_plus',COLL='gf_collection',TRANS='gf_translations';const CATALOG_BASE='https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/ps5/';const PAGE_SIZE=24;let pageNo=1,maxPage=1,answers={},activeGame=null,installPrompt=null,catalogCache={},catalogMeta=null,catalogCurrent=[],catalogById={},activeStoreGame=null,plusCatalog=null,plusCatalogPromise=null,detailToken=0,rawgSearchCache={},rawgScreenshotCache={},rawgDetailsCache={},collectionFilter='all';
const $=id=>document.getElementById(id),key=()=>localStorage.getItem(KEY)||'';
function go(id){
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===id));
 document.querySelectorAll('.nav button').forEach(x=>{const active=x.dataset.v===id;x.classList.toggle('active',active);if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});
 if(id==='saved')renderFav();if(id==='plus')loadPlusCatalog().then(renderPlus);if(id==='settings')$('apiKey').value=key();if(id==='library'&&!$('results').dataset.loaded)searchGames(true);
 window.scrollTo({top:0,behavior:'smooth'});
}
function api(path,params){
 if(!key())throw Error('Adicione sua chave RAWG em Ajustes.');
 const u=new URL('https://api.rawg.io/api'+path);
 u.searchParams.set('key',key());
 Object.keys(params||{}).forEach(k=>{if(params[k]!==undefined&&params[k]!==null&&params[k]!=='')u.searchParams.set(k,params[k])});
 return fetch(u,{headers:{Accept:'application/json'}}).then(r=>{
  if(!r.ok){if(r.status===401||r.status===403)throw Error('A RAWG recusou a chave. Confira a chave e os limites da sua conta.');if(r.status===429)throw Error('Limite de consultas da RAWG atingido. Tente novamente mais tarde.');throw Error('A RAWG respondeu com erro ('+r.status+').')}
  return r.json();
 }).catch(e=>{if(e.name==='TypeError')throw Error('Não foi possível conectar à RAWG. Confira sua internet.');throw e});
}
async function saveKey(){
 const v=$('apiKey').value.trim();
 if(!v){$('keyMsg').textContent='Cole sua chave antes de testar.';return}
 $('keyMsg').textContent='Testando a conexão com a RAWG…';
 try{
  const u=new URL('https://api.rawg.io/api/games');
  u.searchParams.set('key',v);u.searchParams.set('platforms','187');u.searchParams.set('page_size','1');
  const r=await fetch(u,{headers:{Accept:'application/json'}});
  if(!r.ok)throw Error(r.status===401||r.status===403?'A RAWG não aceitou essa chave. Confira se ela está ativa.':r.status===429?'Limite de consultas atingido.':'Erro da RAWG ('+r.status+').');
  localStorage.setItem(KEY,v);
  $('keyMsg').textContent='Conexão testada e chave salva somente neste navegador.';
  $('status').textContent='● RAWG conectada';
 }catch(e){$('keyMsg').textContent=e.message||'Não foi possível testar a chave.'}
}
function toggleKey(){$('apiKey').type=$('apiKey').type==='password'?'text':'password'}
function removeKey(){localStorage.removeItem(KEY);$('apiKey').value='';$('keyMsg').textContent='Chave removida deste navegador.';$('status').textContent='● Catálogo PS5 pronto'}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeImage(value){
 const raw=String(value||'').trim();
 return /^https:\/\/(?:media\.rawg\.io|image\.api\.playstation\.com)\//i.test(raw)?raw:'';
}
function safeLink(value){try{const u=new URL(String(value||''));return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function plainDescription(value){
 return String(value||'').replace(/<br\s*\/?>/gi,' ').replace(/<\/p\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
}
function hashText(value){
 let hash=2166136261;
 for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}
 return (hash>>>0).toString(36);
}
function readObject(keyName){
 try{const value=JSON.parse(localStorage.getItem(keyName)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}
}
function saveTranslationCache(cacheKey,value){
 try{
  const cache=readObject(TRANS);cache[cacheKey]={...value,savedAt:Date.now()};
  const entries=Object.entries(cache).sort((a,b)=>(b[1].savedAt||0)-(a[1].savedAt||0)).slice(0,24);
  localStorage.setItem(TRANS,JSON.stringify(Object.fromEntries(entries)));
 }catch(e){/* cache is optional; translation still appears in this session */}
}
function splitTranslationChunks(value,maxLength=430){
 const chunks=[];let rest=value;
 while(rest.length){
  let cut=Math.min(maxLength,rest.length);
  if(cut<rest.length){
   const boundary=Math.max(rest.lastIndexOf('. ',cut),rest.lastIndexOf('! ',cut),rest.lastIndexOf('? ',cut),rest.lastIndexOf(' ',cut));
   if(boundary>Math.floor(maxLength*.55))cut=boundary+1;
  }
  chunks.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trim();
 }
 return chunks.filter(Boolean);
}
async function googleTranslate(text){
 const url=new URL('https://translate.googleapis.com/translate_a/single');
 url.searchParams.set('client','gtx');url.searchParams.set('sl','auto');url.searchParams.set('tl','pt');url.searchParams.set('dt','t');url.searchParams.set('q',text);
 const response=await fetch(url,{headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('Serviço de tradução indisponível ('+response.status+').');
 const data=await response.json();
 const translated=Array.isArray(data)&&Array.isArray(data[0])?data[0].map(part=>part&&part[0]||'').join(''):'';
 if(!translated.trim())throw Error('A tradução não retornou texto.');
 return translated;
}
async function myMemoryTranslate(text){
 const chunks=splitTranslationChunks(text,400),translated=[];
 for(const chunk of chunks){
  const url=new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q',chunk);url.searchParams.set('langpair','en|pt-BR');
  const response=await fetch(url,{headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('O serviço alternativo de tradução não respondeu.');
  const data=await response.json(),value=data&&data.responseData&&data.responseData.translatedText;
  if(!value||String(value).toLowerCase().includes('quota exceeded'))throw Error('Limite diário do serviço alternativo atingido.');
  translated.push(String(value).replace(/&#39;|&apos;/gi,"'").replace(/&quot;/gi,'"').replace(/&amp;/gi,'&'));
 }
 return translated.join(' ');
}
async function translateSynopsisText(text){
 try{return await googleTranslate(text)}catch(primaryError){
  try{return await myMemoryTranslate(text)}catch(secondaryError){
   throw Error('Não foi possível traduzir agora. A tradução automática depende de serviços externos; a sinopse original continua disponível.');
  }
 }
}
function summarizeSynopsis(value){
 const text=String(value||'').replace(/\s+/g,' ').trim();
 if(text.length<=430)return text;
 const stop=new Set('a ao aos as com como da das de do dos e ela ele em entre era essa esse esta este foi foram há isso mais mas na nas no nos o os ou para pela pelas pelo pelos por que se sem ser sua suas seu seus um uma uns umas você'.split(' '));
 const sentences=(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(x=>x.trim()).filter(x=>x.length>35);
 if(!sentences.length)return text.slice(0,420).replace(/\s+\S*$/,'')+'…';
 const frequency={};
 text.toLowerCase().match(/[a-záàâãéêíóôõúç]{4,}/g)?.forEach(word=>{if(!stop.has(word))frequency[word]=(frequency[word]||0)+1});
 const priority=['jogador','jogadores','mundo','aventura','história','missão','sobreviver','explorar','enfrentar','personagem','reino','guerra','mistério','descobrir','você','poderá','desafio'];
 const ranked=sentences.map((sentence,index)=>{
  const words=sentence.toLowerCase().match(/[a-záàâãéêíóôõúç]{4,}/g)||[];
  let score=words.reduce((sum,word)=>sum+Math.min(frequency[word]||0,4),0)/Math.max(words.length,1);
  score+=priority.reduce((sum,word)=>sum+(sentence.toLowerCase().includes(word)?1.5:0),0);
  if(index===0)score+=2.5;
  if(sentence.length>260)score-=2;
  return {sentence,index,score};
 }).sort((a,b)=>b.score-a.score);
 const chosen=[];let length=0;
 for(const item of ranked){
  if(chosen.length>=3)break;
  if(length+item.sentence.length+(chosen.length?1:0)>430)continue;
  chosen.push(item);length+=item.sentence.length+1;
 }
 let summary=chosen.sort((a,b)=>a.index-b.index).map(x=>x.sentence).join(' ');
 if(summary.length<150){
  summary=text.slice(0,420).replace(/\s+\S*$/,'')+'…';
 }
 return summary;
}
function synopsisMarkup(summary,translated,original,wasTrimmed,translatedOK){
 if(!translatedOK){
  return '<div class="synopsis-card"><div class="synopsis-heading"><b>PRÉVIA DA SINOPSE</b><span class="chip">Original</span></div><p class="synopsis-summary">'+esc(summary)+'</p><div class="notice">A tradução automática não respondeu desta vez. Você ainda pode ler a descrição original abaixo.</div><details class="synopsis-details"><summary>Ver descrição original</summary><p>'+esc(original)+'</p></details></div>';
 }
 return '<div class="synopsis-card"><div class="synopsis-heading"><b>RESUMO DO JOGO</b><span class="chip">Português · tradução automática</span></div><p class="synopsis-summary">'+esc(summary)+'</p><details class="synopsis-details"><summary>Ver descrição completa traduzida</summary><p>'+esc(translated)+'</p>'+(wasTrimmed?'<p class="fineprint muted">A descrição original era maior; foi traduzido um trecho para manter a ficha rápida.</p>':'')+'</details><details class="synopsis-details"><summary>Ver texto original</summary><p>'+esc(original)+'</p></details><p class="fineprint muted">Tradução automática. Pequenos erros de termos e nomes próprios podem ocorrer.</p></div>';
}
async function loadTranslatedSynopsis(game,targetId,token){
 const target=$(targetId);if(!target)return;
 const original=plainDescription(game&& (game.description_raw||game.description));
 if(!original){target.innerHTML='<div class="empty">A RAWG não possui uma sinopse para este jogo.</div>';return}
 const source=original.slice(0,3200),cacheKey=String(game.id||game.slug||game.name)+':'+hashText(source);
 const cache=readObject(TRANS),cached=cache[cacheKey];
 if(cached&&cached.translated){
  if(token===detailToken&&$(targetId))target.innerHTML=synopsisMarkup(cached.summary,cached.translated,original,original.length>source.length,true);
  return;
 }
 target.innerHTML='<div class="synopsis-card"><div class="synopsis-heading"><b>RESUMO DO JOGO</b><span class="chip">Preparando em português…</span></div><p class="muted">Traduzindo e resumindo a sinopse automaticamente.</p></div>';
 try{
  const translated=await translateSynopsisText(source);
  if(token!==detailToken||!$(targetId))return;
  const summary=summarizeSynopsis(translated);
  saveTranslationCache(cacheKey,{translated,summary});
  $(targetId).innerHTML=synopsisMarkup(summary,translated,original,original.length>source.length,true);
 }catch(error){
  if(token!==detailToken||!$(targetId))return;
  const fallback=summarizeSynopsis(original);
  $(targetId).innerHTML=synopsisMarkup(fallback,'',original,original.length>source.length,false);
 }
}
function collectionStatusFor(id){
 const item=read(COLL).find(x=>String(x.id)===String(id));
 return item&&item.status||'';
}
function collectionControlsHTML(id){
 const current=collectionStatusFor(id);
 const options=[['','Não está na coleção'],['want','Quero jogar'],['playing','Jogando'],['beaten','Zerado'],['archived','Arquivado']];
 return '<div class="collection-box"><label for="collectionStatus">Minha lista</label><div class="collection-control"><select id="collectionStatus">'+options.map(([value,label])=>'<option value="'+value+'"'+(current===value?' selected':'')+'>'+label+'</option>').join('')+'</select><button class="btn small primary" type="button" onclick="saveActiveCollection()">Salvar</button></div><p id="collectionMessage" class="fineprint muted" aria-live="polite">Organize seu progresso neste aparelho.</p></div>';
}
function saveActiveCollection(){
 const game=activeStoreGame||activeGame;
 if(!game){return}
 const isStore=!!activeStoreGame,id=isStore?'psn:'+String(game.uuid||''):String(game.id||'');
 if(!id||id==='psn:')return;
 const status=$('collectionStatus')&&$('collectionStatus').value||'';
 let list=read(COLL).filter(item=>String(item.id)!==id);
 if(status){
  list.push({id,name:game.name||'Jogo sem título',background_image:isStore?(game.image||''):(game.background_image||''),status,platform:'PS5',storeURL:isStore?'https://store.playstation.com/pt-br/product/'+encodeURIComponent(game.uuid):'',source:isStore?'PS5':'RAWG',updatedAt:Date.now()});
 }
 try{localStorage.setItem(COLL,JSON.stringify(list))}catch(e){const msg=$('collectionMessage');if(msg)msg.textContent='O armazenamento deste navegador está cheio. Não foi possível salvar.';return}
 const msg=$('collectionMessage');
 if(msg)msg.textContent=status?'Adicionado à sua coleção: '+({want:'Quero jogar',playing:'Jogando',beaten:'Zerado',archived:'Arquivado'}[status])+'.':'Removido da sua coleção.';
 renderFav();
}
function collectionCard(item){
 const id=String(item.id||''),image=safeImage(item.background_image),label=({want:'Quero jogar',playing:'Jogando',beaten:'Zerado',archived:'Arquivado'}[item.status]||'Favorito');
 const body='<div class="poster">'+(image?'<img class="cover" src="'+esc(image)+'" alt="Capa de '+esc(item.name)+'" loading="lazy">':'<span class="cover-fallback">PS5</span>')+'</div><div class="cardbody"><h3>'+esc(item.name)+'</h3><div class="chips"><span class="chip">'+esc(label)+'</span>'+(item.rating?'<span class="chip">★ '+Number(item.rating).toFixed(1)+'</span>':'')+'</div></div>';
 if(id.startsWith('psn:')&&safeLink(item.storeURL))return '<a class="card card-link" href="'+esc(item.storeURL)+'" target="_blank" rel="noopener noreferrer">'+body+'</a>';
 const numeric=Number(id);
 if(Number.isFinite(numeric)&&numeric>0)return '<article class="card" role="button" tabindex="0" onclick="detailGame('+numeric+')" onkeydown="if(event.key===\'Enter\'){detailGame('+numeric+')}">'+body+'</article>';
 return '<article class="card">'+body+'</article>';
}
function showCards(id,arr){$(id).innerHTML=arr&&arr.length?arr.map(card).join(''):'<div class="empty">Nenhum jogo encontrado.</div>'}
async function loadCatalogMeta(){
 if(catalogMeta)return catalogMeta;
 try{const r=await fetch(CATALOG_BASE+'$.json',{cache:'no-cache'});if(!r.ok)throw Error('metadados indisponíveis');catalogMeta=await r.json()}
 catch(e){catalogMeta={size:null,date:null}}
 return catalogMeta;
}
async function loadCatalogLetter(letter){if(catalogCache[letter])return catalogCache[letter];const file=(letter==='_')?'_.json':letter+'.json';const r=await fetch(CATALOG_BASE+file,{cache:'no-cache'});if(!r.ok)throw Error('Não foi possível consultar a base externa ('+r.status+'). Tente novamente em instantes.');const data=await r.json();if(!Array.isArray(data))throw Error('A fonte retornou um formato inesperado.');catalogCache[letter]=data.filter(g=>g&&g.name&&Array.isArray(g.platforms)&&g.platforms.includes('PS5'));return catalogCache[letter]}
function renderCatalogPage(){const arr=catalogCurrent.slice((pageNo-1)*PAGE_SIZE,pageNo*PAGE_SIZE);$('results').innerHTML=arr.length?arr.map(catalogCard).join(''):'<div class="empty">Nenhum jogo encontrado nesta letra. Confira a busca ou escolha outra letra.</div>';$('pageInfo').textContent='Página '+pageNo+' de '+maxPage;$('prev').disabled=pageNo<=1;$('next').disabled=pageNo>=maxPage}
async function searchGames(reset){
 if(reset)pageNo=1;
 const term=($('search').value||'').trim();let letter=$('letter').value||'a';
 if(term){const first=term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toLowerCase();letter=/[a-z]/.test(first)?first:'_';$('letter').value=letter}
 $('results').innerHTML='<div class="empty">Carregando catálogo de PS5…</div>';$('count').textContent='Consultando a fonte…';
 try{
  const [meta,data]=await Promise.all([loadCatalogMeta(),loadCatalogLetter(letter)]);
  const q=term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  catalogCurrent=data.filter(g=>!q||g.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
  catalogCurrent.sort((a,b)=>$('order').value==='-name'?b.name.localeCompare(a.name,'pt-BR'):a.name.localeCompare(b.name,'pt-BR'));
  maxPage=Math.max(1,Math.ceil(catalogCurrent.length/PAGE_SIZE));pageNo=Math.min(pageNo,maxPage);
  const updated=meta.date&&Number.isFinite(Date.parse(meta.date))?' · atualização: '+new Date(meta.date).toLocaleDateString('pt-BR'):'';
  const total=meta.size?(' · base: '+Number(meta.size).toLocaleString('pt-BR')):'';
  $('count').textContent=catalogCurrent.length.toLocaleString('pt-BR')+' títulos nesta busca'+total+updated;
  $('results').dataset.loaded='true';$('status').textContent='● Catálogo PS5 conectado';renderCatalogPage();
 }catch(e){$('results').innerHTML='<div class="empty">'+esc(e.message)+'</div>';$('count').textContent='Não foi possível carregar';$('status').textContent='● Fonte indisponível'}
}

function page(n){pageNo=Math.max(1,Math.min(maxPage,pageNo+n));renderCatalogPage();window.scrollTo({top:0,behavior:'smooth'})}

async function detailGame(id){
 const token=++detailToken;activeStoreGame=null;
 $('modal').classList.add('open');$('detail').innerHTML='<div class="empty">Carregando ficha e capturas…</div>';
 try{
  const [g,shotData]=await Promise.all([
   api('/games/'+id,{}),
   api('/games/'+id+'/screenshots',{page_size:8}).catch(()=>({results:[]}))
  ]);
  if(token!==detailToken)return;
  activeGame=g;
  const shots=shotData.results||[],website=safeLink(g.website),favorite=read(FAV).some(x=>String(x.id)===String(g.id));
  const shotHtml=shots.map(x=>{const img=safeImage(x.image);return img?'<a target="_blank" rel="noopener" href="'+esc(img)+'"><img src="'+esc(img)+'" alt="Captura de '+esc(g.name)+'" loading="lazy"></a>':''}).join('');
  $('detail').innerHTML='<h2>'+esc(g.name)+'</h2><div class="chips"><span class="chip">★ '+(g.rating||'—')+'</span><span class="chip">Metacritic '+(g.metacritic||'—')+'</span><span class="chip">'+esc(g.released||'Data não informada')+'</span></div><h3 class="section-subtitle">Sinopse</h3><div id="gameSynopsis" aria-live="polite"><div class="empty">Preparando sinopse em português…</div></div>'+collectionControlsHTML(g.id)+'<p class="muted">Gêneros: '+esc((g.genres||[]).map(x=>x.name).join(', ')||'Não informado')+'</p><p class="muted">Plataformas: '+esc((g.platforms||[]).map(x=>x.platform.name).join(', ')||'Não informado')+'</p><div class="row"><button class="btn primary" id="detailFavorite" onclick="toggleFav(activeGame)">'+(favorite?'♥ Salvo nos favoritos':'♡ Salvar nos favoritos')+'</button>'+(website?'<a class="btn" href="'+esc(website)+'" target="_blank" rel="noopener">Site oficial ↗</a>':'')+'</div><h3 class="section-subtitle">Imagens do jogo</h3><div class="screens">'+(shotHtml||'<p class="muted">Nenhuma captura disponível.</p>')+'</div><p class="fineprint muted">Detalhes e imagens fornecidos pela RAWG. Confira a loja e a edição antes de comprar.</p>';
  loadTranslatedSynopsis(g,'gameSynopsis',token);
 }catch(e){if(token===detailToken)$('detail').innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
function closeDetail(){detailToken++;$('modal').classList.remove('open')}
function read(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return []}}
function renderFav(){
 const favorites=read(FAV),collection=read(COLL),map=new Map();
 favorites.forEach(item=>map.set(String(item.id),{...item,isFavorite:true}));
 collection.forEach(item=>map.set(String(item.id),{...(map.get(String(item.id))||{}),...item,isFavorite:!!(map.get(String(item.id))||{}).isFavorite}));
 const all=[...map.values()];
 const filters={all:'Todos',want:'Quero jogar',playing:'Jogando',beaten:'Zerados',archived:'Arquivados',favorites:'Favoritos'};
 const filtered=all.filter(item=>collectionFilter==='all'||(collectionFilter==='favorites'?item.isFavorite:item.status===collectionFilter));
 const filtersNode=$('collectionFilters');
 if(filtersNode)filtersNode.innerHTML=Object.entries(filters).map(([keyName,label])=>'<button class="filter-chip'+(collectionFilter===keyName?' active':'')+'" type="button" onclick="setCollectionFilter(\''+keyName+'\')">'+label+'</button>').join('');
 const totalBeaten=collection.filter(x=>x.status==='beaten').length,totalPlaying=collection.filter(x=>x.status==='playing').length;
 const stats=$('collectionStats');
 if(stats)stats.textContent=collection.length+' na coleção · '+totalPlaying+' em andamento · '+totalBeaten+' zerados · '+favorites.length+' favoritos';
 const target=$('favorites');
 if(target)target.innerHTML=filtered.length?filtered.map(collectionCard).join(''):'<div class="empty">Sua lista está vazia por aqui. Abra um jogo e adicione-o à sua coleção.</div>';
}
function setCollectionFilter(filter){collectionFilter=filter;renderFav();}
function toggleFav(g){
 if(!g)return;
 let arr=read(FAV);
 if(arr.some(x=>x.id===g.id))arr=arr.filter(x=>x.id!==g.id);
 else arr.push({id:g.id,name:g.name,background_image:g.background_image,rating:g.rating,genres:g.genres||[]});
 localStorage.setItem(FAV,JSON.stringify(arr));renderFav();
 const button=$('detailFavorite');
 if(button)button.textContent=arr.some(x=>x.id===g.id)?'♥ Salvo nos favoritos':'♡ Salvar nos favoritos';
}
function buildQuestions(){
 const choices=[
  ['action','Ação'],['adventure','Aventura'],['role-playing-games','RPG'],['shooter','Tiro'],['sports','Esportes'],['racing','Corrida'],['strategy','Estratégia'],['indie','Indie'],['puzzle','Quebra-cabeça']
 ];
 const target=$('questions');if(!target)return;
 target.innerHTML='<div class="q"><b>Qual estilo combina com você agora?</b><div class="choices">'+choices.map(([value,label])=>'<button class="choice'+(answers.mood===value?' selected':'')+'" data-q="mood" data-v="'+value+'" type="button" onclick="pick(this)">'+label+'</button>').join('')+'</div><p class="helper muted">Você pode escolher um gênero ou deixar sem filtro para receber sugestões variadas.</p></div>';
}
function pick(b){answers[b.dataset.q]=b.dataset.v;document.querySelectorAll('[data-q="'+b.dataset.q+'"]').forEach(x=>x.classList.toggle('selected',x===b))}
function resetQ(){answers={};buildQuestions();$('recommendations').innerHTML=''}
async function recommend(){
 if(!key()){
  $('recommendations').innerHTML='<div class="info">Para montar recomendações com dados da RAWG, conecte sua chave em Ajustes. A biblioteca geral continua disponível sem chave.</div><div class="row"><button class="btn primary" onclick="go(\'settings\')">Configurar RAWG</button><button class="btn" onclick="go(\'library\')">Explorar a biblioteca</button></div>';return;
 }
 $('recommendations').innerHTML='<div class="empty">Buscando recomendações…</div>';
 try{
  const params={platforms:'187',page_size:30,ordering:'-rating'};
  if(answers.mood)params.genres=answers.mood;
  const d=await api('/games',params);
  const arr=(d.results||[]).slice(0,8);
  $('recommendations').innerHTML='<div class="result-heading"><h3>Jogos para explorar</h3><p class="sub">'+(answers.mood?'Gênero selecionado: '+esc(answers.mood.replaceAll('-',' ')):'Seleção geral de PS5')+'</p></div><div class="grid">'+(arr.length?arr.map(card).join(''):'<div class="empty">A RAWG não retornou resultados para esse filtro.</div>')+'</div><p class="fineprint muted">Sugestões baseadas nos dados de gênero e avaliação retornados pela RAWG. Confira informações e disponibilidade na loja.</p>';
 }catch(e){$('recommendations').innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
async function loadPlusCatalog(){
 if(plusCatalogPromise)return plusCatalogPromise;
 plusCatalogPromise=fetch('./catalogo-psplus.json',{cache:'no-cache'}).then(r=>{
  if(!r.ok)throw Error('Lista PS Plus local indisponível.');
  return r.json();
 }).then(data=>{
  plusCatalog=Array.isArray(data)?data:[];
  return plusCatalog;
 }).catch(()=>{plusCatalog=[];return plusCatalog});
 return plusCatalogPromise;
}
function renderPlus(){
 const source=plusCatalog&&plusCatalog.length?plusCatalog:read(PLUS);
 const q=($('psSearch').value||'').toLowerCase(),tier=$('psTier').value,plat=$('psPlatform').value;
 const filtered=source.filter(x=>(!q||String(x.name||'').toLowerCase().includes(q))&&(!tier||x.tier===tier)&&(!plat||x.platform===plat));
 $('plusList').innerHTML=filtered.length?filtered.map(x=>'<article class="card"><div class="cardbody"><h3>'+esc(x.name)+'</h3><div class="chips"><span class="chip">'+esc(x.platform)+'</span><span class="chip">'+esc(x.tier)+'</span></div><p>Verificado em: '+esc(x.checked_at||'—')+'</p></div></article>'):'<div class="empty">A lista brasileira ainda não foi cadastrada e validada. Nenhum jogo será marcado como incluído sem confirmação regional.</div>';
}
async function installApp(){if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else alert('No Chrome: menu ⋮ > Instalar app ou Adicionar à tela inicial. No Samsung Internet: menu ☰ > Adicionar página a > Tela inicial.')}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
buildQuestions();loadFeatured();loadPlusCatalog().then(renderPlus);renderFav();if(key())$('status').textContent='● RAWG configurada';else $('status').textContent='● Catálogo PS5 pronto';
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('modal').classList.contains('open'))closeDetail()});

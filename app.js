
const KEY='gf_rawg_key',FAV='gf_favorites',PLUS='gf_plus';const CATALOG_BASE='https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/ps5/';const PAGE_SIZE=24;let pageNo=1,maxPage=1,answers={},activeGame=null,installPrompt=null,catalogCache={},catalogMeta=null,catalogCurrent=[],catalogById={},activeStoreGame=null,plusCatalog=null,plusCatalogPromise=null;
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
function card(g){
 const image=safeImage(g.background_image),id=Number(g.id);
 return '<article class="card" role="button" tabindex="0" onclick="detailGame('+id+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();detailGame('+id+')}"><div class="poster">'+(image?'<img class="cover" src="'+esc(image)+'" alt="Capa de '+esc(g.name)+'" loading="lazy">':'<span class="cover-fallback">GAME FINDER</span>')+'</div><div class="cardbody"><h3>'+esc(g.name)+'</h3><div class="chips"><span class="chip">★ '+(g.rating?Number(g.rating).toFixed(1):'—')+'</span><span class="chip">'+esc((g.genres||[]).slice(0,1).map(x=>x.name).join('')||'PS5')+'</span></div><p>'+esc(g.description_raw||'Abra a ficha para consultar os detalhes e as imagens disponíveis.')+'</p></div></article>';
}
function catalogCard(g){
 const id=String(g.uuid||'').replace(/[^A-Za-z0-9_-]/g,'');if(!id)return '';
 catalogById[id]=g;const image=safeImage(g.image);
 return '<article class="card" role="button" tabindex="0" onclick="showCatalogDetail(\''+id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();showCatalogDetail(\''+id+'\')}"><div class="poster">'+(image?'<img class="cover" src="'+esc(image)+'" alt="Capa de '+esc(g.name)+'" loading="lazy">':'<span class="cover-fallback">PS5</span>')+'</div><div class="cardbody"><h3>'+esc(g.name)+'</h3><div class="chips"><span class="chip">PS5</span><span class="chip">PlayStation Store</span></div><p>Consulte edição e disponibilidade na loja brasileira.</p></div></article>';
}
function showCatalogDetail(id){
 const g=catalogById[id];if(!g)return;activeStoreGame=g;
 const image=safeImage(g.image),href='https://store.playstation.com/pt-br/product/'+encodeURIComponent(g.uuid);
 const saved=read(FAV).some(x=>x.id==='psn:'+id);
 $('modal').classList.add('open');
 $('detail').innerHTML='<h2>'+esc(g.name)+'</h2>'+(image?'<img class="detail-cover" src="'+esc(image)+'" alt="Capa de '+esc(g.name)+'">':'')+'<div class="chips"><span class="chip">PlayStation 5</span><span class="chip">Catálogo geral</span></div><p>Este registro identifica um título listado para PS5 na base comunitária consultada. Confirme disponibilidade, edição e preço diretamente na loja brasileira.</p><div class="row"><button class="btn primary" onclick="toggleStoreFav()">'+(saved?'♥ Remover dos favoritos':'♡ Favoritar')+'</button><a class="btn" href="'+esc(href)+'" target="_blank" rel="noopener">Ver na PlayStation Store ↗</a></div><p class="muted fineprint">Fonte comunitária. A presença nesta lista não garante venda ou disponibilidade no Brasil.</p>';
}
function toggleStoreFav(){if(!activeStoreGame)return;const id='psn:'+String(activeStoreGame.uuid||'');let arr=read(FAV);if(arr.some(x=>x.id===id))arr=arr.filter(x=>x.id!==id);else arr.push({id,name:activeStoreGame.name,background_image:activeStoreGame.image||'',storeURL:'https://store.playstation.com/pt-br/product/'+encodeURIComponent(activeStoreGame.uuid),source:'PS5'});localStorage.setItem(FAV,JSON.stringify(arr));showCatalogDetail(String(activeStoreGame.uuid).replace(/[^A-Za-z0-9_-]/g,''))}
function favoriteCatalogCard(g){
 const image=safeImage(g.background_image),href=safeLink(g.storeURL);
 const content='<div class="poster">'+(image?'<img class="cover" src="'+esc(image)+'" alt="Capa de '+esc(g.name)+'" loading="lazy">':'<span class="cover-fallback">PS5</span>')+'</div><div class="cardbody"><h3>'+esc(g.name)+'</h3><span class="chip">PS5 · Favorito</span></div>';
 return href?'<a class="card card-link" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+content+'</a>':'<article class="card">'+content+'</article>';
}


async function loadFeatured(){
 const target=$('featured');if(!target)return;
 target.innerHTML='<div class="empty">Carregando capas dos jogos…</div>';
 try{
  const response=await fetch('./destaques.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Não foi possível carregar os jogos em destaque.');
  const items=await response.json();
  const valid=Array.isArray(items)?items.filter(x=>x&&x.name&&x.uuid&&safeImage(x.image)): [];
  target.innerHTML=valid.length?valid.map(catalogCard).join(''):'<div class="empty">As capas ainda não estão disponíveis. Abra a biblioteca completa.</div>';
 }catch(error){
  target.innerHTML='<div class="empty">Não foi possível carregar as capas agora. Confira sua conexão ou abra a biblioteca.</div>';
 }
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
 $('modal').classList.add('open');$('detail').innerHTML='<div class="empty">Carregando ficha e capturas…</div>';
 try{
  const pair=await Promise.all([api('/games/'+id,{}),api('/games/'+id+'/screenshots',{page_size:8})]);
  const g=pair[0],shots=pair[1].results||[];activeGame=g;
  const website=safeLink(g.website),favorite=read(FAV).some(x=>x.id===g.id);
  const shotHtml=shots.map(x=>{const img=safeImage(x.image);return img?'<a target="_blank" rel="noopener" href="'+esc(img)+'"><img src="'+esc(img)+'" alt="Captura de '+esc(g.name)+'" loading="lazy"></a>':''}).join('');
  $('detail').innerHTML='<h2>'+esc(g.name)+'</h2><div class="chips"><span class="chip">★ '+(g.rating||'—')+'</span><span class="chip">Metacritic '+(g.metacritic||'—')+'</span><span class="chip">'+esc(g.released||'Data não informada')+'</span></div><p>'+esc(g.description_raw||'Sinopse não disponível nesta fonte.')+'</p><p class="muted">Gêneros: '+esc((g.genres||[]).map(x=>x.name).join(', ')||'Não informado')+'</p><p class="muted">Plataformas: '+esc((g.platforms||[]).map(x=>x.platform.name).join(', ')||'Não informado')+'</p><div class="row"><button class="btn primary" id="detailFavorite" onclick="toggleFav(activeGame)">'+(favorite?'♥ Salvo nos favoritos':'♡ Salvar nos favoritos')+'</button>'+(website?'<a class="btn" href="'+esc(website)+'" target="_blank" rel="noopener">Site oficial ↗</a>':'')+'</div><h3 class="section-subtitle">Imagens do jogo</h3><div class="screens">'+(shotHtml||'<p class="muted">Nenhuma captura disponível.</p>')+'</div><p class="fineprint muted">Detalhes e imagens fornecidos pela RAWG. Confira a loja e a edição antes de comprar.</p>';
 }catch(e){$('detail').innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
function closeDetail(){$('modal').classList.remove('open')}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}
function toggleFav(g){
 if(!g)return;
 let arr=read(FAV);
 if(arr.some(x=>x.id===g.id))arr=arr.filter(x=>x.id!==g.id);
 else arr.push({id:g.id,name:g.name,background_image:g.background_image,rating:g.rating,genres:g.genres||[]});
 localStorage.setItem(FAV,JSON.stringify(arr));renderFav();
 const button=$('detailFavorite');
 if(button)button.textContent=arr.some(x=>x.id===g.id)?'♥ Salvo nos favoritos':'♡ Salvar nos favoritos';
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

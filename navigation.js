if(!document.querySelector('link[data-arcana-collection]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./collection-premium.css';css.dataset.arcanaCollection='';document.head.append(css)}
if(!document.querySelector('link[data-arcana-arena]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./arena-premium.css?v=052';css.dataset.arcanaArena='';document.head.append(css)}
const info={"Jogar":"","Coleção":"Cartas de todas as raridades ficarão disponíveis nesta área.","Loja":"Invocações e recursos disponíveis.","Invocação":"Invoque cartas usando moedas.","Configurações":"Preferências do jogo.","Perfil":"Seu progresso e suas conquistas aparecerão aqui.","Torneios":"Competições do ARCANA."};const screen=document.getElementById('screen');let matchTimer=null;function clearMatchTimer(){if(matchTimer!==null){clearTimeout(matchTimer);matchTimer=null}}function openPage(name){clearMatchTimer();document.getElementById('title').textContent=name;document.getElementById('description').textContent=info[name];const content=document.getElementById('content');content.innerHTML='';if(name==='Jogar'){
 screen.classList.add('matchmaking-mode');
 screen.classList.remove('arena-mode');
 const searching=document.createElement('section');searching.className='arcana-searching';
 const sigil=document.createElement('div');sigil.className='arcana-search-sigil';sigil.setAttribute('aria-hidden','true');sigil.textContent='✧';
 const heading=document.createElement('h2');heading.textContent='BUSCANDO PARTIDA';
 const description=document.createElement('p');description.textContent='Preparando a busca por um adversário...';
 const infoText=document.createElement('small');infoText.textContent='Modo de teste: um bot de demonstração será selecionado automaticamente.';
 const cancel=document.createElement('button');cancel.type='button';cancel.className='primary arcana-cancel-search';cancel.textContent='Cancelar busca';
 cancel.addEventListener('click',closePage);
 searching.append(sigil,heading,description,infoText,cancel);content.append(searching);matchTimer=setTimeout(()=>{matchTimer=null;if(!screen.classList.contains('matchmaking-mode'))return;heading.textContent='ADVERSÁRIO ENCONTRADO';description.textContent='BOT ARCANA · Partida de demonstração';sigil.textContent='⚔';cancel.disabled=true;cancel.style.opacity='.55';matchTimer=setTimeout(()=>{matchTimer=null;if(!screen.classList.contains('matchmaking-mode'))return;screen.classList.remove('matchmaking-mode');screen.classList.add('arena-mode');content.replaceChildren();if(window.arcanaArena)window.arcanaArena(content);else content.textContent='Não foi possível carregar a arena.';},1500)},3500);
 }else{screen.classList.remove('arena-mode','matchmaking-mode')}if(name==='Torneios'){const panel=document.createElement('div');panel.className='mini';panel.style.gridColumn='1/-1';const heading=document.createElement('h3');heading.textContent='Torneios ARCANA';const message=document.createElement('p');message.textContent='Os torneios ainda não estão disponíveis. As inscrições, partidas e premiações serão habilitadas quando o sistema competitivo estiver implementado.';panel.append(heading,message);content.append(panel)}if(name==='Perfil'&&window.arcanaAccount)window.arcanaAccount(content);if(name==='Invocação'&&window.arcanaShop)window.arcanaShop(content,false);if(name==='Loja'){content.innerHTML='<div class="mini" style="grid-column:1/-1"><h3>Loja Arcana</h3><p>Novos produtos e ofertas serão disponibilizados futuramente.</p><button class="back" type="button" id="go-summon">Ir para Invocação</button></div>';content.querySelector("#go-summon").onclick=()=>openPage("Invocação")}if(name==='Coleção'&&window.arcanaShop)window.arcanaShop(content,true);screen.classList.add('open');if(name!=='Jogar')document.getElementById('back').focus()}function closePage(){clearMatchTimer();screen.classList.remove('open','arena-mode','matchmaking-mode')}document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>openPage(b.dataset.page)));document.getElementById('back').addEventListener('click',closePage);document.addEventListener('keydown',e=>{if(e.key==='Escape')closePage()});document.addEventListener("contextmenu",e=>e.preventDefault());document.addEventListener("dragstart",e=>e.preventDefault());
if('serviceWorker' in navigator){
 let refreshing=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(refreshing)return;
  refreshing=true;
  location.reload();
 });
 window.addEventListener('load',async()=>{
  try{
   const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
   await registration.update();
   document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)registration.update().catch(()=>{});
   });
  }catch(error){console.warn('Atualização ARCANA:',error)}
 });
}

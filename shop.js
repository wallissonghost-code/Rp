window.arcanaShop=async function(root,collection=false){root.className="grid";root.innerHTML='<p class="auth-message">Carregando cartas...</p>';if(!arcanaSession){root.innerHTML='<p class="auth-message">Entre na sua conta para acessar as cartas.</p>';return}try{await arcanaRefresh();const cards=await arcanaRequest("/rest/v1/card_catalog?select=code,name,rarity,element,card_type&order=rarity.asc","GET",null,arcanaSession.access_token);if(collection){const owned=await arcanaRequest("/rest/v1/player_cards?select=card_code,copies,upgrade_level","GET",null,arcanaSession.access_token);const map=new Map(owned.map(x=>[x.card_code,x]));root.className="arcana-collection";root.innerHTML='';const summary=document.createElement('div');summary.className='ac-summary';summary.textContent='Coleção ARCANA · '+owned.length+' / '+cards.length+' descobertas';const bar=document.createElement('div');bar.className='ac-track';const fill=document.createElement('i');fill.style.width=(cards.length?owned.length/cards.length*100:0)+'%';bar.append(fill);summary.append(bar);root.append(summary);const controls=document.createElement('div');controls.className='ac-controls';const search=document.createElement('input');search.type='search';search.placeholder='Buscar carta...';const makeSelect=(items)=>{const s=document.createElement('select');items.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;s.append(o)});return s};const rarity=makeSelect([['','Todas raridades'],...['Comum','Rara','Épica','Lendária','Mítica'].map(v=>[v,v])]);const element=makeSelect([['','Todos elementos'],...['Fogo','Água','Vento','Terra','Natureza'].map(v=>[v,v])]);const type=makeSelect([['','Todos tipos'],['creature','Criatura'],['environment','Ambiente']]);const status=makeSelect([['','Todas cartas'],['owned','Descobertas'],['locked','Não descobertas'],['ready','Evolução disponível']]);const sort=makeSelect([['rarity','Ordenar: raridade'],['level','Ordenar: nível'],['copies','Ordenar: cópias'],['name','Ordenar: nome']]);controls.append(search,rarity,element,type,status,sort);root.append(controls);const grid=document.createElement('div');grid.className='ac-grid';const ownedHeading=document.createElement('h3');ownedHeading.className='ac-section-heading';ownedHeading.textContent='Suas cartas';const lockedHeading=document.createElement('h3');lockedHeading.className='ac-section-heading';lockedHeading.textContent='Cartas a serem desbloqueadas';const lockedGrid=document.createElement('div');lockedGrid.className='ac-grid';root.append(ownedHeading,grid,lockedHeading,lockedGrid);const glyphs={Fogo:'♨',Água:'◈',Vento:'≋',Terra:'◆',Natureza:'❧'};function render(){grid.replaceChildren();lockedGrid.replaceChildren();const filtered=cards.filter(x=>{const o=map.get(x.code);return(!search.value||x.name.toLowerCase().includes(search.value.toLowerCase()))&&(!rarity.value||x.rarity===rarity.value)&&(!element.value||x.element===element.value)&&(!type.value||x.card_type===type.value)&&(!status.value||(status.value==='owned'&&o)||(status.value==='locked'&&!o))});if(status.value==='ready')filtered.length=0;filtered.sort((a,b)=>{const x=map.get(a.code),y=map.get(b.code);if(sort.value==='level')return(y?.upgrade_level||0)-(x?.upgrade_level||0);if(sort.value==='copies')return(y?.copies||0)-(x?.copies||0);if(sort.value==='name')return a.name.localeCompare(b.name,'pt-BR');return ['Mítica','Lendária','Épica','Rara','Comum'].indexOf(a.rarity)-['Mítica','Lendária','Épica','Rara','Comum'].indexOf(b.rarity)});if(!filtered.length){const empty=document.createElement('p');empty.textContent=status.value==='ready'?'Requisitos de evolução ainda não definidos.':'Nenhuma carta encontrada.';grid.append(empty)}ownedHeading.hidden=status.value==='locked';lockedHeading.hidden=status.value==='owned'||status.value==='ready';grid.hidden=status.value==='locked';lockedGrid.hidden=status.value==='owned'||status.value==='ready';for(const card of filtered){const o=map.get(card.code);const tile=document.createElement('button');tile.type='button';tile.className='ac-card'+(!o?' ac-locked':'');tile.dataset.rarity=card.rarity;const art=document.createElement('div');art.className='ac-art';const icon=document.createElement('span');icon.className='ac-glyph';icon.textContent=o?(glyphs[card.element]||'✧'):'?';art.append(icon);if(o){const level=document.createElement('span');level.className='ac-level';level.textContent='Nv. '+o.upgrade_level;art.append(level)}const title=document.createElement('strong');title.className='ac-name';title.textContent=o?card.name:'Carta desconhecida';const meta=document.createElement('small');meta.textContent=o?card.rarity+' · '+card.element+' · '+(card.card_type==='environment'?'Ambiente':'Criatura'):'Não descoberta';const copies=document.createElement('div');copies.className='ac-copies';copies.textContent=o?o.copies+' cópia(s) · Evolução pendente':'Bloqueada';tile.append(art,title,meta,copies);tile.onclick=()=>{const overlay=document.createElement('div');overlay.className='ac-overlay';const panel=document.createElement('div');panel.className='ac-detail';const close=document.createElement('button');close.textContent='Fechar';close.onclick=()=>overlay.remove();const h=document.createElement('h3');h.textContent=o?card.name:'Carta não descoberta';const p=document.createElement('p');p.textContent=o?card.rarity+' · '+card.element+' · Nível '+o.upgrade_level+' · '+o.copies+' cópias disponíveis':'Descubra esta carta por invocação.';panel.append(close,h,p);if(o){const note=document.createElement('p');note.textContent='Requisitos, benefícios e custo de evolução ainda não cadastrados.';const evolve=document.createElement('button');evolve.textContent='EVOLUIR — indisponível';evolve.disabled=true;panel.append(note,evolve)}overlay.append(panel);overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};document.body.append(overlay)};(o?grid:lockedGrid).append(tile)}}[search,rarity,element,type,status,sort].forEach(x=>x.addEventListener(x===search?'input':'change',render));render();return}root.className='arcana-summon';root.replaceChildren();
const stage=document.createElement('section');stage.className='as-stage';
const eyebrow=document.createElement('div');eyebrow.className='as-eyebrow';eyebrow.textContent='✦ ARCANA ✦';
const heading=document.createElement('h2');heading.textContent='ALTAR DE INVOCAÇÃO';
const sub=document.createElement('p');sub.textContent='Desperte o poder das cartas arcanas';
const portal=document.createElement('div');portal.className='as-portal';portal.innerHTML='<div class="as-ring as-ring-outer"></div><div class="as-ring as-ring-inner"></div><div class="as-core">✧</div>';
const hint=document.createElement('p');hint.className='as-hint';hint.textContent='Escolha um ritual para começar';
stage.append(eyebrow,heading,sub,portal,hint);
const controls=document.createElement('div');controls.className='as-actions';
const results=document.createElement('section');results.className='as-results';results.hidden=true;
const resultTitle=document.createElement('h3');resultTitle.textContent='CARTAS INVOCADAS';
const resultGrid=document.createElement('div');resultGrid.className='as-result-grid';
const revealAll=document.createElement('button');revealAll.type='button';revealAll.className='as-reveal-all';revealAll.textContent='Revelar todas';revealAll.hidden=true;
const closeResult=document.createElement('button');closeResult.type='button';closeResult.className='as-finish';closeResult.textContent='Concluir';closeResult.hidden=true;
const error=document.createElement('p');error.className='auth-message as-error';error.setAttribute('role','status');
results.append(resultTitle,resultGrid,revealAll,closeResult);root.append(stage,controls,results,error);
let busy=false;let revealCount=0;
const rarityClass=r=>({'Comum':'comum','Rara':'rara','Épica':'epica','Lendária':'lendaria','Mítica':'mitica'}[r]||'comum');
function finishIfDone(){if(revealCount===resultGrid.children.length){revealAll.hidden=true;closeResult.hidden=false;hint.textContent='Ritual concluído!';}}
function reveal(tile){if(tile.classList.contains('revealed'))return;tile.classList.add('revealed');tile.setAttribute('aria-label',tile.dataset.name+' · '+tile.dataset.rarity);revealCount++;finishIfDone()}
revealAll.onclick=()=>Array.from(resultGrid.children).forEach(reveal);
closeResult.onclick=()=>{results.hidden=true;controls.hidden=false;stage.classList.remove('as-channeling');hint.textContent='Escolha um ritual para começar';portal.classList.remove('as-active');};
for(const count of [1,10]){
 const option=document.createElement('button');option.type='button';option.className='as-option';
 const title=document.createElement('strong');title.textContent=count===1?'INVOCAR 1 CARTA':'INVOCAR 10 CARTAS';
 const price=document.createElement('span');price.textContent=count===1?'◈ 1.000 moedas':'◈ 9.000 moedas · 10% OFF';
 option.append(title,price);controls.append(option);
 option.onclick=async()=>{
  if(busy)return;busy=true;error.textContent='';results.hidden=true;resultGrid.replaceChildren();revealCount=0;closeResult.hidden=true;revealAll.hidden=true;
  for(const button of controls.children)button.disabled=true;
  stage.classList.add('as-channeling');portal.classList.add('as-active');hint.textContent='Canalizando energia arcana...';
  try{
   await arcanaRefresh();
   const data=await arcanaRequest('/rest/v1/rpc/arcana_summon','POST',{p_count:count},arcanaSession.access_token);
   const obtained=Array.isArray(data?.cards)?data.cards:[];
   if(!obtained.length)throw Error('A invocação não retornou cartas.');
   const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   await new Promise(resolve=>setTimeout(resolve,reduceMotion?0:950));
   hint.textContent='A energia se materializou!';
   for(const card of obtained){
    const tile=document.createElement('button');tile.type='button';tile.className='as-reward '+rarityClass(card.rarity);tile.dataset.name=card.name||'Carta';tile.dataset.rarity=card.rarity||'Comum';tile.setAttribute('aria-label','Revelar carta');
    const back=document.createElement('span');back.className='as-reward-back';back.textContent='✧';
    const front=document.createElement('span');front.className='as-reward-front';
    const mark=document.createElement('span');mark.className='as-reward-mark';mark.textContent='✦';
    const name=document.createElement('strong');name.textContent=card.name||'Carta';
    const rarity=document.createElement('small');rarity.textContent=card.rarity||'Comum';
    front.append(mark,name,rarity);tile.append(back,front);tile.onclick=()=>reveal(tile);resultGrid.append(tile);
   }
   results.hidden=false;controls.hidden=true;revealAll.hidden=obtained.length===1;
   if(obtained.length===1){reveal(resultGrid.firstChild)}
   await arcanaLoad();
  }catch(e){error.textContent=e.message;hint.textContent='Ritual interrompido';stage.classList.remove('as-channeling');portal.classList.remove('as-active')}
  finally{busy=false;for(const button of controls.children)button.disabled=false}
 };
}
}catch(e){root.textContent='Erro ao carregar cartas: '+e.message}};

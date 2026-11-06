/* ARCANA arena: real collection-based draw pile and five-card opening hands.
   Card placement is being developed; turns and combat are not implemented yet. */
window.arcanaArena=async function(root){
 root.replaceChildren();root.className="arcana-battle";
 const field=document.createElement("section");field.className="arcana-battlefield";const ownSlots=[];let habitatSlot;
 for(const side of ["enemy","own"]){
  const area=document.createElement("div");area.className="arcana-side "+side;
  const slots=document.createElement("div");slots.className="arcana-slots";
  for(let i=0;i<10;i++){const slot=document.createElement("div");slot.className="arcana-slot";slot.setAttribute("aria-label","Posição "+(i+1)+" vazia");slots.append(slot);if(side==="own")ownSlots.push(slot)}
  const habitat=document.createElement("div");habitat.className="arcana-habitat";habitat.setAttribute("aria-label","Posição de habitat");
  const habitatLabel=document.createElement("span");habitatLabel.textContent="HABITAT";habitat.append(habitatLabel);if(side==="own")habitatSlot=habitat;
  area.append(slots,habitat);field.append(area);
 }
 const enemyHand=document.createElement("div");enemyHand.className="arcana-enemy-hand";enemyHand.setAttribute("aria-label","Mão do adversário");
 const hand=document.createElement("footer");hand.className="arcana-hand";
 const cards=document.createElement("div");cards.className="arcana-hand-cards";cards.setAttribute("aria-label","Suas cartas na mão");
 const deck=document.createElement("button");deck.type="button";deck.className="arcana-draw-deck";deck.setAttribute("aria-label","Comprar carta do baralho");deck.innerHTML='<span class="arcana-deck-symbol">✧</span><span class="arcana-deck-count">0</span>';
 const notice=document.createElement("div");notice.className="arcana-draw-feedback";notice.setAttribute("role","status");
 const grave=document.createElement("button");grave.type="button";grave.className="arcana-grave";grave.textContent="✝ Cemitério";hand.append(grave,cards,deck,notice);root.append(field,enemyHand,hand);
 let pile=[],inHand=[],enemyPile=[],enemyCards=[],loading=true,graveyard=[];const placements=new Map();
 const shuffle=arr=>{for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
 const DECK_LIMIT=20, HAND_LIMIT=5;
 const buildPile=(catalog,owned)=>{const byCode=new Map(catalog.map(c=>[c.code,c]));const out=[];const seen=new Set();for(const o of owned){if(Number(o.copies)<=0||seen.has(o.card_code))continue;const card=byCode.get(o.card_code);if(!card)continue;seen.add(o.card_code);out.push({...card,level:o.upgrade_level||1})}return shuffle(out).slice(0,DECK_LIMIT)};
 function render(){
  cards.replaceChildren();
  for(const card of inHand){
   const tile=document.createElement("button");tile.type="button";tile.className="arcana-hand-card";tile.dataset.rarity=card.rarity||"Comum";
   const glyph=document.createElement("span");glyph.className="arcana-hand-glyph";glyph.textContent=({Fogo:"♨",Água:"◈",Vento:"≋",Terra:"◆",Natureza:"❧"})[card.element]||"✧";
   const name=document.createElement("b");name.textContent=card.name;
   const meta=document.createElement("small");meta.textContent=(card.rarity||"Carta")+" · Nv. "+card.level;
   tile.append(glyph,name,meta);tile.addEventListener("pointerdown",e=>startDrag(e,tile,card));cards.append(tile);
  }
  const counter=deck.querySelector(".arcana-deck-count");counter.textContent=String(pile.length);
  deck.disabled=loading||!pile.length||inHand.length>=HAND_LIMIT;
  deck.title=inHand.length>=HAND_LIMIT?"Mão cheia: máximo de 5 cartas":pile.length?"Comprar uma carta ("+pile.length+" restantes)":"Baralho vazio";
  enemyHand.replaceChildren();
  for(let i=0;i<enemyCards.length;i++){const back=document.createElement("div");back.className="arcana-enemy-card";back.setAttribute("aria-label","Carta oculta do bot");back.textContent="✧";enemyHand.append(back)}
 }

 function startDrag(e,tile,card){
  if(loading||e.button!==0)return;
  e.preventDefault();tile.setPointerCapture(e.pointerId);
  const ghost=tile.cloneNode(true);ghost.classList.add("arcana-drag-ghost");document.body.append(ghost);
  const move=ev=>{ghost.style.left=ev.clientX+"px";ghost.style.top=ev.clientY+"px"};
  const clean=()=>{ghost.remove();tile.removeEventListener("pointermove",move);tile.removeEventListener("pointerup",up);tile.removeEventListener("pointercancel",cancel)};
  const cancel=()=>{clean();notice.textContent="Jogada cancelada."};
  const up=ev=>{ghost.style.display="none";const el=document.elementFromPoint(ev.clientX,ev.clientY);const target=el&&el.closest(".arcana-grave,.arcana-side.own .arcana-slot,.arcana-side.own .arcana-habitat");clean();if(!target){notice.textContent="Jogada cancelada.";return}if(target===grave){const i=inHand.indexOf(card);if(i>=0){inHand.splice(i,1);graveyard.push(card);render();notice.textContent=card.name+" enviada ao cemitério."}return}if(placements.has(target)){notice.textContent="Slot ocupado.";return}if((target===habitatSlot)!==(card.card_type==="environment")){notice.textContent="Posição incompatível com a carta.";return}preview(card,target)};
  tile.addEventListener("pointermove",move);tile.addEventListener("pointerup",up);tile.addEventListener("pointercancel",cancel);move(e);
 }
 function draw(){if(inHand.length>=HAND_LIMIT){notice.textContent="Mão cheia: máximo de 5 cartas.";return}if(!pile.length){notice.textContent="Seu baralho acabou.";return}inHand.push(pile.pop());render();notice.textContent="Carta comprada · "+pile.length+" restantes no baralho";}
 deck.addEventListener("click",draw);
 notice.textContent="Preparando os baralhos...";
 render();
 try{
  await arcanaRefresh();
  if(!arcanaSession){notice.textContent="Sessão expirada. Abra Perfil para entrar novamente.";loading=false;render();return}
  const [catalog,owned]=await Promise.all([
   arcanaRequest("/rest/v1/card_catalog?select=code,name,rarity,element,card_type","GET",null,arcanaSession.access_token),
   arcanaRequest("/rest/v1/player_cards?select=card_code,copies,upgrade_level","GET",null,arcanaSession.access_token)
  ]);
  if(!root.isConnected)return;
  pile=buildPile(catalog,owned);
  // Bot deck is temporary client-side test data from the real catalog.
  // No claim of server-backed bot inventory or authoritative matchmaking.
  enemyPile=shuffle(catalog.map(card=>({...card,level:1}))).slice(0,DECK_LIMIT);
  inHand=pile.splice(-5);
  enemyCards=enemyPile.splice(-5);
  loading=false;render();
  notice.textContent=inHand.length?"Mão inicial: 5 cartas. Compra disponível quando houver espaço na mão.":"Sua coleção está vazia. Invoque cartas antes de jogar.";
 }catch(err){loading=false;render();notice.textContent="Não foi possível carregar as cartas: "+err.message}
};

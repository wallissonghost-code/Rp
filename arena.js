/* ARCANA arena: real collection-based draw pile and five-card opening hands.
   Card placement, turns and combat are not implemented yet. */
window.arcanaArena=async function(root){
 root.replaceChildren();root.className="arcana-battle";
 const field=document.createElement("section");field.className="arcana-battlefield";
 for(const side of ["enemy","own"]){
  const area=document.createElement("div");area.className="arcana-side "+side;
  const slots=document.createElement("div");slots.className="arcana-slots";
  for(let i=0;i<10;i++){const slot=document.createElement("div");slot.className="arcana-slot";slot.setAttribute("aria-label","Posição "+(i+1)+" vazia");slots.append(slot)}
  const habitat=document.createElement("div");habitat.className="arcana-habitat";habitat.setAttribute("aria-label","Posição de habitat");
  const habitatLabel=document.createElement("span");habitatLabel.textContent="HABITAT";habitat.append(habitatLabel);
  area.append(slots,habitat);field.append(area);
 }
 const enemyHand=document.createElement("div");enemyHand.className="arcana-enemy-hand";enemyHand.setAttribute("aria-label","Mão do adversário");
 const hand=document.createElement("footer");hand.className="arcana-hand";
 const cards=document.createElement("div");cards.className="arcana-hand-cards";cards.setAttribute("aria-label","Suas cartas na mão");
 const deck=document.createElement("button");deck.type="button";deck.className="arcana-draw-deck";deck.setAttribute("aria-label","Comprar carta do baralho");deck.innerHTML='<span class="arcana-deck-symbol">✧</span><span class="arcana-deck-count">0</span>';
 const notice=document.createElement("div");notice.className="arcana-draw-feedback";notice.setAttribute("role","status");
 hand.append(cards,deck,notice);root.append(field,enemyHand,hand);
 let pile=[],inHand=[],enemyPile=[],enemyCards=[],loading=true;
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
   tile.append(glyph,name,meta);tile.onclick=()=>{notice.textContent=card.name+" selecionada. Posicionamento em desenvolvimento."};cards.append(tile);
  }
  const counter=deck.querySelector(".arcana-deck-count");counter.textContent=String(pile.length);
  deck.disabled=loading||!pile.length||inHand.length>=HAND_LIMIT;
  deck.title=inHand.length>=HAND_LIMIT?"Mão cheia: máximo de 5 cartas":pile.length?"Comprar uma carta ("+pile.length+" restantes)":"Baralho vazio";
  enemyHand.replaceChildren();
  for(let i=0;i<enemyCards.length;i++){const back=document.createElement("div");back.className="arcana-enemy-card";back.setAttribute("aria-label","Carta oculta do bot");back.textContent="✧";enemyHand.append(back)}
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

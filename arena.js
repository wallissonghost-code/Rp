/* ARCANA battle presentation only. No fictional combat state. */
window.arcanaArena=async function(root){
 root.replaceChildren();root.className="arcana-battle";
 const header=document.createElement("header");header.className="arcana-status";
 const player=document.createElement("strong");player.textContent=document.getElementById("player-name")?.textContent||"Invocador";
 const status=document.createElement("small");status.textContent="Campo em preparação · combate indisponível";
 header.append(player,status);
 const field=document.createElement("section");field.className="arcana-battlefield";
 for(const [side,label] of [["enemy","CAMPO ADVERSÁRIO"],["own","SEU CAMPO"]]){
  const area=document.createElement("div");area.className="arcana-side "+side;
  const heading=document.createElement("div");heading.className="arcana-side-label";heading.textContent=label;
  const slots=document.createElement("div");slots.className="arcana-slots";
  // Five visual placeholders, not an assertion of battle rules.
  for(let i=0;i<5;i++){const slot=document.createElement("div");slot.className="arcana-slot";slot.setAttribute("aria-label","Posição visual "+(i+1)+" indisponível");slots.append(slot)}
  area.append(heading,slots);field.append(area);
 }
 const hand=document.createElement("footer");hand.className="arcana-hand";
 const title=document.createElement("div");title.className="arcana-hand-title";title.textContent="SUA COLEÇÃO";
 const cards=document.createElement("div");cards.className="arcana-hand-cards";
 const notice=document.createElement("p");notice.className="arcana-notice";notice.textContent="Prévia de cartas reais. Monte um deck e habilite as regras antes de jogar.";
 hand.append(title,cards,notice);root.append(header,field,hand);
 if(!window.arcanaSession){notice.textContent="Entre na conta para visualizar suas cartas.";return}
 try{
  await arcanaRefresh();
  const [catalog,owned]=await Promise.all([
   arcanaRequest("/rest/v1/card_catalog?select=code,name,rarity,element,card_type","GET",null,arcanaSession.access_token),
   arcanaRequest("/rest/v1/player_cards?select=card_code,copies,upgrade_level","GET",null,arcanaSession.access_token)
  ]);
  if(!root.isConnected)return;
  const byCode=new Map(catalog.map(c=>[c.code,c]));
  const entries=owned.map(o=>({o,c:byCode.get(o.card_code)})).filter(x=>x.c);
  if(!entries.length){notice.textContent="Sua coleção está vazia. Use Invocação para obter cartas.";return}
  for(const {o,c} of entries.slice(0,8)){
   const el=document.createElement("button");el.type="button";el.className="arcana-hand-card";
   const name=document.createElement("b");name.textContent=c.name;
   const meta=document.createElement("small");meta.textContent=c.rarity+" · Nv. "+o.upgrade_level;
   el.append(name,meta);el.addEventListener("click",()=>{notice.textContent=c.name+" · "+c.element+" · "+o.copies+" cópia(s). Combate ainda não habilitado."});cards.append(el);
  }
  title.textContent="SUA COLEÇÃO · "+entries.length+" CARTAS";
 }catch(err){notice.textContent="Não foi possível carregar a coleção: "+err.message}
};

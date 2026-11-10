/* ===== RMAX Consórcios · Comportamento ===== */
/* >>> TROQUE AQUI pelo WhatsApp real (DDI+DDD+número, só dígitos) <<< */
const WHATSAPP = "5500000000000";
const TAXA_TOTAL = 0.20; // taxa de administração + fundo de reserva (ilustrativa)

const $ = s => document.querySelector(s);
const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const wa = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* Links de WhatsApp */
document.querySelectorAll("[data-wa]").forEach(a => a.href = wa("Olá! Vim pelo site e quero saber mais sobre consórcio de imóveis."));

/* Menu: fundo ao rolar */
addEventListener("scroll",()=>$("#nav").classList.toggle("solid",scrollY>40),{passive:true});

/* Simulador (estimativa: carta + taxas / prazo) */
const valor=$("#valor"), prazo=$("#prazo");
function simular(){
  const v=+valor.value, p=+prazo.value;
  $("#valorOut").textContent=brl(v);
  $("#prazoOut").textContent=p+" meses";
  $("#parcela").textContent=brl(v*(1+TAXA_TOTAL)/p);
  $("#simWa").href=wa(`Olá! Simulei no site: carta de ${brl(v)} em ${p} meses. Quero uma simulação oficial.`);
}
valor.oninput=prazo.oninput=simular; simular();

/* Formulário -> WhatsApp */
$("#form").addEventListener("submit",e=>{
  e.preventDefault();
  const n=$("#nome").value.trim(), t=$("#tel").value.trim();
  if(!n||t.replace(/\D/g,"").length<10){ (n?$("#tel"):$("#nome")).focus(); return; }
  open(wa(`Olá! Sou ${n} (${t}). Tenho interesse em consórcio de imóveis na faixa: ${$("#vd").value}.`),"_blank","noopener");
});

/* Animações (GSAP + ScrollTrigger) */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Hero: sequência de frames em canvas (fluido) */
const canvas=$("#heroCanvas"), ctx=canvas.getContext("2d");
const N=+canvas.dataset.frames, EXT=canvas.dataset.ext, frames=[];
const src=i=>`assets/frames/f_${String(i+1).padStart(4,"0")}.${EXT}`;
let target=0, current=0, lastDrawn=-1;

function desenhar(idx){
  let i=idx; while(i>0&&!(frames[i]&&frames[i].complete&&frames[i].naturalWidth)) i--;
  const img=frames[i]; if(!img||!img.naturalWidth) return;
  const cw=canvas.width, ch=canvas.height, s=Math.max(cw/img.naturalWidth,ch/img.naturalHeight);
  const w=img.naturalWidth*s, h=img.naturalHeight*s;
  ctx.drawImage(img,(cw-w)/2,(ch-h)/2,w,h); lastDrawn=idx;
}
function ajustar(){
  const d=Math.min(devicePixelRatio||1,1.5);
  canvas.width=innerWidth*d; canvas.height=innerHeight*d; lastDrawn=-1; desenhar(Math.round(current*(N-1)));
}
for(let i=0;i<N;i++){ const im=new Image(); im.decoding="async"; im.src=src(i); frames[i]=im; if(i===0) im.onload=ajustar; }
addEventListener("resize",ajustar);

if(window.gsap && !reduce){
  gsap.registerPlugin(ScrollTrigger);

  // Suaviza o alvo do scroll (lerp) e só redesenha quando o frame muda
  (function loop(){
    current+=(target-current)*0.14;
    const idx=Math.round(current*(N-1));
    if(idx!==lastDrawn) desenhar(idx);
    requestAnimationFrame(loop);
  })();

  ScrollTrigger.create({trigger:".hero",start:"top top",end:"bottom bottom",
    onUpdate:self=>{ target=self.progress; $("#heroBar").style.transform=`scaleX(${self.progress})`; }});

  // Textos do hero
  const tl=gsap.timeline({defaults:{ease:"none"},
    scrollTrigger:{trigger:".hero",start:"top top",end:"bottom bottom",scrub:true}});
  tl.to(".s1",{opacity:0,y:-40,duration:.12},.26)
    .fromTo(".s2",{opacity:0,y:40},{opacity:1,y:0,duration:.12},.34)
    .to(".s2",{opacity:0,y:-40,duration:.12},.60)
    .fromTo(".s3",{opacity:0,y:40},{opacity:1,y:0,duration:.12},.68)
    .to(".scroll-hint",{opacity:0,duration:.05},.05);

  // Entrada sutil das seções
  gsap.utils.toArray("[data-reveal]").forEach(el=>
    gsap.from(el,{opacity:0,y:28,duration:.8,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 88%",once:true}}));

  // Linha do tempo preenchendo com o scroll
  const tlEl=$("#timeline"), fill=document.createElement("i"); fill.className="fill"; tlEl.prepend(fill);
  gsap.to(fill,{scaleY:1,ease:"none",scrollTrigger:{trigger:tlEl,start:"top 70%",end:"bottom 70%",scrub:true}});
}

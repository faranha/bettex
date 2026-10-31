const T={
pt:{lang:'pt-BR',chip:'PLANEJAMENTO',tag:{home:'Página inicial',pitch:'Pitch',documentation:'Documentação',demo:'Demo visual'},
 home:['Comunidade aberta','Comunidade construindo com <em>DeFi e IA</em>','Um agente BETTEX de IA para vários mercados, feito em aberto.'],
 pitch:['Pitch','Comunidade, tecnologia e <em>roadmap</em>','Propósito, token comunitário, estratégia de lançamento e riscos.'],
 documentation:['Documentação v1','Seis capítulos: regras, <em>tokenomics e riscos</em>','Do propósito à administração, em um só lugar.'],
 demo:['Demonstração visual','Explore o BETTEX: <em>Central da IA, Tesouraria</em> e Histórico','Demonstração visual, sem transações reais.'],
 chap:['Visão','Agente e mercados','Tokenomics','Participação e resultados','Roadmap','Administração e riscos'],
 road:[['01','Comunidade'],['02','Tecnologia'],['03','Roadmap']],
 tabs:['Central da IA','Tesouraria','Histórico'],bd:'Sem transações reais',
 f:['Token comunitário, não participação societária','Em planejamento e captação de grants']},
en:{lang:'en',chip:'PLANNING',tag:{home:'Homepage',pitch:'Pitch',documentation:'Documentation',demo:'Visual demo'},
 home:['Open community','Community building with <em>DeFi and AI</em>','One public BETTEX AI agent for multiple markets, built in the open.'],
 pitch:['Pitch','Community, technology and <em>roadmap</em>','Purpose, community token, launch strategy and risks.'],
 documentation:['Documentation v1','Six chapters: rules, <em>tokenomics and risks</em>','From purpose to administration, in one place.'],
 demo:['Visual demonstration','Explore BETTEX: <em>AI Center, Treasury</em> and History','Visual demonstration, no real transactions.'],
 chap:['Vision','Agent and markets','Tokenomics','Participation and results','Roadmap','Administration and risks'],
 road:[['01','Community'],['02','Technology'],['03','Roadmap']],
 tabs:['AI Center','Treasury','History'],bd:'No real transactions',
 f:['Community token, not equity','In planning and grant fundraising']},
es:{lang:'es',chip:'PLANIFICACIÓN',tag:{home:'Página principal',pitch:'Pitch',documentation:'Documentación',demo:'Demo visual'},
 home:['Comunidad abierta','Comunidad construyendo con <em>DeFi e IA</em>','Un agente BETTEX de IA para varios mercados, construido en abierto.'],
 pitch:['Pitch','Comunidad, tecnología y <em>roadmap</em>','Propósito, token comunitario, estrategia de lanzamiento y riesgos.'],
 documentation:['Documentación v1','Seis capítulos: reglas, <em>tokenomics y riesgos</em>','Del propósito a la administración, en un solo lugar.'],
 demo:['Demostración visual','Explora BETTEX: <em>Central de IA, Tesorería</em> e Historial','Demostración visual, sin transacciones reales.'],
 chap:['Visión','Agente y mercados','Tokenomics','Participación y resultados','Roadmap','Administración y riesgos'],
 road:[['01','Comunidad'],['02','Tecnología'],['03','Roadmap']],
 tabs:['Central de IA','Tesorería','Historial'],bd:'Sin transacciones reales',
 f:['Token comunitario, no participación societaria','En planificación y captación de grants']}};
const q=new URLSearchParams(location.search),L=T[q.get('lang')]?q.get('lang'):'pt',d=T[L];
const P=['home','pitch','documentation','demo'].includes(q.get('page'))?q.get('page'):'home';
document.documentElement.lang=d.lang;document.title='BETTEX — '+d.tag[P];
const $=i=>document.getElementById(i);
$('chip').textContent=d.chip;$('tag').textContent=d.tag[P];$('kick').textContent=d[P][0];$('title').innerHTML=d[P][1];$('sub').textContent=d[P][2];
$('f1').textContent=d.f[0];$('f2').textContent=d.f[1];
let a='';
if(P==='home'){
 const pts=[[40,40,0],[380,60,1],[30,300,1],[390,320,0],[215,10,1],[215,370,0],[0,170,0],[420,190,1]];
 a='<div class="ring" style="left:-20px;top:-20px;width:480px;height:440px"></div><div class="ring" style="left:50px;top:40px;width:340px;height:320px"></div><svg class="lines" viewBox="0 0 440 400">'+
 pts.map(p=>`<line x1="220" y1="200" x2="${p[0]+11}" y2="${p[1]+11}" stroke="#5f86ff" stroke-opacity=".5" stroke-width="1.5"/>`).join('')+'</svg>'+
 pts.map(p=>`<div class="node ${p[2]?'g':''}" style="left:${p[0]}px;top:${p[1]}px"></div>`).join('')+
 '<div class="core"><img src="bettex-mark-gamblefi.svg" alt=""></div>';
}else if(P==='pitch'){
 a='<div class="tl" style="top:20px"><div class="vline"></div>'+d.road.map((r,i)=>`<div class="step ${i==0?'on':''}" style="top:${i*130}px"><div class="dot"></div><div class="box"><small>${r[0]}</small><span>${r[1]}</span></div></div>`).join('')+'</div>';
}else if(P==='documentation'){
 a=d.chap.map((c,i)=>`<div class="chap" style="left:${(i%2)*230}px;top:${Math.floor(i/2)*138-4}px;transform:rotate(${[-1.5,1,1,-1,-1,1.5][i]}deg)"><i>0${i+1}</i><b>${c}</b></div>`).join('');
}else{
 a=`<div class="win"><div class="bar"><s></s><s></s><s></s></div><div class="tabs">${d.tabs.map((t,i)=>`<span class="${i?'':'a'}">${t}</span>`).join('')}</div><div class="pane"><div class="w"><i></i><svg viewBox="0 0 400 60"><path d="M0 50 C60 40 80 20 140 28 S240 50 290 22 S370 10 400 6" fill="none" stroke="#f2b632" stroke-width="3"/></svg></div><div><i></i><i></i></div><div><i></i><i></i></div></div><div class="badge">${d.bd}</div></div>`;
}
$('art').innerHTML=a;

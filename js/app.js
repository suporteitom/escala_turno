(function(){
var Y=2026,KEY='escala2026.v3';
var CODES={M:['Manhã','#bfe0ff'],T:['Tarde','#ffe3a8'],N:['Noite','#c9c3ee'],I:['Intercalado','#c6ecd0'],DS:['Descanso semanal','#eceff3'],F:['Férias','#ff9a94'],FR:['Feriado','#ffb3ad'],E:['Entrudo / Exame','#ffb3ad'],A:['Sem legenda (A)','#e0e0e0'],B:['Baixa médica','#f5b8d6'],LP:['Licença','#e3d3f5'],FO:['Formação','#d3e9f0'],PR:['Prevenção','#ffd6b0'],CL:['Cliente instalações','#e8e1cf'],RE:['Remoto','#d6efe6'],FE:['Fora de escala','#ffffff'],FA:['Faturação','#e8e8c8'],FI:['Falta injustificada','#f4a6a0'],DC:['Descanso complementar','#ffb3ad'],AE:['Trab. estudante','#dcdcf5'],EX:['Exame','#f7d9a6'],VE:['Véspera de exame','#f7e6c2']};
var BRUSH_ORDER=['M','T','N','I','DS','F','FR','B','LP','FO','PR','CL','RE','FE','FA','FI','DC','AE','EX','VE','E','A'];
var HOL=['01-01','04-03','04-05','04-25','05-01','06-04','06-10','08-15','10-05','11-01','12-01','12-08','12-25'];
var MINS={N:[1,1],M:[2,2],I:[2,2],T:[2,2]};
var WD=['D','2ª','3ª','4ª','5ª','6ª','S'];
var MON=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var PEOPLE=[[10050823,"Luis Rodrigues",0],[10047975,"Luis Camilo",0],[10050846,"Pedro Correia",0],[10014954,"Pedro Pereira",0],[10050845,"Alexandre Aldeias",1],[10043354,"Bruno Carmona",1],[10043345,"Jácome David",1],[10043346,"Luís Silva",1],[10043347,"Isaac Fernando Zita",2],[10043348,"Humberto Cabral",2],[10043349,"Ricardo Caldas",2],[10043350,"José Figueiredo",2],[10043290,"Marco Dias",2],[10043351,"Domingos Soares",2],[10043352,"Pedro Madeira",3],[10043353,"Sofia Santos",3]];
var TEAMS=['Equipa 1','Equipa 2','Equipa 3','Equipa 4 (fora de escala)'];
var st={q:0,brush:'M',cells:{}};

function pad(n){return n<10?'0'+n:''+n}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function isHol(d){return HOL.indexOf(pad(d.getMonth()+1)+'-'+pad(d.getDate()))>-1}
function isWE(d){var w=d.getDay();return w==0||w==6}
function daysOf(q){var a=[],d=new Date(Y,q*3,1),e=new Date(Y,q*3+3,1);while(d<e){a.push(new Date(d));d.setDate(d.getDate()+1)}return a}
function wk(d){var t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));var n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);var y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7)}

function gen(){
  var DATA=window.SEED_DATA||{};
  var c={},all=daysOf(0).concat(daysOf(1),daysOf(2),daysOf(3));
  PEOPLE.forEach(function(p){
    var seq=[];(DATA[p[0]]||'').split(',').forEach(function(t){var m=t.split('*'),n=+m[1]||1;for(var i=0;i<n;i++)seq.push(m[0])});
    all.forEach(function(d,i){var v=seq[i];if(v&&v!='-')c[p[0]+'|'+key(d)]=v});
  });
  return c;
}
var tmr;
function save(){
  var s={cells:st.cells,people:PEOPLE,teams:TEAMS,codes:CODES,mins:MINS};
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  clearTimeout(tmr);tmr=setTimeout(function(){push(s)},400);
}
function push(s,retry){
  var pw='';try{pw=localStorage.getItem('escala.pw')||''}catch(e){}
  fetch('api/state',{method:'PUT',headers:{'Content-Type':'application/json','x-edit-password':pw},body:JSON.stringify(s)}).then(function(r){
    if(r.status!=401)return;
    try{localStorage.removeItem('escala.pw')}catch(e){}
    if(retry){alert('Palavra-passe errada. As alterações ficam só neste navegador.');return}
    var n=prompt('Palavra-passe de edição:');
    if(n){try{localStorage.setItem('escala.pw',n)}catch(e){}push(s,true)}
  }).catch(function(){});
}
function apply(s){
  if(s&&s.cells){st.cells=s.cells;st.q=s.q||0;if(s.people){PEOPLE=s.people;TEAMS=s.teams;CODES=s.codes;MINS=s.mins}return true}
  return false;
}
function load(srv){
  if(apply(srv))return;
  try{if(apply(JSON.parse(localStorage.getItem(KEY)||'null')))return}catch(e){}
  st.cells=gen();
}
function minOf(d,s){var m=MINS[s];return m?((isWE(d)||isHol(d))?m[1]:m[0]):0}
function count(d,s){var k=key(d),n=0;PEOPLE.forEach(function(p){if(st.cells[p[0]+'|'+k]===s)n++});return n}

function renderTabs(){
  var h='';for(var i=0;i<4;i++)h+='<button data-q="'+i+'" aria-pressed="'+(i==st.q)+'">Q'+(i+1)+'</button>';
  document.getElementById('tabs').innerHTML=h;
}
function renderPal(){
  var h=Object.keys(CODES).map(function(c){return '<button class="chip" style="background:'+CODES[c][1]+'" data-b="'+c+'" aria-pressed="'+(st.brush==c)+'" title="'+CODES[c][0]+'">'+c+' <small>'+CODES[c][0]+'</small></button>'}).join('');
  h+='<button class="chip" style="background:var(--panel);color:var(--ink);border:1px dashed var(--line)" data-b="" aria-pressed="'+(st.brush=='')+'">Limpar</button>';
  document.getElementById('pal').innerHTML=h;
}
function renderGrid(){
  var D=daysOf(st.q),h='<thead><tr><th class="nm mo">Quadrimestre</th>'.replace('Quadrimestre','Q'+(st.q+1)+' · '+Y);
  var m=-1,span=0,row1='',cells=[];
  D.forEach(function(d,i){if(d.getMonth()!=m){if(span)cells.push([m,span]);m=d.getMonth();span=0}span++});cells.push([m,span]);
  row1=cells.map(function(c){return '<th class="mo" colspan="'+c[1]+'">'+MON[c[0]]+'</th>'}).join('');
  h+=row1+'</tr><tr><th class="nm">Semana</th>';
  D.forEach(function(d){h+='<th class="'+cls(d)+'">'+(d.getDay()==1||d.getDate()==1?wk(d):'')+'</th>'});
  h+='</tr><tr><th class="nm">Dia</th>';
  D.forEach(function(d){h+='<th class="'+cls(d)+'">'+d.getDate()+'</th>'});
  h+='</tr><tr><th class="nm"></th>';
  D.forEach(function(d){h+='<th class="'+cls(d)+'">'+WD[d.getDay()]+'</th>'});
  h+='</tr></thead><tbody>';
  var lastT=-1,ord=[];
  TEAMS.forEach(function(_,t){PEOPLE.forEach(function(p){if(p[2]==t)ord.push(p)})});
  ord.forEach(function(p){
    if(p[2]!=lastT){lastT=p[2];h+='<tr><td class="nm tm" colspan="'+(D.length+1)+'" style="position:static">'+esc(TEAMS[p[2]])+'</td></tr>'}
    h+='<tr><td class="nm">'+esc(p[1])+'</td>';
    D.forEach(function(d){
      var k=key(d),c=st.cells[p[0]+'|'+k]||'',bg=c&&CODES[c]?CODES[c][1]:'';
      h+='<td class="c '+cls(d)+'" tabindex="0" data-p="'+p[0]+'" data-d="'+k+'"'+(bg?' style="background:'+bg+'"':'')+'>'+c+'</td>';
    });
    h+='</tr>';
  });
  h+='<tr><td class="nm tm" colspan="'+(D.length+1)+'" style="position:static">Cobertura por turno (mínimo em serviço)</td></tr>';
  Object.keys(MINS).concat('F').forEach(function(s){
    h+='<tr class="cov"><td class="nm">'+CODES[s][0]+' ('+s+')</td>';
    D.forEach(function(d){var n=count(d,s),mn=s=='F'?0:minOf(d,s);h+='<td class="'+cls(d)+(n<mn?' bad':'')+'" title="'+(n<mn?'Faltam '+(mn-n):'')+'">'+n+'</td>'});
    h+='</tr>';
  });
  h+='</tbody>';
  document.getElementById('grid').innerHTML=h;
  document.getElementById('gt').textContent='Grelha do '+(st.q+1)+'º trimestre';
}
function cls(d){return isHol(d)?'ho':(isWE(d)?'we':'')}
function renderAlerts(){
  var D=daysOf(st.q),out=[];
  D.forEach(function(d){Object.keys(MINS).forEach(function(s){var n=count(d,s),mn=minOf(d,s);if(n<mn)out.push([d,s,mn-n])})});
  var el=document.getElementById('al');
  document.getElementById('at').textContent='Alertas de cobertura ('+out.length+')';
  if(!out.length){el.innerHTML='<li class="ok">Todos os dias cumprem o mínimo neste trimestre.</li>';return}
  el.innerHTML=out.slice(0,200).map(function(o){return '<li><span>'+pad(o[0].getDate())+'/'+pad(o[0].getMonth()+1)+' '+WD[o[0].getDay()]+' · '+CODES[o[1]][0]+'</span><b>faltam '+o[2]+'</b></li>'}).join('');
}
function renderVac(){
  var h='<thead><tr><th>Pessoa</th><th>Gozados</th><th>Saldo</th></tr></thead><tbody>';
  PEOPLE.forEach(function(p){
    var n=0;Object.keys(st.cells).forEach(function(k){if(k.indexOf(p[0]+'|')==0&&st.cells[k]=='F')n++});
    var t=p[3]||22,s=t-n;h+='<tr><td>'+esc(p[1])+'</td><td>'+n+'</td><td class="'+(s<0?'neg':'')+'">'+s+' de '+t+'</td></tr>';
  });
  document.getElementById('vac').innerHTML=h+'</tbody>';
}
function renderLeg(){
  document.getElementById('leg').innerHTML=Object.keys(CODES).map(function(c){return '<div><span>'+c+'</span> <span style="color:var(--mute)">'+CODES[c][0]+'</span></div>'}).join('');
}
function renderSum(){
  document.getElementById('sum').textContent=PEOPLE.length+' pessoas · '+TEAMS.length+' equipas · mínimos (dia útil/fim de semana): '+Object.keys(MINS).map(function(c){return c+' '+MINS[c][0]+'/'+MINS[c][1]}).join(', ');
}
function all(){renderTabs();renderPal();renderGrid();renderAlerts();renderVac()}
function refresh(){renderGrid();renderAlerts();renderVac();save()}

document.getElementById('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.q=+b.dataset.q;save();renderTabs();renderGrid();renderAlerts()});
document.getElementById('pal').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.brush=b.dataset.b;renderPal()});
var gridEl=document.getElementById('grid');
function paint(td){
  var k=td.dataset.p+'|'+td.dataset.d;
  if(st.brush)st.cells[k]=st.brush;else delete st.cells[k];
  refresh();
}
gridEl.addEventListener('click',function(e){var td=e.target.closest('td.c');if(td)paint(td)});
gridEl.addEventListener('keydown',function(e){if((e.key=='Enter'||e.key==' ')&&e.target.matches('td.c')){e.preventDefault();paint(e.target)}});
document.getElementById('rs').addEventListener('click',function(){if(confirm('Repor a escala original da planilha? As suas alterações serão perdidas.')){st.cells=gen();refresh()}});
document.getElementById('th').addEventListener('click',function(){var r=document.documentElement,dk=r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dk?'light':'dark'});

document.getElementById('ex').addEventListener('click',function(){
  var D=[];for(var q=0;q<4;q++)D=D.concat(daysOf(q));
  var rows=[['numero','nome','equipa'].concat(D.map(key)).join(',')];
  PEOPLE.forEach(function(p){rows.push([p[0],'"'+p[1]+'"',p[2]+1].concat(D.map(function(d){return st.cells[p[0]+'|'+key(d)]||''})).join(','))});
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv'}));a.download='escala-2026.csv';a.click();
});
document.getElementById('im').addEventListener('change',function(e){
  var f=e.target.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){
    var L=String(r.result).replace(/^\ufeff/,'').split(/\r?\n/).filter(Boolean),H=L[0].split(','),n=0,bad=0;
    L.slice(1).forEach(function(l){
      var c=l.match(/("[^"]*"|[^,]*)(,|$)/g).map(function(x){return x.replace(/,$/,'').replace(/^"|"$/g,'')});
      var id=c[0];if(!PEOPLE.some(function(p){return String(p[0])==id})){bad++;return}
      for(var i=3;i<H.length;i++){if(/^\d{4}-\d\d-\d\d$/.test(H[i])){if(c[i]&&CODES[c[i]]){st.cells[id+'|'+H[i]]=c[i];n++}else if(c[i]){bad++}}}
    });
    alert(n+' células importadas'+(bad?'; '+bad+' ignoradas (pessoa ou código desconhecido).':'.'));
    refresh();e.target.value='';
  };
  r.readAsText(f);
});

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function opts(v){return TEAMS.map(function(t,i){return '<option value="'+i+'"'+(i==v?' selected':'')+'>'+esc(t)+'</option>'}).join('')}
function renderCfg(){
  var h='<div class="wrap" style="margin-top:8px"><table class="v"><thead><tr><th></th><th>Nº</th><th>Nome</th><th>Equipa</th><th>Férias/ano</th><th></th></tr></thead><tbody>';
  PEOPLE.forEach(function(p,i){h+='<tr data-i="'+i+'"><td><button data-a="up" aria-label="Subir">↑</button> <button data-a="dn" aria-label="Descer">↓</button></td><td><input data-f="id" type="number" value="'+p[0]+'" style="width:110px"></td><td><input data-f="nm" value="'+esc(p[1])+'"></td><td><select data-f="tm">'+opts(p[2])+'</select></td><td><input data-f="vac" type="number" min="0" value="'+(p[3]||22)+'" style="width:64px"></td><td><button data-a="rm" aria-label="Remover pessoa">×</button></td></tr>'});
  h+='</tbody></table></div><p><button data-a="addp">Adicionar pessoa</button></p><h2 style="margin-top:14px">Equipas</h2>';
  TEAMS.forEach(function(t,i){h+='<div style="margin:4px 0" data-ti="'+i+'"><input data-f="tn" value="'+esc(t)+'"> <button data-a="rmt" aria-label="Remover equipa">×</button></div>'});
  h+='<p><button data-a="addt">Adicionar equipa</button></p>';
  document.getElementById('cp').innerHTML=h;
  h='<div class="wrap" style="margin-top:8px"><table class="v"><thead><tr><th>Código</th><th>Nome</th><th>Cor</th><th>Mín. dia útil</th><th>Mín. fim de semana/feriado</th><th></th></tr></thead><tbody>';
  Object.keys(CODES).forEach(function(c){var m=MINS[c];h+='<tr data-c="'+c+'"><td><b>'+c+'</b></td><td><input data-f="cn" value="'+esc(CODES[c][0])+'"></td><td><input data-f="cc" type="color" value="'+CODES[c][1]+'"></td><td><input data-f="mw" type="number" min="0" value="'+(m?m[0]:'')+'" style="width:70px"></td><td><input data-f="mf" type="number" min="0" value="'+(m?m[1]:'')+'" style="width:70px"></td><td><button data-a="rmc" aria-label="Remover turno">×</button></td></tr>'});
  h+='</tbody></table></div><p class="note">Deixe os mínimos em branco para turnos que não contam para a cobertura. Os mínimos iniciais são os da aba Aux da planilha (noite 1, manhã 2, tarde 2, intermédio 2).</p><p><button data-a="addc">Adicionar turno</button></p>';
  document.getElementById('ct').innerHTML=h;
}
function after(){renderPal();renderLeg();renderSum();refresh();renderCfg()}
function renameId(o,n){var pre=o+'|';Object.keys(st.cells).forEach(function(k){if(k.indexOf(pre)==0){st.cells[n+'|'+k.slice(pre.length)]=st.cells[k];delete st.cells[k]}})}
function dropId(id){var pre=id+'|';Object.keys(st.cells).forEach(function(k){if(k.indexOf(pre)==0)delete st.cells[k]})}
function codeUsed(c){return Object.keys(st.cells).some(function(k){return st.cells[k]==c})}
var cfgEl=document.querySelector('.cfg');
cfgEl.addEventListener('change',function(e){
  var f=e.target.dataset.f;if(!f)return;var v=e.target.value,tr=e.target.closest('tr'),i=tr?+tr.dataset.i:-1,c=tr?tr.dataset.c:null;
  if(f=='id'){var n=+v,o=PEOPLE[i][0];if(!n||PEOPLE.some(function(p){return p[0]==n})){alert('Número inválido ou já existente.');renderCfg();return}renameId(o,n);PEOPLE[i][0]=n}
  else if(f=='nm')PEOPLE[i][1]=v.trim()||PEOPLE[i][1];
  else if(f=='tm')PEOPLE[i][2]=+v;
  else if(f=='vac')PEOPLE[i][3]=Math.max(0,+v||0);
  else if(f=='tn'){TEAMS[+e.target.parentNode.dataset.ti]=v.trim()||'Equipa'}
  else if(f=='cn')CODES[c][0]=v.trim()||CODES[c][0];
  else if(f=='cc')CODES[c][1]=v;
  else if(f=='mw'||f=='mf'){var a=tr.querySelector('[data-f=mw]').value,b=tr.querySelector('[data-f=mf]').value;if(a===''&&b==='')delete MINS[c];else MINS[c]=[+a||0,+b||0]}
  after();
});
cfgEl.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b||!b.dataset.a)return;var a=b.dataset.a,tr=b.closest('tr'),i=tr?+tr.dataset.i:-1,c=tr?tr.dataset.c:null,t;
  if(a=='up'&&i>0){t=PEOPLE[i];PEOPLE[i]=PEOPLE[i-1];PEOPLE[i-1]=t}
  else if(a=='dn'&&i<PEOPLE.length-1){t=PEOPLE[i];PEOPLE[i]=PEOPLE[i+1];PEOPLE[i+1]=t}
  else if(a=='rm'){if(!confirm('Remover '+PEOPLE[i][1]+' e todos os seus turnos?'))return;dropId(PEOPLE[i][0]);PEOPLE.splice(i,1)}
  else if(a=='addp'){PEOPLE.push([Math.max.apply(null,PEOPLE.map(function(p){return p[0]}).concat(0))+1,'Nova pessoa',0,22])}
  else if(a=='addt'){TEAMS.push('Nova equipa')}
  else if(a=='rmt'){var ti=+b.parentNode.dataset.ti;if(PEOPLE.some(function(p){return p[2]==ti})||TEAMS.length<2){alert('Mova as pessoas desta equipa antes de a remover.');return}TEAMS.splice(ti,1);PEOPLE.forEach(function(p){if(p[2]>ti)p[2]--})}
  else if(a=='addc'){var n=(prompt('Código do novo turno (até 3 letras):')||'').trim().toUpperCase();if(!/^[A-Z]{1,3}$/.test(n)||CODES[n]){if(n)alert('Código inválido ou já existente.');return}CODES[n]=['Novo turno','#dddddd']}
  else if(a=='rmc'){if('M T N I DS F FR'.split(' ').indexOf(c)>-1||codeUsed(c)){alert('Este código é base ou está em uso na escala.');return}delete CODES[c];delete MINS[c];if(st.brush==c)st.brush=''}
  else return;
  after();
});
fetch('api/state').then(function(r){return r.status==200?r.json():null}).catch(function(){return null}).then(function(srv){
  load(srv);renderSum();renderLeg();all();renderCfg();
});
})();

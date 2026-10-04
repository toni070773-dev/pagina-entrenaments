'use strict';
const D=window.TRAINING_DATA;
const esc=v=>String(v??'Desconegut').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=d=>d.split('-').reverse().join('/');
const number=n=>n==null?'—':Number(n).toLocaleString('ca-ES',{maximumFractionDigits:2});
const duration=n=>n==null?'—':Math.floor(n)+':'+String(Math.round(n*60)%60).padStart(2,'0');
const type=t=>t==='Gym'?'Força':t;
const sessions=[...D.sessions].sort((a,b)=>b.date.localeCompare(a.date));
const metric=(label,value)=>`<div><div class="k">${esc(label)}</div><div class="v">${esc(value)}</div></div>`;
function row(s){return `<details class="session"><summary><span class="date">${date(s.date)}</span> <span class="name">${esc(s.name)}</span> <span class="tag">${type(s.type)}</span><div class="meta">${number(s.distance_km)} km · ${duration(s.duration_min)} min · FC ${number(s.avg_hr)}/${number(s.max_hr)}</div></summary><div class="detail"><dl>${Object.entries(s).map(([k,v])=>`<div><dt>${esc(labels[k]||k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></details>`;}
const labels={date:'Data',type:'Activitat',name:'Entrenament',duration_min:'Durada (min)',distance_km:'Distància (km)',avg_hr:'FC mitjana (ppm)',max_hr:'FC màxima (ppm)',avg_cadence:'Cadència mitjana',max_cadence:'Cadència màxima',avg_power_w:'Potència mitjana (W)',max_power_w:'Potència màxima (W)',notes:'Notes i sensacions',summary:'Resum',training_effect_aerobic:'Training Effect aeròbic',training_effect_anaerobic:'Training Effect anaeròbic',calories_active:'Calories actives',calories_total:'Calories totals',hub_notes:'Notes Training Hub',hub_summary:'Resum Training Hub',hub_name:'Nom Training Hub',z1_min:'Z1 (min)',z2_min:'Z2 (min)',z3_min:'Z3 (min)',z4_min:'Z4 (min)',z5_min:'Z5 (min)'};
let filter='ALL';
function render(){const y=document.querySelector('#year').value,m=document.querySelector('#month').value,q=document.querySelector('#search').value.toLocaleLowerCase();const found=sessions.filter(s=>(filter==='ALL'||s.type===filter)&&(!y||s.date.startsWith(y))&&(!m||s.date.slice(5,7)===m)&&(!q||(s.name+' '+(s.notes||'')).toLocaleLowerCase().includes(q)));document.querySelector('#sessions').innerHTML=found.map(row).join('')||'<p>No hi ha sessions amb aquests filtres.</p>';document.querySelector('#count').textContent=found.length+' de '+sessions.length+' sessions';}
const years=[...new Set(sessions.map(s=>s.date.slice(0,4)))].sort().reverse();document.querySelector('#year').innerHTML='<option value="">Tots els anys</option>'+years.map(y=>`<option>${y}</option>`).join('');
for(const id of ['year','month','search'])document.getElementById(id).addEventListener('input',render);
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render();});
document.querySelector('#recent').innerHTML=sessions.slice(0,3).map(row).join('');
const latest=sessions[0];document.querySelector('#resum .grid').children[2].innerHTML=metric('Última sessió',date(latest.date))+`<div class="small">${esc(latest.name)}</div>`;
function table(rows,fields){return `<div class="table-scroll"><table><thead><tr>${fields.map(([k,l])=>`<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${fields.map(([k])=>`<td>${esc(r[k]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
const weights=[...D.weights].filter(r=>r.date&&Number.isFinite(Number(r.kg))).sort((a,b)=>a.date.localeCompare(b.date));
const inbody=[...D.inbody].filter(r=>r.date).sort((a,b)=>a.date.localeCompare(b.date));
const weightKg=n=>Number(n).toLocaleString('ca-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
function weightTrendChart(rows){
  if(!rows.length)return '<p class="small">Encara no hi ha pesatges registrats.</p>';
  const width=720,height=220,padX=42,padY=24;
  const values=rows.map(r=>Number(r.kg)),dates=rows.map(r=>new Date(r.date+'T00:00:00').getTime());
  const min=Math.floor((Math.min(...values)-1)*2)/2,max=Math.ceil((Math.max(...values)+1)*2)/2;
  const firstDate=Math.min(...dates),lastDate=Math.max(...dates),dateSpan=lastDate-firstDate||1,valueSpan=max-min||1;
  const points=rows.map((r,i)=>({x:padX+(dates[i]-firstDate)/dateSpan*(width-padX*2),y:height-padY-(values[i]-min)/valueSpan*(height-padY*2),r}));
  const grid=[0,.25,.5,.75,1].map(step=>{const y=padY+step*(height-padY*2),value=max-step*valueSpan;return `<line x1="${padX}" y1="${y}" x2="${width-padX}" y2="${y}" class="weight-grid"/><text x="${padX-8}" y="${y+4}" text-anchor="end">${weightKg(value)}</text>`;}).join('');
  const dots=points.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="${i===points.length-1?5:3}"><title>${date(p.r.date)} · ${weightKg(p.r.kg)} kg</title></circle>`).join('');
  return `<div class="weight-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolució del pes de ${date(rows[0].date)} a ${date(rows.at(-1).date)}">${grid}<polyline points="${points.map(p=>p.x+','+p.y).join(' ')}"/>${dots}<text x="${padX}" y="${height-3}" text-anchor="start">${date(rows[0].date)}</text><text x="${width-padX}" y="${height-3}" text-anchor="end">${date(rows.at(-1).date)}</text></svg></div>`;
}
const latestWeight=weights.at(-1),previousWeight=weights.at(-2);
const weightChange=latestWeight&&previousWeight?Number(latestWeight.kg)-Number(previousWeight.kg):null;
const changeLabel=weightChange==null?'—':(weightChange>0?'+':'')+weightKg(weightChange)+' kg';
const weightRows=[...weights].reverse().map(r=>({...r,date:date(r.date),kg:weightKg(r.kg)}));
const inbodyRows=[...inbody].reverse().map(r=>({...r,date:date(r.date),weight:weightKg(r.weight),score:r.score||'—'}));
document.querySelector('#pes').innerHTML=`<div class="card"><h2>Pes · ${weights.length} registres</h2><div class="grid weight-summary">${metric('Últim pes',latestWeight?weightKg(latestWeight.kg)+' kg':'—')}${metric('Data',latestWeight?date(latestWeight.date):'—')}${metric('Canvi últim registre',changeLabel)}${metric('Tendència','Dades reals')}</div>${weightTrendChart(weights)}<p class="small">Tendència calculada amb els registres disponibles de WEIGHTS_BASE.</p>${table(weightRows,[['date','Data'],['kg','Pes (kg)']])}</div><div class="card"><h2>Composició corporal · ${inbody.length} registres</h2><p class="small">Dades d’INBODY_BASE. Les puntuacions 0 de la font es mostren com a desconegudes.</p>${table(inbodyRows,[['date','Data'],['weight','Pes (kg)'],['fat_pct','Greix (%)'],['fat_mass','Greix (kg)'],['muscle','Múscul (kg)'],['bmi','IMC'],['visceral','Greix visceral'],['score','Puntuació']])}</div>`;
const totals={};for(const s of sessions.filter(s=>s.type==='Running')){const key=s.date.slice(0,7);totals[key]=(totals[key]||0)+(s.distance_km||0);}
document.querySelector('#evolucio').innerHTML=`<div class="card"><h2>Històric migrat</h2><div class="grid">${metric('Sessions',sessions.length)}${metric('Resums mensuals',D.monthly.length)}${metric('Pesatges',D.weights.length)}${metric('Curses',D.races.length)}</div></div><div class="card"><h2>Quilometratge mensual · Running</h2><p class="small">Calculat amb les sessions individuals disponibles; no representa necessàriament tot el volum d’anys anteriors.</p>${table(Object.entries(totals).sort((a,b)=>b[0].localeCompare(a[0])).map(([month,km])=>({month,km:number(km)})),[['month','Mes'],['km','km registrats']])}</div><div class="card"><h2>Resums mensuals originals</h2>${table([...D.monthly].reverse(),[['month','Mes'],['vigorous_min','Min vigorosos'],['moderate_min','Min moderats'],['max_hr','FC màx.'],['avg_resting_hr','FC repòs'],['gym_sessions','Sessions gimnàs'],['gym_calories','Calories gimnàs'],['gym_duration_min','Min gimnàs']])}</div>`;
document.querySelector('#curses').innerHTML=`<div class="card"><h2>Curses · ${D.races.length} registres</h2>${table([...D.races].sort((a,b)=>b.data.localeCompare(a.data)),[['data','Data'],['lloc','Cursa'],['tc','Distància'],['tempsReal','Temps real'],['temps','Temps oficial'],['mitja','Ritme'],['posicio','Posició'],['posCat','Pos. categoria'],['dorsal','Dorsal'],['obs','Sensacions']])}</div>`;
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===b.dataset.page));});
render();

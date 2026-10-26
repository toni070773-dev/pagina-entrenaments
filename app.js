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
// References select existing records; measurements and source notes stay in data.js.
function treadmillProgress(){
  const references=[
    ['tredict-8ZX8gHgiF8f9viG3EPEfZ5','Progressiu 26/10','75 minuts; sensació de marge i sense molèsties al taló. Fonts de cinta i Garmin difereixen en distància; no prova una tendència.'],
    ['tredict-qiqj1qqKTrVwVVxwBsMEvP','Progressiu continu','Resistència amb augment gradual de velocitat. Molt bones sensacions finals segons l’usuari; una sessió aïllada no estableix una tendència.'],
    ['tredict-qqBcsVcsvLx3Spmi7KVu6Y','Sèries 6×600 m','Velocitat mantinguda en les sis repeticions segons l’usuari. Bé de cardio, però costa sostenir la velocitat. Recuperacions exactes no confirmades.'],
    ['jsx-147','Inclinació · després de peses','Alternança cada 5 minuts entre pla i 2–3% d’inclinació; 48 m segons l’usuari i molt bones sensacions. La càrrega de pendent i les peses prèvies limiten la comparació directa.']
  ];
  const selected=references.map(([id,work,reading])=>({session:D.sessions.find(s=>s.id===id),work,reading})).filter(r=>r.session);
  if(!selected.length)return '';
  const rows=selected.map(({session:s,work,reading})=>({date:date(s.date),work,volume:number(s.distance_km)+' km · '+duration(s.duration_min)+' min',hr:number(s.avg_hr)+' / '+number(s.max_hr),reading}));
  const seriesIds=['hub-2026-09-30-RUNNING','jsx-141','tredict-qqBcsVcsvLx3Spmi7KVu6Y'];
  const series=seriesIds.map(id=>D.sessions.find(s=>s.id===id)).filter(Boolean);
  const seriesRows=series.map(s=>({date:date(s.date),duration:duration(s.duration_min),hr:number(s.avg_hr)+' / '+number(s.max_hr),context:s.id==='jsx-141'?'Sensor irregular al començament; FC amb cautela.':s.id==='hub-2026-09-30-RUNNING'?'Recuperacions aproximades de 2 min fins a ~140 ppm; distància amb discrepàncies de mesura.':'Recuperacions exactes no confirmades; sis repeticions mantingudes.'}));
  const first=series.find(s=>s.id===seriesIds[0]),last=series.find(s=>s.id===seriesIds[2]);
  const delta=first&&last&&Number.isFinite(first.avg_hr)&&Number.isFinite(last.avg_hr)?`La FC mitjana global del 15/10 varia ${number(last.avg_hr-first.avg_hr)} ppm respecte al 30/09. `:'';
  return `<div class="card"><h2>Progrés · comparativa de cinta</h2><p class="small">Tres estímuls diferents: continu progressiu, intervals ràpids i pendent. La FC és la mitjana / màxima de tota la sessió (ppm), no de cada repetició. No constitueixen una escala directa de rendiment.</p>${table(rows,[['date','Data'],['work','Treball'],['volume','Volum i durada'],['hr','FC global (ppm)'],['reading','Lectura i límits']])}<h3>Referències de sèries · 6×600 m a 13,5 km/h</h3><p class="small">Velocitat de treball indicada per l’usuari (~4:27/km); no és el ritme mitjà de la sessió ni un ritme de 10 km validat.</p>${table(seriesRows,[['date','Data'],['duration','Durada total (min)'],['hr','FC global (ppm)'],['context','Context de comparació']])}<p class="small">${esc(delta)}Observació compatible amb les sensacions cardiovasculars del 15/10, sense demostrar millora per interval: varien la durada total i possiblement les recuperacions, i el 08/10 té un sensor irregular. Calen més sessions equivalents i parcials fiables per confirmar una tendència. Aquestes dades no permeten predir un sub-45 als 10 km.</p><p class="small">Una sola entrada per activitat. Es reutilitzen les mètriques principals i les notes originals: màquina per a distància/velocitat quan així consta; Garmin via Tredict per a FC i durada. No se sumen les mesures de les dues fonts ni els resums mensuals. El desnivell de cinta és el comunicat per l’usuari, sense equivalència validada amb l’exterior.</p><details><summary>Sessions originals, fonts i sensacions</summary>${selected.map(r=>row(r.session)).join('')}${series.filter(s=>!selected.some(r=>r.session.id===s.id)).map(row).join('')}</details></div>`;
}
const totals={};for(const s of sessions.filter(s=>s.type==='Running')){const key=s.date.slice(0,7);totals[key]=(totals[key]||0)+(s.distance_km||0);}
document.querySelector('#evolucio').innerHTML=treadmillProgress()+`<div class="card"><h2>Històric migrat</h2><div class="grid">${metric('Sessions',sessions.length)}${metric('Resums mensuals',D.monthly.length)}${metric('Pesatges',D.weights.length)}${metric('Curses',D.races.length)}</div></div><div class="card"><h2>Quilometratge mensual · Running</h2><p class="small">Calculat amb les sessions individuals disponibles; no representa necessàriament tot el volum d’anys anteriors.</p>${table(Object.entries(totals).sort((a,b)=>b[0].localeCompare(a[0])).map(([month,km])=>({month,km:number(km)})),[['month','Mes'],['km','km registrats']])}</div><div class="card"><h2>Resums mensuals originals</h2>${table([...D.monthly].reverse(),[['month','Mes'],['vigorous_min','Min vigorosos'],['moderate_min','Min moderats'],['max_hr','FC màx.'],['avg_resting_hr','FC repòs'],['gym_sessions','Sessions gimnàs'],['gym_calories','Calories gimnàs'],['gym_duration_min','Min gimnàs']])}</div>`;
document.querySelector('#curses').innerHTML=`<div class="card"><h2>Curses · ${D.races.length} registres</h2>${table([...D.races].sort((a,b)=>b.data.localeCompare(a.data)),[['data','Data'],['lloc','Cursa'],['tc','Distància'],['tempsReal','Temps real'],['temps','Temps oficial'],['mitja','Ritme'],['posicio','Posició'],['posCat','Pos. categoria'],['dorsal','Dorsal'],['obs','Sensacions']])}</div>`;
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===b.dataset.page));});
render();


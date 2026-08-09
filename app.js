var SB='https://egcmleyqbtjdwuspgbsi.supabase.co';
var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnY21sZXlxYnRqZHd1c3BnYnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTQ3MDgsImV4cCI6MjA5NDY3MDcwOH0.Bc43J1OzmTKaVNCdKT1bXvIfak1jcxmCqVuyJKZINfw';
var RHDRS={'apikey':KEY,'Authorization':'Bearer '+KEY};
var WHDRS={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'};
var BUS=['Fabrication','Construction','Pumps','TMM','Motors','Wear Protection','Mining Supplies','Laser Cutting','Draughting'];
var USERS=[
  {u:'martin',p:'MM@Admin2026',name:'Martin Spies',role:'CEO'},
  {u:'estimator',p:'MM@Est2026',name:'Estimator',role:'Estimator'},
  {u:'sales',p:'MM@Sales2026',name:'Internal Sales',role:'Sales'},
  {u:'ops',p:'MM@Ops2026',name:'Operations Manager',role:'Operations'},
  {u:'finance',p:'MM@Fin2026',name:'Finance',role:'Finance'},
  {u:'buyer',p:'MM@Buy2026',name:'Buyer',role:'Buyer'},
  {u:'fabhod',p:'MM@Fab2026',name:'FAB HOD',role:'HOD',bu:'Fabrication'},
  {u:'pumpshod',p:'MM@Pumps2026',name:'Pumps HOD',role:'HOD',bu:'Pumps',bu2:'Motors'},
  {u:'consthod',p:'MM@Const2026',name:'Const HOD',role:'HOD',bu:'Construction'},
  {u:'wearhod',p:'MM@Wear2026',name:'Wear HOD',role:'HOD',bu:'Wear Protection'},
  {u:'planner',p:'MM@Plan2026',name:'Planner',role:'Planner'}
];
var leads=[],orders=[],spos=[],jcs=[],invs=[],lrates=[],wis=[],msettings=[],planr=[],drws=[],cUser=null;
var plView='week';

function dbGet(t,q){
  var url=SB+'/rest/v1/'+t+'?order=created_at.desc'+(q?'&'+q:'');
  return fetch(url,{headers:RHDRS}).then(function(r){return r.ok?r.json():[];});
}
function dbPost(t,b){
  return fetch(SB+'/rest/v1/'+t,{method:'POST',headers:WHDRS,body:JSON.stringify(b)}).then(function(r){
    if(!r.ok)return r.json().then(function(e){throw new Error(e.message||'Error');});
    return r.json();
  });
}
function dbPatch(t,q,b){
  return fetch(SB+'/rest/v1/'+t+'?'+q,{method:'PATCH',headers:WHDRS,body:JSON.stringify(b)}).then(function(r){
    if(!r.ok)return r.json().then(function(e){throw new Error(e.message||'Error');});
    return r.json();
  });
}
function dbDel(t,q){
  return fetch(SB+'/rest/v1/'+t+'?'+q,{method:'DELETE',headers:RHDRS});
}

function loadAll(){
  sync(true,'Loading...');
  return Promise.all([dbGet('leads'),dbGet('orders'),dbGet('supplier_pos'),dbGet('invoices'),dbGet('labour_rates').catch(function(){return[];}),dbGet('work_instructions').catch(function(){return[];}),dbGet('month_settings').catch(function(){return[];}),dbGet('planner_items').catch(function(){return[];}),dbGet('drawings').catch(function(){return[];})]).then(function(res){
    leads=res[0];orders=res[1];spos=res[2];jcs=[];invs=res[3];lrates=res[4]||[];wis=res[5]||[];msettings=res[6]||[];planr=(res[7]||[]).sort(function(a,b){return (+a.seq||0)-(+b.seq||0);});drws=res[8]||[];
    sync(false,'Live');
  }).catch(function(e){sync(false,'Error',true);toast('Load error: '+e.message,'e');});
}

function doLogin(){
  var u=document.getElementById('lu').value.trim().toLowerCase();
  var p=document.getElementById('lp').value;
  var m=null;
  for(var i=0;i<USERS.length;i++){if(USERS[i].u===u&&USERS[i].p===p){m=USERS[i];break;}}
  if(!m){document.getElementById('lerr').style.display='block';return;}
  cUser=m;
  try{sessionStorage.setItem('mm',JSON.stringify(m));}catch(e){}
  launch();
}

function logout(){
  try{sessionStorage.removeItem('mm');}catch(e){}
  cUser=null;
  document.getElementById('app').style.display='none';
  document.getElementById('login').style.display='flex';
  document.getElementById('lp').value='';
  document.getElementById('lerr').style.display='none';
}

function launch(){
  document.getElementById('login').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('hdate').textContent=new Date().toLocaleDateString('en-ZA',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
  document.getElementById('uname').textContent=cUser.name;
  document.getElementById('urole').textContent=cUser.role+(cUser.bu?' — '+cUser.bu:'');
  // Hide restricted tabs for HODs
  var isHOD=cUser.role==='HOD';
  var finTab=document.getElementById('finTab');
  var jcostTab=document.getElementById('jcostTab');
  var lratesTab=document.getElementById('lratesTab');
  if(finTab)finTab.style.display=isHOD?'none':'';
  if(jcostTab)jcostTab.style.display=isHOD?'none':'';
  if(lratesTab)lratesTab.style.display=isHOD?'none':'';
  loadAll().then(function(){go('dash');});
}

document.getElementById('loginBtn').addEventListener('click',doLogin);
document.getElementById('logoutBtn').addEventListener('click',logout);
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.getElementById('login').style.display!=='none')doLogin();});

document.getElementById('nav').addEventListener('click',function(e){
  var btn=e.target.closest('.nbtn');
  if(!btn)return;
  document.querySelectorAll('.nbtn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  go(btn.getAttribute('data-tab'));
});

var R=function(v){return 'R\u202f'+(Math.round(v||0)).toLocaleString('en-ZA');};
var td=function(){return new Date().toISOString().split('T')[0];};
var dd=function(d){return Math.round((new Date(d)-new Date(td()))/86400000);};
var fd=function(d){return d?String(d).split('-').reverse().join('/'):'—';};
var gv=function(id){var e=document.getElementById(id);return e?e.value:'';};
var fmtD=function(v){if(!v)return null;try{var d=new Date(v);if(isNaN(d.getTime()))return null;return d.toISOString().split('T')[0];}catch(e){return null;}};
var buO=function(s){return BUS.map(function(b){return '<option'+(b===s?' selected':'')+'>'+b+'</option>';}).join('');};
var buS=function(id,s){return '<select id="'+id+'">'+buO(s)+'</select>';};

function sla(due,status){
  if(!due||['Completed','Won','Lost','Moved'].indexOf(status)>=0)return '';
  var d=dd(due);
  if(d<0)return '<span class="sla-late">'+Math.abs(d)+'d late</span>';
  if(d===0)return '<span class="sla-warn">Today</span>';
  return '<span class="sla-ok">'+d+'d left</span>';
}
function lbadge(s){var m={Lead:'b-lead',Quoted:'b-quoted',Won:'b-won',Lost:'b-lost',Moved:'b-inv'};return '<span class="badge '+(m[s]||'b-lead')+'">'+s+'</span>';}
function obadge(s){var m={Open:'b-open','In progress':'b-prog',Completed:'b-done'};return '<span class="badge '+(m[s]||'b-open')+'">'+s+'</span>';}

var _tt;
function toast(msg,type){
  var t=document.getElementById('toast');
  t.textContent=msg;t.className='show t'+(type||'i');
  clearTimeout(_tt);_tt=setTimeout(function(){t.className='';},3000);
}
function sync(on,lbl,err){
  var d=document.getElementById('sdot'),l=document.getElementById('slbl');
  if(!d)return;
  d.className='sdot'+(on?' syncing':err?' err':'');
  l.textContent=lbl;
}
function openM(html){
  closeM();
  var el=document.createElement('div');
  el.className='mov';el.id='mov';
  el.innerHTML='<div class="mbox">'+html+'</div>';
  el.addEventListener('click',function(e){if(e.target===el)closeM();});
  document.body.appendChild(el);
}
function closeM(){var e=document.getElementById('mov');if(e)e.remove();}
function cfm(title,msg,cb){
  var el=document.createElement('div');el.className='cov';el.id='cov';
  el.innerHTML='<div class="cbox"><h4>'+title+'</h4><p>'+msg+'</p><div class="cbtns"><button class="btn" id="cfmNo">Cancel</button><button class="btn btn-del" id="cfmYes">Delete</button></div></div>';
  document.body.appendChild(el);
  document.getElementById('cfmNo').addEventListener('click',function(){el.remove();});
  document.getElementById('cfmYes').addEventListener('click',function(){el.remove();cb();});
}

function xlx(data,cols,file,sheet){
  var ws=XLSX.utils.aoa_to_sheet([cols.map(function(c){return c.l;}),].concat(data.map(function(r){return cols.map(function(c){return r[c.k]!==undefined?r[c.k]:'';})})));
  ws['!cols']=cols.map(function(c){return {wch:c.w||14};});
  var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet);
  XLSX.writeFile(wb,file);toast('Excel exported','s');
}

function go(tab){
  var renders={dash:rDash,leads:rLeads,orders:rOrders,buyer:rBuyer,fin:rFin,wi:rWI,jcosting:rJobCosting,lrates:rLRates,reports:rReports,planner:rPlanner,drawings:rDrawings};
  var body=document.getElementById('body');
  body.innerHTML=renders[tab]?renders[tab]():'';
  if(tab==='planner')setTimeout(renderPlanner,0);
  if(tab==='leads')setTimeout(fLeads,0);
  if(tab==='orders')setTimeout(fOrders,0);
}

function getJobCostPct(ref,quoteVal){
  var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===ref){ord=orders[i];break;}}
  // If order value is 0 or missing, percentages are meaningless
  if(!quoteVal||quoteVal<=0)return {matPct:-1,labPct:-1,matSpent:0,labCost:0,matBudget:0,labBudget:0};
  var matBudget=ord&&+ord.mat_budget>0?+ord.mat_budget:0;
  var labBudget=ord&&+ord.lab_budget>0?+ord.lab_budget:0;
  // Materials from buyer sheet
  var matSpent=spos.filter(function(p){return p.job_ref===ref;}).reduce(function(s,p){return s+(+p.amount||0);},0);
  // Labour from WIs
  var jobWIs=wis.filter(function(w){return w.job_ref===ref;});
  var labCost=0;
  jobWIs.forEach(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    labData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      var rate=0;for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===e.emp){rate=+lrates[i].rate||0;break;}}
      labCost+=hrs*rate;
    });
  });
  var matPct=matBudget>0?Math.round(matSpent/matBudget*100):-1;
  var labPct=labBudget>0?Math.round(labCost/labBudget*100):-1;
  return {matPct:matPct,labPct:labPct,matSpent:matSpent,labCost:Math.round(labCost),matBudget:matBudget,labBudget:labBudget};
}

function rDash(){
  var pipe=leads.filter(function(l){return l.status==='Lead'||l.status==='Quoted';}).reduce(function(s,l){return s+(+l.quote_val||0);},0);
  var totalLeads=leads.filter(function(l){return l.status==='Lead'||l.status==='Quoted'||l.status==='Won'||l.status==='Lost'||l.status==='Moved';}).length;
  var won=leads.filter(function(l){return l.status==='Won'||l.status==='Moved';}).length;
  var convPct=totalLeads>0?Math.round(won/totalLeads*100):0;
  var outstandingLeads=leads.filter(function(l){return l.status==='Lead';}).length;
  var quotedLeads=leads.filter(function(l){return l.status==='Quoted';}).length;
  var activeLeadPool=outstandingLeads+quotedLeads;
  var notQuotedPct=activeLeadPool>0?Math.round(outstandingLeads/activeLeadPool*100):0;
  var openOrds=orders.filter(function(o){return !o.invoiced&&o.status!=='Completed';});
  var openV=openOrds.reduce(function(s,o){return s+(+o.order_val||0);},0);
  var lateO=openOrds.filter(function(o){return o.due<td();}).length;
  var lateQ=leads.filter(function(l){return l.status==='Lead'&&l.quote_due<td();}).length;
  var invT=invs.reduce(function(s,i){return s+(+i.order_val||0);},0);
  var prof=invs.reduce(function(s,i){return s+(+i.order_val||0)-(+i.mat_cost||0)-(+i.labour_cost||0)-(+i.overheads||0);},0);
  var mg=invT>0?Math.round(prof/invT*100):0;

  // High risk jobs — mat% or lab% >= 85
  var drwBlocked=openOrds.filter(function(o){return jobDrwStatus(o.ref).state==='pending';});
  var drwBlockedVal=drwBlocked.reduce(function(s,o){return s+(+o.order_val||0);},0);
  var noBudgetCount=openOrds.filter(function(o){return (!o.mat_budget||+o.mat_budget===0)&&(!o.lab_budget||+o.lab_budget===0)&&+o.order_val>0;}).length;
  var highRisk=openOrds.filter(function(o){
    var cp=getJobCostPct(o.ref,+o.order_val||1);
    return (cp.matPct>=85&&cp.matPct>=0)||(cp.labPct>=85&&cp.labPct>=0);
  });
  var overspent=openOrds.filter(function(o){
    var cp=getJobCostPct(o.ref,+o.order_val||1);
    return (cp.matPct>100&&cp.matPct>=0)||(cp.labPct>100&&cp.labPct>=0);
  });

  var buR=BUS.map(function(bu){
    var v=openOrds.filter(function(o){return o.bu===bu;}).reduce(function(s,o){return s+(+o.order_val||0);},0);
    var n=openOrds.filter(function(o){return o.bu===bu;}).length;
    var ov=openOrds.filter(function(o){return o.bu===bu&&o.due<td();}).length;
    return v>0?'<tr><td style="font-weight:500">'+bu+'</td><td class="mono">'+R(v)+'</td><td style="text-align:center">'+n+'</td><td>'+(ov>0?'<span style="color:#c53030;font-weight:600;font-size:11px">&#9888; '+ov+' overdue</span>':'<span style="color:#276749;font-weight:600;font-size:11px">&#10003; On track</span>')+'</td></tr>':'';
  }).join('');

  // High risk rows
  var hrRows=highRisk.map(function(o){
    var cp=getJobCostPct(o.ref,+o.order_val||1);
    var matBadge=cp.matPct>=100?'<span style="background:#fff5f5;color:#9b1c1c;border:1px solid #fed7d7;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">🔴 '+cp.matPct+'%</span>':cp.matPct>=85?'<span style="background:#fffbeb;color:#92400e;border:1px solid #fcd34d;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">🟡 '+cp.matPct+'%</span>':'<span style="font-size:11px">'+cp.matPct+'%</span>';
    var labBadge=cp.labPct>=100?'<span style="background:#fff5f5;color:#9b1c1c;border:1px solid #fed7d7;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">🔴 '+cp.labPct+'%</span>':cp.labPct>=85?'<span style="background:#fffbeb;color:#92400e;border:1px solid #fcd34d;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">🟡 '+cp.labPct+'%</span>':'<span style="font-size:11px">'+cp.labPct+'%</span>';
    return '<tr><td class="mono" style="font-weight:600">'+o.ref+'</td><td>'+o.client+'</td><td><span class="badge b-bu">'+o.bu+'</span></td><td class="mono">'+R(+o.order_val)+'</td><td style="text-align:center">'+matBadge+'</td><td style="text-align:center">'+labBadge+'</td><td>'+obadge(o.status)+'</td></tr>';
  }).join('');

  return '<div class="kpis">'
  +'<div class="kpi cgo"><div class="kpi-l">Pipeline value</div><div class="kpi-v">'+R(pipe)+'</div><div class="kpi-s">'+leads.filter(function(l){return l.status==='Lead'||l.status==='Quoted';}).length+' active leads</div></div>'
  +'<div class="kpi '+(notQuotedPct>=50?'cr':notQuotedPct>=25?'ca':'cg')+'">'
  +'<div class="kpi-l">Leads vs quotes</div>'
  +'<div style="display:flex;align-items:baseline;gap:8px;margin-top:2px">'
  +'<div style="text-align:center;flex:1"><div class="kpi-v" style="color:'+(outstandingLeads>0?'#d97706':'#276749')+'">'+outstandingLeads+'</div><div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.05em;margin-top:3px">Leads</div></div>'
  +'<div style="width:1px;align-self:stretch;background:var(--border)"></div>'
  +'<div style="text-align:center;flex:1"><div class="kpi-v" style="color:#276749">'+quotedLeads+'</div><div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.05em;margin-top:3px">Quoted</div></div>'
  +'</div>'
  +'<div class="kpi-s" style="margin-top:6px;border-top:1px solid var(--border);padding-top:5px">'+notQuotedPct+'% not quoted yet</div>'
  +'</div>'
  +'<div class="kpi '+(convPct>=50?'cg':convPct>=25?'ca':'cr')+'"><div class="kpi-l">Quote conversion</div><div class="kpi-v">'+convPct+'%</div><div class="kpi-s">'+won+' won of '+totalLeads+' quotes</div></div>'
  +'<div class="kpi cb"><div class="kpi-l">Open order book</div><div class="kpi-v">'+R(openV)+'</div><div class="kpi-s">'+openOrds.length+' active jobs</div></div>'
  +'<div class="kpi '+(lateO>0?'cr':'cg')+'"><div class="kpi-l">Overdue orders</div><div class="kpi-v">'+lateO+'</div><div class="kpi-s">Past due date</div></div>'
  
  +'<div class="kpi '+(drwBlocked.length>0?'cr':'cg')+'"><div class="kpi-l">Blocked on drawings</div><div class="kpi-v">'+drwBlocked.length+'</div><div class="kpi-s">'+R(drwBlockedVal)+' held up</div></div>'
  +'<div class="kpi '+(noBudgetCount>0?'ca':'cg')+'"><div class="kpi-l">No budget set</div><div class="kpi-v">'+noBudgetCount+'</div><div class="kpi-s">Jobs need budget</div></div>'
  +'<div class="kpi '+(highRisk.length>0?'cr':'cg')+'"><div class="kpi-l">High risk jobs</div><div class="kpi-v">'+highRisk.length+'</div><div class="kpi-s">85%+ budget used</div></div>'
  +'<div class="kpi '+(overspent.length>0?'cr':'cg')+'"><div class="kpi-l">Overspent jobs</div><div class="kpi-v">'+overspent.length+'</div><div class="kpi-s">100%+ budget used</div></div>'
  +'<div class="kpi '+(mg>15?'cg':mg>0?'ca':'cr')+'"><div class="kpi-l">Gross margin</div><div class="kpi-v">'+mg+'%</div><div class="kpi-s">Invoiced work</div></div>'
  +'</div>'

  // BU table
  +'<div class="card"><div class="card-hd"><h3>Order book by business unit</h3><button class="btn btn-sm" id="refreshBtn">&#8635; Refresh</button></div><div class="tw"><table><thead><tr><th>Business unit</th><th>Open value</th><th style="text-align:center">Orders</th><th>Health</th></tr></thead><tbody>'+(buR||'<tr><td colspan="4" class="empty">No open orders</td></tr>')+'</tbody></table></div></div>'

  // High risk alert table
  +(highRisk.length>0?'<div class="card"><div class="card-hd" style="background:#fff5f5;border-bottom:2px solid #fed7d7"><h3 style="color:#9b1c1c">&#9888; High Risk &amp; Overspent Jobs</h3></div><div class="tw"><table><thead><tr><th>Job #</th><th>Client</th><th>BU</th><th>Value</th><th style="text-align:center">Mat %</th><th style="text-align:center">Lab %</th><th>Status</th></tr></thead><tbody>'+hrRows+'</tbody></table></div></div>':'')

  // Live feed — active jobs only, no completed
  +'<div class="card"><div class="card-hd"><h3>Live order feed — active jobs</h3></div><div class="tw"><table><thead><tr><th>Job #</th><th>Client</th><th>BU</th><th>Value</th><th>Due</th><th>SLA</th><th style="text-align:center">Mat %</th><th style="text-align:center">Lab %</th><th>Status</th></tr></thead><tbody>'
  +openOrds.map(function(o){
    var cp=getJobCostPct(o.ref,+o.order_val||1);
    var noBdg=(!o.mat_budget||+o.mat_budget===0)&&(!o.lab_budget||+o.lab_budget===0);
    var noBdgBadge='<span style="background:#f4f6f9;color:#a0aec0;border:1px solid #e2e8f0;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600">No budget</span>';
    function pctBadge(p){if(noBdg)return noBdgBadge;if(p<0)return '<span style="color:#a0aec0;font-size:11px">—</span>';return p>=100?'<span style="color:#c53030;font-weight:700;font-size:11px">'+p+'%</span>':p>=85?'<span style="color:#d97706;font-weight:700;font-size:11px">'+p+'%</span>':'<span style="color:#276749;font-size:11px">'+p+'%</span>';}
    return '<tr><td class="mono">'+o.ref+'</td><td>'+o.client+'</td><td><span class="badge b-bu">'+o.bu+'</span></td><td class="mono">'+R(+o.order_val)+'</td><td class="mono">'+fd(o.due)+'</td><td>'+sla(o.due,o.status)+'</td><td style="text-align:center">'+pctBadge(cp.matPct)+'</td><td style="text-align:center">'+pctBadge(cp.labPct)+'</td><td>'+obadge(o.status)+'</td></tr>';
  }).join('')
  +'</tbody></table></div></div>';
}

function rLeads(){
  var lQ=leads.filter(function(l){return l.status==='Lead'&&l.quote_due<td();}).length;
  var pipe=leads.filter(function(l){return l.status==='Quoted';}).reduce(function(s,l){return s+(+l.quote_val||0);},0);
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Active leads</div><div class="kpi-v">'+leads.filter(function(l){return l.status!=='Moved';}).length+'</div></div><div class="kpi '+(lQ>0?'cr':'cg')+'"><div class="kpi-l">Overdue quotes</div><div class="kpi-v">'+lQ+'</div><div class="kpi-s">3-day SLA</div></div><div class="kpi cg"><div class="kpi-l">Won</div><div class="kpi-v">'+leads.filter(function(l){return l.status==='Won'||l.status==='Moved';}).length+'</div></div><div class="kpi cr"><div class="kpi-l">Lost</div><div class="kpi-v">'+leads.filter(function(l){return l.status==='Lost';}).length+'</div></div><div class="kpi cgo"><div class="kpi-l">Pipeline value</div><div class="kpi-v">'+R(pipe)+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Leads &amp; quotes register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addLeadBtn">+ Add lead</button><button class="btn btn-e" id="expLeadsBtn">&#8595; Excel</button></div></div>'
  +'<div class="toolbar"><input type="text" id="ls" placeholder="Search..."><select id="lbu"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><select id="lst"><option value="">All statuses</option><option>Lead</option><option>Quoted</option><option>Won</option><option>Lost</option></select></div>'
  +'<div class="tw"><table><thead><tr><th>Ref</th><th>Client</th><th>BU</th><th>Type</th><th>Quote due</th><th>SLA</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead><tbody id="ltb"><tr><td colspan="9" class="empty">Loading...</td></tr></tbody></table></div></div>';
}

function fLeads(){
  var s=(document.getElementById('ls')||{}).value?document.getElementById('ls').value.toLowerCase():'';
  var bu=gv('lbu'),st=gv('lst');
  var f=leads.filter(function(l){
    if(l.status==='Moved')return false;
    if(s&&(l.client+l.ref+l.type+l.bu).toLowerCase().indexOf(s)<0)return false;
    if(bu&&l.bu!==bu)return false;
    if(st&&l.status!==st)return false;
    return true;
  });
  var tb=document.getElementById('ltb');if(!tb)return;
  if(!f.length){tb.innerHTML='<tr><td colspan="9" class="empty">No records match</td></tr>';return;}
  tb.innerHTML=f.map(function(l){
    var moveBtn=(l.status==='Quoted'||l.status==='Won')?'<button class="btn btn-won btn-sm" data-id="'+l.id+'" data-action="wonToOrder">&rarr; Order Book</button> ':'';
    return '<tr><td class="mono">'+l.ref+'</td><td title="'+l.client+'">'+l.client+'</td><td><span class="badge b-bu">'+l.bu+'</span></td><td>'+l.type+'</td><td class="mono">'+fd(l.quote_due)+'</td><td>'+sla(l.quote_due,l.status)+'</td><td class="mono">'+(+l.quote_val>0?R(+l.quote_val):'TBD')+'</td><td>'+lbadge(l.status)+'</td><td>'+moveBtn+'<button class="btn-g" data-id="'+l.id+'" data-action="editLead">&#9998;</button><button class="btn-d" data-id="'+l.id+'" data-action="delLead">&#10005;</button></td></tr>';
  }).join('');
}

function rOrders(){
  var open=orders.filter(function(o){return !o.invoiced;});
  var openV=open.reduce(function(s,o){return s+(+o.order_val||0);},0);
  var late=open.filter(function(o){return o.due<td();}).length;
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Open orders</div><div class="kpi-v">'+open.length+'</div></div><div class="kpi cgo"><div class="kpi-l">Order book value</div><div class="kpi-v">'+R(openV)+'</div></div><div class="kpi '+(late>0?'cr':'cg')+'"><div class="kpi-l">Overdue</div><div class="kpi-v">'+late+'</div><div class="kpi-s">Past due date</div></div><div class="kpi cg"><div class="kpi-l">Completed</div><div class="kpi-v">'+orders.filter(function(o){return o.status==='Completed';}).length+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Order book register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addOrderBtn">+ Add order</button><button class="btn btn-sm" id="addSubJobBtn" style="background:#f0fff4;color:#276749;border-color:#c6f6d5">+ Add sub-job</button><button class="btn btn-e" id="expOrdersBtn">&#8595; Excel</button></div></div>'
  +'<div class="toolbar"><input type="text" id="os" placeholder="Search..."><select id="obu"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><select id="ost"><option value="">All statuses</option><option>Open</option><option>In progress</option><option>Completed</option></select></div>'
  +'<div class="tw"><table><thead><tr><th>Job #</th><th>Client</th><th>Client PO #</th><th>BU</th><th>Value</th><th>Due</th><th>SLA</th><th style="text-align:center">Drawings</th><th style="text-align:center">Mat %</th><th style="text-align:center">Lab %</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead><tbody id="otb"><tr><td colspan="13" class="empty">Loading...</td></tr></tbody></table></div></div>';
}

function orderRow(o,isSubJob){
  var slaTd=sla(o.due,o.status);
  var finBtn=o.status==='Completed'&&!isSubJob?'<button class="btn btn-won btn-sm" data-id="'+o.id+'" data-action="toFinance">&rarr; Finance</button> ':'';
  var cp=getJobCostPct(o.ref,+o.order_val||1);
  var noBudget=(!o.mat_budget||+o.mat_budget===0)&&(!o.lab_budget||+o.lab_budget===0);
  var noBadge='<span style="background:#f4f6f9;color:#a0aec0;border:1px solid #e2e8f0;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600">No budget</span>';
  function pBadge(p){if(noBudget)return noBadge;if(p<0)return '<span style="color:#a0aec0;font-size:11px">—</span>';return p>=100?'<span style="color:#c53030;font-weight:700;font-size:11px">'+p+'%</span>':p>=85?'<span style="color:#d97706;font-weight:700;font-size:11px">'+p+'%</span>':'<span style="color:#276749;font-size:11px">'+p+'%</span>';}
  var subStyle=isSubJob?'background:#f8fafc;':'';
  var refDisplay=isSubJob?'<span style="color:#a0aec0;margin-right:3px">&#8627;</span><button class="btn-g" style="font-family:monospace;font-size:11px;font-weight:600;color:#4a6741;padding:2px 4px" data-id="'+o.id+'" data-action="showJobCost">'+o.ref+'</button>':'<button class="btn-g" style="font-family:monospace;font-size:11px;font-weight:600;color:var(--navy);padding:2px 4px" data-id="'+o.id+'" data-action="showJobCost">'+o.ref+'</button>';
  return '<tr style="'+subStyle+'"><td class="mono">'+refDisplay+'</td><td>'+(isSubJob?'<span style="color:#718096;font-size:11px">'+o.client+'</span>':o.client)+'</td><td class="mono" style="font-size:11px">'+(o.client_po||'—')+'</td><td><span class="badge b-bu">'+o.bu+'</span></td><td class="mono">'+R(+o.order_val)+'</td><td class="mono">'+fd(o.due)+'</td><td>'+slaTd+'</td><td style="text-align:center">'+jobDrwPill(o.ref)+'</td><td style="text-align:center">'+pBadge(cp.matPct)+'</td><td style="text-align:center">'+pBadge(cp.labPct)+'</td><td>'+obadge(o.status)+'</td><td style="white-space:normal;font-size:11px;color:#718096;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(o.notes||'—')+'</td><td style="white-space:nowrap">'+finBtn+'<button class="btn-g" data-id="'+o.id+'" data-action="editOrder">&#9998;</button><button class="btn-d" data-id="'+o.id+'" data-action="delOrder">&#10005;</button></td></tr>';
}

function fOrders(){
  var s=(document.getElementById('os')||{}).value?document.getElementById('os').value.toLowerCase():'';
  var bu=gv('obu'),st=gv('ost');
  var f=orders.filter(function(o){
    if(o.invoiced)return false;
    if(cUser&&cUser.role==='HOD'&&o.bu!==cUser.bu&&(!cUser.bu2||o.bu!==cUser.bu2))return false;
    if(s&&(o.client+o.ref+o.bu+(o.master_ref||'')).toLowerCase().indexOf(s)<0)return false;
    if(bu&&o.bu!==bu)return false;
    if(st&&o.status!==st)return false;
    return true;
  });
  var tb=document.getElementById('otb');if(!tb)return;
  if(!f.length){tb.innerHTML='<tr><td colspan="13" class="empty">No records match</td></tr>';return;}
  // Separate masters and sub-jobs
  var masters=f.filter(function(o){return !o.master_ref;});
  var subJobs=f.filter(function(o){return !!o.master_ref;});
  var rows='';
  masters.forEach(function(o){
    rows+=orderRow(o,false);
    // Append sub-jobs under this master
    var subs=subJobs.filter(function(s){return s.master_ref===o.ref;});
    subs.forEach(function(sub){rows+=orderRow(sub,true);});
  });
  // Any sub-jobs whose master is not in current filter — show them too
  subJobs.forEach(function(sub){
    var masterInList=masters.some(function(m){return m.ref===sub.master_ref;});
    if(!masterInList)rows+=orderRow(sub,true);
  });
  tb.innerHTML=rows||'<tr><td colspan="13" class="empty">No records match</td></tr>';
}

function rBuyer(){
  var tot=spos.reduce(function(s,p){return s+(+p.amount||0);},0);
  var pend=spos.filter(function(p){return !p.received;}).reduce(function(s,p){return s+(+p.amount||0);},0);
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Supplier POs</div><div class="kpi-v">'+spos.length+'</div></div><div class="kpi cgo"><div class="kpi-l">Total committed</div><div class="kpi-v">'+R(tot)+'</div></div><div class="kpi ca"><div class="kpi-l">Pending delivery</div><div class="kpi-v">'+spos.filter(function(p){return !p.received;}).length+'</div><div class="kpi-s">'+R(pend)+'</div></div><div class="kpi cg"><div class="kpi-l">Received</div><div class="kpi-v">'+spos.filter(function(p){return p.received;}).length+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Supplier purchase orders</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addSPOBtn">+ Add PO</button><button class="btn btn-e" id="expBuyerBtn">&#8595; Excel</button></div></div>'
  +'<div class="toolbar"><input type="text" id="bs" placeholder="Search SPO, job, supplier..."><select id="bbu"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><select id="bst"><option value="">All statuses</option><option value="received">Received</option><option value="pending">Pending</option></select></div>'
  +'<div class="tw"><table><thead><tr><th>SPO ref</th><th>Job #</th><th>BU</th><th>Supplier</th><th>Description</th><th>Amount</th><th>Ordered</th><th>Status</th><th>Actions</th></tr></thead><tbody id="btb">'+rSPOrows()+'</tbody></table></div></div>';
}

function rSPOrows(){
  var s=document.getElementById('bs')?document.getElementById('bs').value.toLowerCase():'';
  var bu=gv('bbu');
  var st=gv('bst');
  var f=spos.filter(function(p){
    if(s&&(p.spref+p.job_ref+p.supplier+p.description).toLowerCase().indexOf(s)<0)return false;
    if(bu&&p.bu!==bu)return false;
    if(st==='received'&&!p.received)return false;
    if(st==='pending'&&p.received)return false;
    return true;
  });
  if(!f.length)return '<tr><td colspan="9" class="empty">No supplier POs</td></tr>';
  return f.map(function(p){
    return '<tr><td class="mono">'+p.spref+'</td><td class="mono">'+p.job_ref+'</td><td><span class="badge b-bu">'+p.bu+'</span></td><td>'+p.supplier+'</td><td style="white-space:normal;font-size:11px;line-height:1.4">'+p.description+'</td><td class="mono">'+R(+p.amount)+'</td><td class="mono">'+fd(p.ordered)+'</td><td><span class="badge '+(p.received?'b-recv':'b-pend')+'">'+(p.received?'Received':'Pending')+'</span></td><td><button class="btn-g" data-id="'+p.id+'" data-action="togSPO" title="'+(p.received?'Mark pending':'Mark received')+'">'+(p.received?'&#8617;':'&#10003;')+'</button>&nbsp;<button class="btn-g" data-id="'+p.id+'" data-action="editSPO">&#9998;</button>&nbsp;<button class="btn-d" data-id="'+p.id+'" data-action="delSPO">&#10005;</button></td></tr>';
  }).join('');
}

function rJC(){
  var over=jcs.filter(function(j){return (+j.actual_hrs||0)>(+j.budget_hrs||0)||(+j.mat_actual||0)>(+j.mat_budget||0);}).length;
  var totB=jcs.reduce(function(s,j){return s+(+j.budget_hrs||0);},0);
  var totA=jcs.reduce(function(s,j){return s+(+j.actual_hrs||0);},0);
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Total job cards</div><div class="kpi-v">'+jcs.length+'</div></div><div class="kpi '+(over>0?'cr':'cg')+'"><div class="kpi-l">Over budget</div><div class="kpi-v">'+over+'</div><div class="kpi-s">Hours or material</div></div><div class="kpi cb"><div class="kpi-l">Budget hours</div><div class="kpi-v">'+totB+'</div></div><div class="kpi '+(totA>totB?'cr':'cg')+'"><div class="kpi-l">Actual hours</div><div class="kpi-v">'+totA+'</div><div class="kpi-s">'+(totA>totB?'+'+(totA-totB)+' over':(totB-totA)+' left')+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Job card register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addJCBtn">+ Add job card</button><button class="btn btn-e" id="expJCBtn">&#8595; Excel</button></div></div>'
  +'<div class="toolbar"><input type="text" id="js" placeholder="Search JC ref, MM number, description..."><select id="jbu"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><select id="jst"><option value="">All statuses</option><option>Open</option><option>In progress</option><option>Completed</option></select></div>'
  +'<div class="tw"><table><thead><tr><th>JC ref</th><th>Job #</th><th>BU</th><th>Description</th><th>Assigned</th><th>Bdg Hr</th><th>Act Hr</th><th>Hr Var</th><th>Mat Bdg</th><th>Mat Act</th><th>Mat Var</th><th>Status</th><th class="sticky-col">Actions</th></tr></thead><tbody id="jtb"><tr><td colspan="13" class="empty">Loading...</td></tr></tbody></table></div></div>';
}

function fJCs(){
  var s=document.getElementById('js')?document.getElementById('js').value.toLowerCase():'';
  var bu=gv('jbu'),st=gv('jst');
  var f=jcs.filter(function(j){
    if(s&&(j.jcref+j.job_ref+j.description+j.assigned).toLowerCase().indexOf(s)<0)return false;
    if(bu&&j.bu!==bu)return false;
    if(st&&j.status!==st)return false;
    return true;
  });
  var tb=document.getElementById('jtb');if(!tb)return;
  if(!f.length){tb.innerHTML='<tr><td colspan="13" class="empty">No job cards match</td></tr>';return;}
  tb.innerHTML=f.map(function(j){
    var bH=+j.budget_hrs||0,aH=+j.actual_hrs||0,bM=+j.mat_budget||0,aM=+j.mat_actual||0;
    var hV=aH-bH,mV=aM-bM;
    return '<tr><td class="mono">'+j.jcref+'</td><td class="mono">'+j.job_ref+'</td><td><span class="badge b-bu">'+j.bu+'</span></td><td style="white-space:normal;font-size:11px;line-height:1.4">'+j.description+'</td><td>'+j.assigned+'</td><td class="mono">'+bH+'</td><td class="mono '+(aH>bH?'ob':'')+'">'+aH+'</td><td class="'+(hV>0?'pn':hV<0?'pp':'mono')+'">'+(hV===0?'—':(hV>0?'+':'')+hV)+'</td><td class="mono">'+R(bM)+'</td><td class="mono '+(aM>bM?'ob':'')+'">'+R(aM)+'</td><td class="'+(mV>0?'pn':mV<0?'pp':'mono')+'">'+(mV===0?'—':(mV>0?'+':'')+R(Math.abs(mV)))+'</td><td>'+obadge(j.status)+(aH>bH||aM>bM?' <span style="color:#c53030;font-size:11px">&#9888;</span>':'')+'</td><td class="sticky-col" style="white-space:nowrap"><button class="btn-g" data-id="'+j.id+'" data-action="editJC">&#9998;</button> <button class="btn-d" data-id="'+j.id+'" data-action="delJC">&#10005;</button></td></tr>';
  }).join('');
}

function rFin(){
  var comp=orders.filter(function(o){return o.status==='Completed'&&!o.invoiced;});
  var invT=invs.reduce(function(s,i){return s+(+i.order_val||0);},0);
  var invC=invs.reduce(function(s,i){return s+(+i.mat_cost||0)+(+i.labour_cost||0)+(+i.overheads||0);},0);
  var prof=invT-invC;var mg=invT>0?Math.round(prof/invT*100):0;
  return '<div class="kpis"><div class="kpi cgo"><div class="kpi-l">Total invoiced</div><div class="kpi-v">'+R(invT)+'</div></div><div class="kpi cn"><div class="kpi-l">Total cost</div><div class="kpi-v">'+R(invC)+'</div></div><div class="kpi '+(prof>0?'cg':'cr')+'"><div class="kpi-l">Gross profit</div><div class="kpi-v">'+R(prof)+'</div></div><div class="kpi '+(mg>20?'cg':mg>10?'ca':'cr')+'"><div class="kpi-l">Gross margin</div><div class="kpi-v">'+mg+'%</div></div><div class="kpi '+(comp.length>0?'ca':'cg')+'"><div class="kpi-l">Ready to invoice</div><div class="kpi-v">'+comp.length+'</div></div></div>'
  +(comp.length>0?'<div class="alert-a">&#9888; '+comp.length+' completed order'+(comp.length>1?'s':'')+' ready — '+comp.map(function(o){return o.ref;}).join(', ')+'<div style="display:flex;gap:6px;flex-wrap:wrap">'+comp.map(function(o){return '<button class="btn btn-sm" data-id="'+o.id+'" data-action="toFinance">&rarr; Invoice '+o.ref+'</button>';}).join('')+'</div></div>':'')
  +'<div class="card"><div class="card-hd"><h3>Invoice register &amp; profitability</h3><div class="card-hd-r"><select id="fbu" style="font-size:12px;padding:5px 9px;border:1px solid var(--border);border-radius:var(--r);background:#fff;outline:none"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><button class="btn btn-e" id="expFinBtn">&#8595; Excel</button></div></div>'
  +'<div class="tw"><table><thead><tr><th>Invoice ref</th><th>Job #</th><th>Client</th><th>BU</th><th>Value</th><th>Mat cost</th><th>Labour</th><th>OH</th><th>Profit</th><th>Margin</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+invs.map(function(i){var p=(+i.order_val||0)-(+i.mat_cost||0)-(+i.labour_cost||0)-(+i.overheads||0);var m=(+i.order_val||0)>0?Math.round(p/(+i.order_val||1)*100):0;return '<tr><td class="mono">'+i.inv_ref+'</td><td class="mono">'+i.job_ref+'</td><td>'+i.client+'</td><td><span class="badge b-bu">'+i.bu+'</span></td><td class="mono">'+R(+i.order_val)+'</td><td class="mono">'+R(+i.mat_cost)+'</td><td class="mono">'+R(+i.labour_cost)+'</td><td class="mono">'+R(+i.overheads)+'</td><td class="'+(p>0?'pp':'pn')+'">'+R(p)+'</td><td><span class="badge '+(m>20?'b-won':'b-lost')+'">'+m+'%</span></td><td class="mono">'+fd(i.invoiced_date)+'</td><td><span class="badge '+(i.status==='Paid'?'b-paid':'b-out')+'">'+i.status+'</span></td><td style="white-space:nowrap"><button class="btn-g" data-id="'+i.id+'" data-action="editInv">&#9998;</button> <button class="btn-d" data-id="'+i.id+'" data-action="delInv">&#10005;</button></td></tr>';}).join('')+(invs.length===0?'<tr><td colspan="13" class="empty">No invoices yet</td></tr>':'')+'</tbody></table></div></div>';
}

function wonToOrder(id){
  var l=null;for(var i=0;i<leads.length;i++){if(leads[i].id===id){l=leads[i];break;}}
  if(!l)return;
  openM('<div class="mtitle">Move to Order Book</div>'
  +'<p style="font-size:12px;color:#718096;margin-bottom:14px">Review and confirm the order details pulled from the quote.</p>'
  +'<div class="f2"><div class="mfr"><label>Job number (MM ref — locked)</label><input id="wOr" value="'+(l.ref||'')+'" readonly style="background:#f4f6f9;font-weight:600;color:var(--navy)"></div><div class="mfr"><label>Business unit</label>'+buS('wOb',l.bu)+'</div></div>'
  +'<div class="f2"><div class="mfr"><label>Client</label><input id="wOc" value="'+(l.client||'')+'"></div><div class="mfr"><label>Client PO number</label><input id="wOcpo" value=""></div></div>'
  +'<div class="mfr"><label>Work type</label><input id="wOt" value="'+(l.type||'')+'"></div>'
  +'<div class="mfr"><label>Order value (R) — from quote</label><input type="number" id="wOv" value="'+(l.quote_val||0)+'" oninput="calcWOTotal()"></div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:12px;margin-bottom:11px">'
  +'<div style="font-size:10px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Quote Budget Split</div>'
  +'<div class="f2"><div class="mfr"><label>Material budget (R)</label><input type="number" id="wOmb" value="0" oninput="calcWOTotal()"></div><div class="mfr"><label>Labour budget (R)</label><input type="number" id="wOlb" value="0" oninput="calcWOTotal()"></div></div>'
  +'<div style="font-size:11px;color:#718096;margin-top:4px">Total budget: <strong id="wOtotal" style="color:var(--navy)">R 0</strong> &nbsp;|&nbsp; Remaining unallocated: <strong id="wOunalloc" style="color:#718096">R 0</strong></div>'
  +'</div>'
  +'<div class="f2"><div class="mfr"><label>Date received</label><input type="date" id="wOrec" value="'+td()+'"></div><div class="mfr"><label>Due date</label><input type="date" id="wOd"></div></div>'
  +'<div class="mfr"><label>Notes</label><textarea id="wOn">'+(l.notes||'')+'</textarea></div>'
  +'<div class="mfoot"><button class="btn" id="cancelWon">Cancel</button><button class="btn btn-p" id="confirmWon">Confirm — move to Order Book</button></div>');
  document.getElementById('cancelWon').addEventListener('click',closeM);
  document.getElementById('confirmWon').addEventListener('click',function(){
    var order={ref:gv('wOr'),client:gv('wOc'),client_po:gv('wOcpo'),bu:gv('wOb'),type:gv('wOt'),order_val:+gv('wOv')||0,mat_budget:+gv('wOmb')||0,lab_budget:+gv('wOlb')||0,received:fmtD(gv('wOrec')),due:fmtD(gv('wOd')),status:'Open',job_cards:0,invoiced:false,notes:gv('wOn')};
    dbPost('orders',order).then(function(){
      return dbPatch('leads','id=eq.'+id,{status:'Moved'});
    }).then(function(){
      closeM();return loadAll();
    }).then(function(){
      go('leads');toast('Moved to Order Book','s');
    }).catch(function(e){toast(e.message,'e');});
  });
}

function toFinance(id){
  var o=null;for(var i=0;i<orders.length;i++){if(orders[i].id===id){o=orders[i];break;}}
  if(!o)return;
  // Materials from Buyer Sheet
  var linked=spos.filter(function(p){return p.job_ref===o.ref;});
  var matCost=linked.reduce(function(s,p){return s+(+p.amount||0);},0);
  // Labour from WI forms — per employee × their individual rate
  var jobWIs=wis.filter(function(w){return w.job_ref===o.ref;});
  var empTotals={};
  jobWIs.forEach(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    labData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      if(!empTotals[e.emp])empTotals[e.emp]=0;
      empTotals[e.emp]+=hrs;
    });
  });
  var labCost=0;
  var labHrs=0;
  Object.keys(empTotals).forEach(function(empName){
    var rate=0;
    for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===empName){rate=+lrates[i].rate||0;break;}}
    var hrs=empTotals[empName];
    labHrs+=hrs;
    labCost+=hrs*rate;
  });
  labCost=Math.round(labCost);
  // Standing time cost
  var stCost=0;
  jobWIs.forEach(function(w){
    var stData=w.standing_data?JSON.parse(w.standing_data):[];
    stData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      var rate=0;
      for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===e.emp){rate=+lrates[i].rate||0;break;}}
      stCost+=hrs*rate;
    });
  });
  stCost=Math.round(stCost);
  var oh=Math.round((+o.order_val||0)*0.08);
  var nr='INV-'+new Date().getFullYear()+'-'+String(invs.length+1).padStart(3,'0');
  var wiInfo=jobWIs.length>0?jobWIs.length+' WI'+(jobWIs.length!==1?'s':'')+' | '+labHrs+' hrs = '+R(labCost):'No WIs — labour R0';
  openM('<div class="mtitle">Move to Finance</div>'
  +'<div class="info-box"><div class="info-box-title">Auto-calculated from job '+o.ref+'</div><div class="info-box-sub">📦 '+linked.length+' supplier PO'+(linked.length!==1?'s':'')+' = '+R(matCost)+' &nbsp;|&nbsp; 🔧 '+wiInfo+(stCost>0?' &nbsp;|&nbsp; ⚠ Standing time = '+R(stCost):'')+'</div></div>'
  +'<div class="f2"><div class="mfr"><label>Invoice ref</label><input id="iRef" value="'+nr+'"></div><div class="mfr"><label>Invoice date</label><input type="date" id="iDate" value="'+td()+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Client</label><input id="iCl" value="'+o.client+'" readonly style="background:#f4f6f9"></div><div class="mfr"><label>Invoice value (R)</label><input type="number" id="iVal" value="'+(o.order_val||0)+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Material cost (R) — from Buyer Sheet</label><input type="number" id="iMat" value="'+matCost+'"></div><div class="mfr"><label>Labour cost (R) — from WI forms</label><input type="number" id="iLab" value="'+labCost+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Standing time cost (R)</label><input type="number" id="iST" value="'+stCost+'"></div><div class="mfr"><label>Overheads (R)</label><input type="number" id="iOH" value="'+oh+'"></div></div>'
  +'<div class="mfr"><label>Status</label><select id="iSt"><option>Outstanding</option><option>Paid</option></select></div>'
  +'<div class="mfoot"><button class="btn" id="cancelInv">Cancel</button><button class="btn btn-p" id="confirmInv">Confirm — move to Finance</button></div>');
  document.getElementById('cancelInv').addEventListener('click',closeM);
  document.getElementById('confirmInv').addEventListener('click',function(){
    var inv={inv_ref:gv('iRef'),job_ref:o.ref,client:gv('iCl'),bu:o.bu,order_val:+gv('iVal')||0,mat_cost:+gv('iMat')||0,labour_cost:+gv('iLab')||0,overheads:(+gv('iST')||0)+(+gv('iOH')||0),invoiced_date:fmtD(gv('iDate')),status:gv('iSt')};
    dbPost('invoices',inv).then(function(){
      return dbPatch('orders','id=eq.'+id,{invoiced:true,status:'Completed'});
    }).then(function(){
      closeM();return loadAll();
    }).then(function(){
      go('orders');toast('Invoice created in Finance','s');
    }).catch(function(e){toast(e.message,'e');});
  });
}

function oLead(id){
  var l=id?(function(){for(var i=0;i<leads.length;i++){if(leads[i].id===id)return leads[i];}return null;})():{};
  if(!l)l={};
  var nr='LB-'+new Date().getFullYear()+'-'+String(leads.length+1).padStart(3,'0');
  openM('<div class="mtitle">'+(id?'Edit lead':'New lead')+'</div>'
  +'<div class="f2"><div class="mfr"><label>Lead ref</label><input id="mLr" value="'+(l.ref||nr)+'"></div><div class="mfr"><label>Business unit</label>'+buS('mLb',l.bu)+'</div></div>'
  +'<div class="mfr"><label>Client name</label><input id="mLc" value="'+(l.client||'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Work type</label><input id="mLt" value="'+(l.type||'')+'"></div><div class="mfr"><label>Contact</label><input id="mLct" value="'+(l.contact||'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Date received</label><input type="date" id="mLrec" value="'+(l.received||td())+'"></div><div class="mfr"><label>Quote due (3-day SLA)</label><input type="date" id="mLd" value="'+(l.quote_due||'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Status</label><select id="mLs">'+['Lead','Quoted','Won','Lost'].map(function(s){return '<option'+(l.status===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div><div class="mfr"><label>Quote value (R)</label><input type="number" id="mLv" value="'+(l.quote_val||0)+'"></div></div>'
  +'<div class="mfr"><label>Notes</label><textarea id="mLn">'+(l.notes||'')+'</textarea></div>'
  +'<div class="mfoot"><button class="btn" id="cancelLead">Cancel</button><button class="btn btn-p" id="saveLead">Save lead</button></div>');
  document.getElementById('cancelLead').addEventListener('click',closeM);
  document.getElementById('saveLead').addEventListener('click',function(){
    var newRef=gv('mLr').trim();
    if(!newRef){toast('Please enter a job reference number','e');return;}
    // Duplicate MM Number check — only on new leads, not edits
    if(!id){
      var dupLead=leads.filter(function(l){return l.ref&&l.ref.trim().toLowerCase()===newRef.toLowerCase()&&l.status!=='Moved';});
      var dupOrder=orders.filter(function(o){return o.ref&&o.ref.trim().toLowerCase()===newRef.toLowerCase();});
      if(dupLead.length>0||dupOrder.length>0){
        toast('⚠ Job number '+newRef+' already exists — please use a unique MM number','e');
        document.getElementById('mLr').style.border='2px solid #c53030';
        return;
      }
    }
    var b={ref:newRef,client:gv('mLc'),bu:gv('mLb'),type:gv('mLt'),contact:gv('mLct'),received:fmtD(gv('mLrec')),quote_due:fmtD(gv('mLd')),status:gv('mLs'),quote_val:+gv('mLv')||0,notes:gv('mLn')};
    var p=id?dbPatch('leads','id=eq.'+id,b):dbPost('leads',b);
    p.then(function(){closeM();return loadAll();}).then(function(){go('leads');toast('Lead saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function oOrder(id){
  var o=id?(function(){for(var i=0;i<orders.length;i++){if(orders[i].id===id)return orders[i];}return null;})():{};
  if(!o)o={};
  var nr='MM'+String(orders.length+1).padStart(3,'0');
  openM('<div class="mtitle">'+(id?'Edit order':'New order')+'</div>'
  +'<div class="f2"><div class="mfr"><label>Job number</label><input id="mOr" value="'+(o.ref||nr)+'"></div><div class="mfr"><label>Business unit</label>'+buS('mOb',o.bu)+'</div></div>'
  +'<div class="f2"><div class="mfr"><label>Client</label><input id="mOc" value="'+(o.client||'')+'"></div><div class="mfr"><label>Client PO number</label><input id="mOcpo" value="'+(o.client_po||'')+'"></div></div>'
  +'<div class="mfr"><label>Work type</label><input id="mOt" value="'+(o.type||'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Order value (R)</label><input type="number" id="mOv" value="'+(o.order_val||0)+'"></div><div class="mfr"><label>Status</label><select id="mOs">'+['Open','In progress','Completed'].map(function(s){return '<option'+(o.status===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div></div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:12px;margin-bottom:11px"><div style="font-size:10px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Quote Budget Split</div><div class="f2"><div class="mfr"><label>Material budget (R)</label><input type="number" id="mOmb" value="'+(o.mat_budget||0)+'"></div><div class="mfr"><label>Labour budget (R)</label><input type="number" id="mOlb" value="'+(o.lab_budget||0)+'"></div></div></div>'
  +'<div class="f2"><div class="mfr"><label>Date received</label><input type="date" id="mOrec" value="'+(o.received||td())+'"></div><div class="mfr"><label>Due date</label><input type="date" id="mOd" value="'+(o.due||'')+'"></div></div>'
  +'<div class="mfr"><label>Notes</label><textarea id="mOn">'+(o.notes||'')+'</textarea></div>'
  +'<div class="mfoot"><button class="btn" id="cancelOrd">Cancel</button><button class="btn btn-p" id="saveOrd">Save order</button></div>');
  document.getElementById('cancelOrd').addEventListener('click',closeM);
  document.getElementById('saveOrd').addEventListener('click',function(){
    var b={ref:gv('mOr'),client:gv('mOc'),client_po:gv('mOcpo'),bu:gv('mOb'),type:gv('mOt'),order_val:+gv('mOv')||0,mat_budget:+gv('mOmb')||0,lab_budget:+gv('mOlb')||0,received:fmtD(gv('mOrec')),due:fmtD(gv('mOd')),status:gv('mOs'),job_cards:id?(function(){for(var i=0;i<orders.length;i++){if(orders[i].id===id)return orders[i].job_cards||0;}return 0;})():0,invoiced:false,notes:gv('mOn')};
    var p=id?dbPatch('orders','id=eq.'+id,b):dbPost('orders',b);
    p.then(function(){closeM();return loadAll();}).then(function(){go('orders');toast('Order saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function oSPO(){
  var nr='SPO-'+String(spos.length+1).padStart(3,'0');
  // Step 1: Show entry method selection
  openM('<div class="mtitle">New Supplier PO</div>'
  +'<p style="font-size:12px;color:#718096;margin-bottom:18px">How would you like to capture this PO?</p>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px">'
  +'<button id="spoManualBtn" style="padding:18px 12px;border:2px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:border-color .2s">'
  +'<div style="font-size:22px;margin-bottom:8px">✏️</div>'
  +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">Manual Entry</div>'
  +'<div style="font-size:11px;color:#718096">Fill in the form fields yourself</div>'
  +'</button>'
  +'<button id="spoPDFBtn" style="padding:18px 12px;border:2px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:border-color .2s">'
  +'<div style="font-size:22px;margin-bottom:8px">📄</div>'
  +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">Upload PDF</div>'
  +'<div style="font-size:11px;color:#718096">AI reads your PO and auto-fills</div>'
  +'</button>'
  +'</div>'
  +'<div class="mfoot"><button class="btn" id="cancelSPO">Cancel</button></div>');

  document.getElementById('cancelSPO').addEventListener('click',closeM);

  // Manual entry path
  document.getElementById('spoManualBtn').addEventListener('click',function(){
    oSPOForm({spref:nr,job_ref:'',bu:'',supplier:'',description:'',amount:0,ordered:td()});
  });

  // PDF upload path
  document.getElementById('spoPDFBtn').addEventListener('click',function(){
    closeM();
    openM('<div class="mtitle">Upload Supplier PO — PDF</div>'
    +'<div id="spoDropZone" style="border:2px dashed var(--border);border-radius:10px;padding:32px;text-align:center;cursor:pointer;transition:border-color .2s;margin-bottom:14px">'
    +'<div style="font-size:32px;margin-bottom:10px">📄</div>'
    +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">Click to select PO PDF</div>'
    +'<div style="font-size:11px;color:#718096">Claude AI will read the document and auto-populate the form</div>'
    +'<input type="file" id="spoPDFInput" accept=".pdf" style="display:none">'
    +'</div>'
    +'<div id="spoAIStatus" style="display:none;background:#f4f6f9;border-radius:8px;padding:12px;font-size:12px;color:#718096;text-align:center;margin-bottom:14px">'
    +'<span id="spoAIMsg">Reading PDF...</span>'
    +'</div>'
    +'<div class="mfoot"><button class="btn" id="cancelSPOPDF">Cancel</button></div>');

    document.getElementById('cancelSPOPDF').addEventListener('click',closeM);

    var dz=document.getElementById('spoDropZone');
    var fi=document.getElementById('spoPDFInput');

    dz.addEventListener('click',function(){fi.click();});
    dz.addEventListener('dragover',function(e){e.preventDefault();dz.style.borderColor='var(--navy)';});
    dz.addEventListener('dragleave',function(){dz.style.borderColor='var(--border)';});
    dz.addEventListener('drop',function(e){e.preventDefault();dz.style.borderColor='var(--border)';if(e.dataTransfer.files[0])processPDFPO(e.dataTransfer.files[0]);});
    fi.addEventListener('change',function(){if(fi.files[0])processPDFPO(fi.files[0]);});
  });
}

function processPDFPO(file){
  var status=document.getElementById('spoAIStatus');
  var msg=document.getElementById('spoAIMsg');
  if(!status||!msg)return;
  status.style.display='block';
  msg.textContent='Reading your PDF...';

  var fileURL=URL.createObjectURL(file);
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  pdfjsLib.getDocument(fileURL).promise.then(function(pdf){
    var pages=[];
    for(var i=1;i<=pdf.numPages;i++){pages.push(i);}
    return Promise.all(pages.map(function(n){
      return pdf.getPage(n).then(function(page){
        return page.getTextContent().then(function(tc){
          return tc.items.map(function(it){return it.str;}).join(' ');
        });
      });
    }));
  }).then(function(pageTexts){
    var txt=pageTexts.join(' ');
    msg.textContent='Extracting fields...';

    var parsed={spref:'SPO-'+String(spos.length+1).padStart(3,'0'),job_ref:'',bu:'',supplier:'',description:'',amount:0,ordered:td()};

    // PO Number
    var m1=txt.match(/NUMBER[:\s]+([A-Z0-9\-]+)/i);
    if(m1)parsed.spref=m1[1].trim();

    // MM Reference
    var m2=txt.match(/REFERENCE[:\s]+(MM\d+)/i)||txt.match(/\b(MM\d{3,})\b/);
    if(m2)parsed.job_ref=m2[1].trim();

    // Supplier name — on MM POs appears between SERVICES and VAT NO: (supplier side)
    var m3=txt.match(/SERVICES\s+([A-Z][A-Z\s&]{2,30}?)\s+SUPPLIER\s+VAT/);
    if(!m3)m3=txt.match(/AND\s+SERVICES\s+([A-Z][A-Z\s&]{2,30}?)\s+VAT/);
    if(m3)parsed.supplier=m3[1].trim();

    // Date
    var m4=txt.match(/(?:^|\s)DATE[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if(m4){var pt=m4[1].split('/');parsed.ordered=pt[2]+'-'+pt[1]+'-'+pt[0];}

    // Excl Total
    var m5=txt.match(/Total\s+Exclusive[:\s]+R?\s*([\d\s,]+\.?\d*)/i);
    if(m5)parsed.amount=parseFloat(m5[1].replace(/[\s,]/g,''))||0;

    // Description
    var m6=txt.match(/\d+\s+OFF\s+(.{10,80}?)(?:\s+R\d|\s+\d+\.)/);
    if(m6)parsed.description=m6[1].trim().substring(0,120);
    else if(parsed.supplier)parsed.description='Supplier PO from '+parsed.supplier;

    closeM();
    oSPOForm(parsed,true);
  }).catch(function(e){
    msg.textContent='Error: '+e.message;
    toast('PDF read failed — try manual entry','e');
  });
}

function oSPOForm(d,fromPDF){
  openM('<div class="mtitle">New Supplier PO'+(fromPDF?' <span style="background:#f0fff4;color:#276749;border:1px solid #c6f6d5;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;margin-left:8px">✓ AI Auto-filled</span>':'')+'</div>'
  +(fromPDF?'<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:6px;padding:9px 12px;font-size:11px;color:#276749;margin-bottom:14px">✓ Fields populated from PDF — please review before saving</div>':'')
  +'<div class="f2"><div class="mfr"><label>SPO ref</label><input id="mSr" value="'+(d.spref||'')+'"></div><div class="mfr"><label>Job number (MM ref)</label><input id="mSj" value="'+(d.job_ref||'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Business unit</label>'+buS('mSb',d.bu||'')+'</div><div class="mfr"><label>Supplier</label><input id="mSs" value="'+(d.supplier||'')+'"></div></div>'
  +'<div class="mfr"><label>Description</label><textarea id="mSd">'+(d.description||'')+'</textarea></div>'
  +'<div class="f2"><div class="mfr"><label>Excl. Amount (R)</label><input type="number" id="mSa" value="'+(d.amount||0)+'"></div><div class="mfr"><label>Date ordered</label><input type="date" id="mSdt" value="'+(d.ordered||td())+'"></div></div>'
  +'<div class="mfoot"><button class="btn" id="cancelSPO">Cancel</button><button class="btn btn-p" id="saveSPO">Save PO</button></div>');

  document.getElementById('cancelSPO').addEventListener('click',closeM);
  document.getElementById('saveSPO').addEventListener('click',function(){
    dbPost('supplier_pos',{spref:gv('mSr'),job_ref:gv('mSj'),bu:gv('mSb'),supplier:gv('mSs'),description:gv('mSd'),amount:+gv('mSa')||0,ordered:fmtD(gv('mSdt')),received:false})
    .then(function(){closeM();return loadAll();}).then(function(){go('buyer');toast('PO saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function oJC(editId){
  var j=editId?(function(){for(var i=0;i<jcs.length;i++){if(jcs[i].id===editId)return jcs[i];}return null;})():null;
  var availOrds=editId?orders:getOpenOrders();
  var ordOpts=availOrds.map(function(o){return '<option value="'+o.ref+'"'+(j&&j.job_ref===o.ref?' selected':'')+'>'+o.ref+' — '+o.client+'</option>';}).join('');
  if(!ordOpts)ordOpts='<option value="">No open orders available</option>';
  var initJob=j?j.job_ref:(availOrds.length?availOrds[0].ref:'');
  var initBU=j?j.bu:(availOrds.length?availOrds[0].bu:'');
  var initRef=j?j.jcref:autoJCRef(initJob);
  openM('<div class="mtitle">'+(editId?'Edit job card':'New job card')+'</div>'
  +'<div class="mfr"><label>Order number (MM ref)</label><select id="mJj" onchange="onJCOrderChange()"><option value="">Select open order...</option>'+ordOpts+'</select></div>'
  +'<div class="f2"><div class="mfr"><label>JC ref (auto-generated)</label><input id="mJr" value="'+initRef+'"></div><div class="mfr"><label>Business unit (auto)</label><input id="mJb" value="'+initBU+'" readonly style="background:#f4f6f9"></div></div>'
  +'<div class="mfr"><label>Assigned to</label><input id="mJa" value="'+(j?j.assigned||'':'')+'"></div>'
  +'<div class="mfr"><label>Description</label><input id="mJd" value="'+(j?j.description||'':'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Budget hours</label><input type="number" id="mJbh" value="'+(j?j.budget_hrs||0:0)+'"></div><div class="mfr"><label>Actual hours</label><input type="number" id="mJah" value="'+(j?j.actual_hrs||0:0)+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Material budget (R)</label><input type="number" id="mJmb" value="'+(j?j.mat_budget||0:0)+'"></div><div class="mfr"><label>Material actual (R)</label><input type="number" id="mJma" value="'+(j?j.mat_actual||0:0)+'"></div></div>'
  +'<div class="mfr"><label>Status</label><select id="mJs">'+['Open','In progress','Completed'].map(function(s){return '<option'+(j&&j.status===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'
  +'<div class="mfoot"><button class="btn" id="cancelJC">Cancel</button><button class="btn btn-p" id="saveJC">'+(editId?'Update job card':'Save job card')+'</button></div>');
  document.getElementById('cancelJC').addEventListener('click',closeM);
  document.getElementById('saveJC').addEventListener('click',function(){
    var jobRef=gv('mJj');
    if(!jobRef){toast('Please select an open order','e');return;}
    var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
    var data={jcref:gv('mJr'),job_ref:jobRef,bu:ord?ord.bu:gv('mJb'),description:gv('mJd'),assigned:gv('mJa'),budget_hrs:+gv('mJbh')||0,actual_hrs:+gv('mJah')||0,mat_budget:+gv('mJmb')||0,mat_actual:+gv('mJma')||0,status:gv('mJs')};
    var pr=editId?dbPatch('job_cards','id=eq.'+editId,data):dbPost('job_cards',data);
    pr.then(function(){closeM();return loadAll();}).then(function(){go('jc');toast(editId?'Job card updated':'Job card saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function onJCOrderChange(){
  var jobRef=gv('mJj');
  var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
  if(ord){
    document.getElementById('mJb').value=ord.bu;
    document.getElementById('mJr').value=autoJCRef(jobRef);
  }
}

function expLeads(){
  var bu=gv('lbu'),st=gv('lst');
  var f=leads.filter(function(l){return l.status!=='Moved'&&(!bu||l.bu===bu)&&(!st||l.status===st);});
  xlx(f.map(function(l){return {a:l.ref,b:l.client,c:l.bu,d:l.type,e:l.contact,f:fd(l.received),g:fd(l.quote_due),h:l.status,i:+l.quote_val||0,j:l.notes};}),
  [{k:'a',l:'Ref',w:14},{k:'b',l:'Client',w:22},{k:'c',l:'BU',w:18},{k:'d',l:'Type',w:16},{k:'e',l:'Contact',w:18},{k:'f',l:'Received',w:13},{k:'g',l:'Quote Due',w:12},{k:'h',l:'Status',w:10},{k:'i',l:'Quote Value',w:14},{k:'j',l:'Notes',w:30}],
  'MM_Leads.xlsx','New Business');
}
function expOrders(){
  var bu=gv('obu'),st=gv('ost');
  var f=orders.filter(function(o){return !o.invoiced&&(!bu||o.bu===bu)&&(!st||o.status===st);});
  xlx(f.map(function(o){return {a:o.ref,b:o.client,c:o.bu,d:o.type,e:+o.order_val||0,f:fd(o.received),g:fd(o.due),h:o.status,i:o.invoiced?'Yes':'No',j:o.notes};}),
  [{k:'a',l:'Job #',w:10},{k:'b',l:'Client',w:22},{k:'c',l:'BU',w:18},{k:'d',l:'Type',w:16},{k:'e',l:'Value',w:14},{k:'f',l:'Received',w:13},{k:'g',l:'Due',w:12},{k:'h',l:'Status',w:12},{k:'i',l:'Invoiced',w:9},{k:'j',l:'Notes',w:30}],
  'MM_Orders.xlsx','Order Book');
}
function expBuyer(){
  var bu=gv('bbu');
  var f=spos.filter(function(p){return !bu||p.bu===bu;});
  xlx(f.map(function(p){return {a:p.spref,b:p.job_ref,c:p.bu,d:p.supplier,e:p.description,f:+p.amount||0,g:fd(p.ordered),h:p.received?'Received':'Pending'};}),
  [{k:'a',l:'SPO Ref',w:12},{k:'b',l:'Job #',w:10},{k:'c',l:'BU',w:18},{k:'d',l:'Supplier',w:22},{k:'e',l:'Description',w:30},{k:'f',l:'Amount',w:14},{k:'g',l:'Ordered',w:13},{k:'h',l:'Status',w:12}],
  'MM_Buyer.xlsx','Supplier POs');
}
function expJC(){
  var bu=gv('jbu'),st=gv('jst');
  var f=jcs.filter(function(j){return (!bu||j.bu===bu)&&(!st||j.status===st);});
  xlx(f.map(function(j){var hV=(+j.actual_hrs||0)-(+j.budget_hrs||0),mV=(+j.mat_actual||0)-(+j.mat_budget||0);return {a:j.jcref,b:j.job_ref,c:j.bu,d:j.description,e:j.assigned,f:+j.budget_hrs||0,g:+j.actual_hrs||0,h:hV,i:+j.mat_budget||0,j:+j.mat_actual||0,k:mV,l:j.status};}),
  [{k:'a',l:'JC Ref',w:12},{k:'b',l:'Job #',w:10},{k:'c',l:'BU',w:18},{k:'d',l:'Description',w:28},{k:'e',l:'Assigned',w:18},{k:'f',l:'Bdg Hrs',w:10},{k:'g',l:'Act Hrs',w:10},{k:'h',l:'Hrs Var',w:10},{k:'i',l:'Mat Bdg',w:14},{k:'j',l:'Mat Act',w:14},{k:'k',l:'Mat Var',w:14},{k:'l',l:'Status',w:12}],
  'MM_JobCards.xlsx','Job Cards');
}
function calcInvLive(jobRef){
  var matSpent=spos.filter(function(p){return p.job_ref===jobRef;}).reduce(function(s,p){return s+(+p.amount||0);},0);
  var jobWIs=wis.filter(function(w){return w.job_ref===jobRef;});
  var empTotals={},stTotals={};
  jobWIs.forEach(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    labData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      if(!empTotals[e.emp])empTotals[e.emp]=0;
      empTotals[e.emp]+=hrs;
    });
    var stData=w.standing_data?JSON.parse(w.standing_data):[];
    stData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      if(!stTotals[e.emp])stTotals[e.emp]=0;
      stTotals[e.emp]+=hrs;
    });
  });
  function rateOf(n){for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===n)return +lrates[i].rate||0;}return 0;}
  var labHrs=0,labCost=0,stHrs=0,stCost=0;
  Object.keys(empTotals).forEach(function(n){labHrs+=empTotals[n];labCost+=empTotals[n]*rateOf(n);});
  Object.keys(stTotals).forEach(function(n){stHrs+=stTotals[n];stCost+=stTotals[n]*rateOf(n);});
  return {matSpent:Math.round(matSpent),labHrs:labHrs,labCost:Math.round(labCost),stHrs:stHrs,stCost:Math.round(stCost),poCount:spos.filter(function(p){return p.job_ref===jobRef;}).length,wiCount:jobWIs.length};
}

function oInv(id){
  var i=null;for(var x=0;x<invs.length;x++){if(invs[x].id===id){i=invs[x];break;}}
  if(!i)return;
  var live=calcInvLive(i.job_ref);
  openM('<div class="mtitle">Edit invoice — '+(i.job_ref||'')+'</div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:11px 13px;margin-bottom:13px;font-size:11px">'
  +'<div style="font-weight:700;color:var(--navy);margin-bottom:5px">Live platform data for '+(i.job_ref||'')+'</div>'
  +'<div style="color:#718096;line-height:1.7">Buyer Sheet: '+live.poCount+' PO'+(live.poCount!==1?'s':'')+' = <strong style="color:var(--navy)">'+R(live.matSpent)+'</strong><br>'
  +'Work Instructions: '+live.wiCount+' WI'+(live.wiCount!==1?'s':'')+' | '+live.labHrs+' hrs = <strong style="color:var(--navy)">'+R(live.labCost)+'</strong>'
  +(live.stHrs>0?'<br>Standing time: '+live.stHrs+' hrs = <strong style="color:#c53030">'+R(live.stCost)+'</strong>':'')+'</div>'
  +'<button class="btn btn-sm" id="pullLiveBtn" style="margin-top:8px;background:var(--navy);color:#fff;border-color:var(--navy)">&#8635; Pull live figures into form</button>'
  +'</div>'
  +'<div class="f2"><div class="mfr"><label>Invoice ref</label><input id="eIr" value="'+(i.inv_ref||'')+'"></div><div class="mfr"><label>Invoice date</label><input type="date" id="eId" value="'+(i.invoiced_date||'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Client</label><input id="eIc" value="'+(i.client||'')+'" readonly style="background:#f4f6f9"></div><div class="mfr"><label>Invoice value (R)</label><input type="number" id="eIv" value="'+(i.order_val||0)+'" oninput="calcInvProfit()"></div></div>'
  +'<div style="margin:13px 0 6px;font-size:10px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid var(--navy);padding-bottom:4px">Cost Capture — Backlog Entry</div>'
  +'<div class="f2"><div class="mfr"><label>Material cost (R)</label><input type="number" id="eIm" value="'+(i.mat_cost||0)+'" oninput="calcInvProfit()"></div><div class="mfr"><label>Labour cost (R)</label><input type="number" id="eIl" value="'+(i.labour_cost||0)+'" oninput="calcInvProfit()"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Labour hours (record only)</label><input type="number" id="eIlh" value="'+(i.labour_hrs||0)+'"></div><div class="mfr"><label>Standing hours (record only)</label><input type="number" id="eIsh" value="'+(i.standing_hrs||0)+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Overheads (R)</label><input type="number" id="eIo" value="'+(i.overheads||0)+'" oninput="calcInvProfit()"></div><div class="mfr"><label>Status</label><select id="eIs"><option'+(i.status==='Outstanding'?' selected':'')+'>Outstanding</option><option'+(i.status==='Paid'?' selected':'')+'>Paid</option></select></div></div>'
  +'<div style="background:#f8fafc;border:2px solid var(--navy);border-radius:8px;padding:11px 13px;margin-bottom:11px">'
  +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:#718096">Total cost</span><strong class="mono" id="invTotCost">R 0</strong></div>'
  +'<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>Gross profit</span><strong class="mono" id="invProfit">R 0</strong></div>'
  +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:3px"><span style="color:#718096">Margin</span><strong class="mono" id="invMargin">0%</strong></div>'
  +'</div>'
  +'<div class="mfoot"><button class="btn" id="cancelInvE">Cancel</button><button class="btn btn-p" id="saveInvE">Update invoice</button></div>');

  setTimeout(calcInvProfit,50);
  document.getElementById('cancelInvE').addEventListener('click',closeM);
  document.getElementById('pullLiveBtn').addEventListener('click',function(){
    document.getElementById('eIm').value=live.matSpent;
    document.getElementById('eIl').value=live.labCost;
    document.getElementById('eIlh').value=live.labHrs;
    document.getElementById('eIsh').value=live.stHrs;
    calcInvProfit();
    toast('Live figures pulled in','s');
  });
  document.getElementById('saveInvE').addEventListener('click',function(){
    var data={inv_ref:gv('eIr'),order_val:+gv('eIv')||0,mat_cost:+gv('eIm')||0,labour_cost:+gv('eIl')||0,labour_hrs:+gv('eIlh')||0,standing_hrs:+gv('eIsh')||0,overheads:+gv('eIo')||0,invoiced_date:fmtD(gv('eId')),status:gv('eIs')};
    dbPatch('invoices','id=eq.'+id,data).then(function(){closeM();return loadAll();}).then(function(){go('fin');toast('Invoice updated','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function calcInvProfit(){
  var v=+gv('eIv')||0,m=+gv('eIm')||0,l=+gv('eIl')||0,o=+gv('eIo')||0;
  var tot=m+l+o, p=v-tot, mg=v>0?Math.round(p/v*100):0;
  var tc=document.getElementById('invTotCost'),pr=document.getElementById('invProfit'),mr=document.getElementById('invMargin');
  if(tc)tc.textContent=R(tot);
  if(pr){pr.textContent=R(p);pr.style.color=p>=0?'#276749':'#c53030';}
  if(mr){mr.textContent=mg+'%';mr.style.color=mg>=15?'#276749':mg>=0?'#d97706':'#c53030';}
}

function expFin(){
  var bu=gv('fbu');
  var f=invs.filter(function(i){return !bu||i.bu===bu;});
  xlx(f.map(function(i){var p=(+i.order_val||0)-(+i.mat_cost||0)-(+i.labour_cost||0)-(+i.overheads||0);var m=(+i.order_val||0)>0?Math.round(p/(+i.order_val||1)*100):0;return {a:i.inv_ref,b:i.job_ref,c:i.client,d:i.bu,e:+i.order_val||0,f:+i.mat_cost||0,g:+i.labour_cost||0,h:+i.overheads||0,i:p,j:m+'%',k:fd(i.invoiced_date),l:i.status};}),
  [{k:'a',l:'Invoice Ref',w:14},{k:'b',l:'Job #',w:10},{k:'c',l:'Client',w:22},{k:'d',l:'BU',w:18},{k:'e',l:'Value',w:16},{k:'f',l:'Mat Cost',w:14},{k:'g',l:'Labour',w:14},{k:'h',l:'Overhead',w:14},{k:'i',l:'Profit',w:14},{k:'j',l:'Margin',w:10},{k:'k',l:'Date',w:13},{k:'l',l:'Status',w:12}],
  'MM_Finance.xlsx','Finance');
}


// ── LABOUR RATES ─────────────────────────────────────────────────────────────
function rLRates(){
  var canView=cUser&&(cUser.role==='CEO'||cUser.role==='Finance');
  if(!canView)return '<div class="empty">Access restricted — CEO and Finance only.</div>';
  var tot=lrates.filter(function(r){return r.active;}).length;
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Active employees</div><div class="kpi-v">'+tot+'</div></div><div class="kpi cgo"><div class="kpi-l">Avg rate</div><div class="kpi-v">'+R(lrates.filter(function(r){return r.active;}).reduce(function(s,r){return s+(+r.rate||0);},0)/Math.max(tot,1))+'</div><div class="kpi-s">Per hour excl</div></div><div class="kpi cb"><div class="kpi-l">Total employees</div><div class="kpi-v">'+lrates.length+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Labour rates register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addLRBtn">+ Add employee</button></div></div>'
  +'<div class="tw"><table><thead><tr><th>Employee name</th><th>Trade / Role</th><th>Business unit</th><th>Rate per hour (R excl)</th><th>Status</th><th>Actions</th></tr></thead><tbody>'
  +lrates.map(function(r){return '<tr><td style="font-weight:500">'+r.emp_name+'</td><td>'+r.trade+'</td><td><span class="badge b-bu">'+r.bu+'</span></td><td class="mono" style="font-weight:600">'+R(+r.rate)+'</td><td><span class="badge '+(r.active?'b-done':'b-lost')+'">'+(r.active?'Active':'Inactive')+'</span></td><td style="white-space:nowrap"><button class="btn-g" data-id="'+r.id+'" data-action="editLR">&#9998;</button> <button class="btn-d" data-id="'+r.id+'" data-action="delLR">&#10005;</button></td></tr>';}).join('')
  +(lrates.length===0?'<tr><td colspan="6" class="empty">No employees loaded yet</td></tr>':'')
  +'</tbody></table></div></div>';
}

function oLR(id){
  var r=id?(function(){for(var i=0;i<lrates.length;i++){if(lrates[i].id===id)return lrates[i];}return null;})():{};
  if(!r)r={};
  openM('<div class="mtitle">'+(id?'Edit employee rate':'New employee rate')+'</div>'
  +'<div class="mfr"><label>Employee full name</label><input id="mLRn" value="'+(r.emp_name||'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Trade / Role</label><input id="mLRt" value="'+(r.trade||'')+'"></div><div class="mfr"><label>Business unit</label>'+buS('mLRb',r.bu)+'</div></div>'
  +'<div class="f2"><div class="mfr"><label>Rate per hour (R excl VAT)</label><input type="number" id="mLRr" value="'+(r.rate||0)+'"></div><div class="mfr"><label>Status</label><select id="mLRs"><option value="true"'+(r.active!==false?' selected':'')+'>Active</option><option value="false"'+(r.active===false?' selected':'')+'>Inactive</option></select></div></div>'
  +'<div class="mfoot"><button class="btn" id="cancelLR">Cancel</button><button class="btn btn-p" id="saveLR">'+(id?'Update':'Save employee')+'</button></div>');
  document.getElementById('cancelLR').addEventListener('click',closeM);
  document.getElementById('saveLR').addEventListener('click',function(){
    var b={emp_name:gv('mLRn'),trade:gv('mLRt'),bu:gv('mLRb'),rate:+gv('mLRr')||0,active:gv('mLRs')==='true'};
    var p=id?dbPatch('labour_rates','id=eq.'+id,b):dbPost('labour_rates',b);
    p.then(function(){closeM();return loadAll();}).then(function(){go('lrates');toast('Saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

// ── UPGRADED JOB CARD FORM ────────────────────────────────────────────────────
function oJCFull(editId){
  var j=editId?(function(){for(var i=0;i<jcs.length;i++){if(jcs[i].id===editId)return jcs[i];}return null;})():null;
  var availOrds=editId?orders:getOpenOrders();
  var ordOpts=availOrds.map(function(o){return '<option value="'+o.ref+'"'+(j&&j.job_ref===o.ref?' selected':'')+'>'+o.ref+' — '+o.client+'</option>';}).join('');
  if(!ordOpts)ordOpts='<option value="">No open orders available</option>';
  var initJob=j?j.job_ref:(availOrds.length?availOrds[0].ref:'');
  var initBU=j?j.bu:(availOrds.length?availOrds[0].bu:'');
  var initRef=j?j.jcref:autoJCRef(initJob);
  // Build employee dropdowns from labour rates
  var empOpts='<option value="">Select employee...</option>'+lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'">'+r.emp_name+' ('+r.trade+') — '+R(+r.rate)+'/hr</option>';}).join('');
  // Labour rows — 10 rows
  var labRows='';
  var labData=j&&j.labour_data?JSON.parse(j.labour_data):[];
  for(var i=0;i<10;i++){
    var ld=labData[i]||{emp:'',trade:'',mon:0,tue:0,wed:0,thu:0,fri:0,sat:0};
    labRows+='<tr><td><select class="lab-emp" data-row="'+i+'" style="width:100%;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px"><option value="">—</option>'+lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'"'+(ld.emp===r.emp_name?' selected':'')+'>'+r.emp_name+'</option>';}).join('')+'</select></td>'
    +'<td><input type="number" class="lab-mon" data-row="'+i+'" value="'+(ld.mon||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="lab-tue" data-row="'+i+'" value="'+(ld.tue||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="lab-wed" data-row="'+i+'" value="'+(ld.wed||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="lab-thu" data-row="'+i+'" value="'+(ld.thu||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="lab-fri" data-row="'+i+'" value="'+(ld.fri||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="lab-sat" data-row="'+i+'" value="'+(ld.sat||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td class="mono" id="labTot'+i+'" style="font-size:11px;text-align:center;font-weight:600">0</td></tr>';
  }
  // Standing time rows — 5 rows
  var stRows='';
  var stData=j&&j.standing_data?JSON.parse(j.standing_data):[];
  for(var k=0;k<5;k++){
    var sd=stData[k]||{emp:'',reason:'',mon:0,tue:0,wed:0,thu:0,fri:0,sat:0};
    stRows+='<tr><td><select class="st-emp" style="width:100%;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px"><option value="">—</option>'+lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'"'+(sd.emp===r.emp_name?' selected':'')+'>'+r.emp_name+'</option>';}).join('')+'</select></td>'
    +'<td><input type="text" class="st-rsn" value="'+(sd.reason||'')+'" placeholder="Reason" style="width:90px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px"></td>'
    +'<td><input type="number" class="st-mon" value="'+(sd.mon||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="st-tue" value="'+(sd.tue||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="st-wed" value="'+(sd.wed||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="st-thu" value="'+(sd.thu||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="st-fri" value="'+(sd.fri||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td>'
    +'<td><input type="number" class="st-sat" value="'+(sd.sat||0)+'" style="width:38px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0" max="24"></td></tr>';
  }
  // Material rows — 10 rows
  var matRows='';
  var matData=j&&j.mat_data?JSON.parse(j.mat_data):[];
  for(var m=0;m<10;m++){
    var md=matData[m]||{desc:'',qty:0,unit:'',cost:0};
    matRows+='<tr><td style="width:30px;color:#a0aec0;font-size:11px;text-align:center">'+(m+1)+'</td>'
    +'<td><input type="text" class="mat-desc" value="'+(md.desc||'')+'" style="width:100%;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px"></td>'
    +'<td><input type="number" class="mat-qty" value="'+(md.qty||0)+'" style="width:50px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="text" class="mat-unit" value="'+(md.unit||'')+'" placeholder="kg/m/ea" style="width:50px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center"></td>'
    +'<td><input type="number" class="mat-cost" value="'+(md.cost||0)+'" style="width:70px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:right" min="0"></td>'
    +'<td class="mono" id="matTot'+m+'" style="font-size:11px;text-align:right;font-weight:600">R 0</td></tr>';
  }

  openM('<div class="mtitle">'+(editId?'Edit job card':'New job card — Daily Capture')+'</div>'
  // Job Info
  +'<div class="mfr"><label>Order number (MM ref)</label><select id="mJj" onchange="onJCOrderChange()"><option value="">Select order...</option>'+ordOpts+'</select></div>'
  +'<div class="f2"><div class="mfr"><label>JC ref</label><input id="mJr" value="'+initRef+'"></div><div class="mfr"><label>Business unit</label><input id="mJb" value="'+initBU+'" readonly style="background:#f4f6f9"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Foreman</label><input id="mJfm" value="'+(j?j.foreman||'':'')+'"></div><div class="mfr"><label>Priority</label><select id="mJpri"><option'+(j&&j.priority==='High'?' selected':'')+'>High</option><option'+((!j||j.priority==='Normal')?' selected':'')+'>Normal</option><option'+(j&&j.priority==='Low'?' selected':'')+'>Low</option></select></div></div>'
  +'<div class="mfr"><label>Description</label><input id="mJd" value="'+(j?j.description||'':'')+'"></div>'
  // Material Cost section
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid var(--navy);padding-bottom:4px">3. Material Cost</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);width:30px">#</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:left">Description</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center">Qty</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center">Unit</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:right">Unit Cost</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:right">Total</th></tr></thead><tbody id="matBody">'+matRows+'</tbody><tfoot><tr><td colspan="5" style="padding:6px 5px;font-weight:700;text-align:right;font-size:11px">TOTAL MATERIAL COST:</td><td id="matGrandTotal" style="padding:6px 5px;font-weight:700;font-family:\'DM Mono\',monospace;text-align:right;color:var(--navy)">R 0</td></tr></tfoot></table></div>'
  +'<div class="f2" style="margin-top:8px"><div class="mfr"><label>Material budget (R)</label><input type="number" id="mJmb" value="'+(j?j.mat_budget||0:0)+'"></div><div class="mfr"><label>Material actual (R) — auto from above</label><input type="number" id="mJma" value="'+(j?j.mat_actual||0:0)+'" style="background:#f4f6f9" readonly></div></div>'
  // Labour Hours section
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid var(--navy);padding-bottom:4px">4. Labour Hours</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:left;min-width:120px">Employee</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Mon</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Tue</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Wed</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Thu</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Fri</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Sat</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:42px">Total</th></tr></thead><tbody id="labBody">'+labRows+'</tbody><tfoot><tr><td style="padding:6px 5px;font-weight:700;font-size:11px">TOTAL HOURS:</td><td colspan="6"></td><td id="labGrandTotal" style="padding:6px 5px;font-weight:700;font-family:\'DM Mono\',monospace;text-align:center;color:var(--navy)">0</td></tr></tfoot></table></div>'
  +'<div class="f2" style="margin-top:8px"><div class="mfr"><label>Budget hours</label><input type="number" id="mJbh" value="'+(j?j.budget_hrs||0:0)+'"></div><div class="mfr"><label>Actual hours — auto from above</label><input type="number" id="mJah" value="'+(j?j.actual_hrs||0:0)+'" style="background:#f4f6f9" readonly></div></div>'
  // Standing Time section
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:#9b1c1c;text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid #9b1c1c;padding-bottom:4px">5. Standing Time</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:left;min-width:120px">Employee</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:left;min-width:100px">Reason</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Mon</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Tue</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Wed</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Thu</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Fri</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:42px">Sat</th></tr></thead><tbody id="stBody">'+stRows+'</tbody></table></div>'
  // Status and save
  +'<div class="f2" style="margin-top:12px"><div class="mfr"><label>Status</label><select id="mJs">'+['Open','In progress','Completed'].map(function(s){return '<option'+(j&&j.status===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div><div class="mfr"><label>Week starting (date)</label><input type="date" id="mJwk" value="'+(j?j.week_start||td():td())+'"></div></div>'
  +'<div class="mfoot"><button class="btn" id="cancelJC">Cancel</button><button class="btn btn-p" id="saveJC">'+(editId?'Update job card':'Save job card')+'</button></div>');

  // Wire up totals calculators
  setTimeout(function(){
    function calcLabRow(i){
      var days=['mon','tue','wed','thu','fri','sat'];
      var tot=0;
      days.forEach(function(d){var el=document.querySelector('.lab-'+d+'[data-row="'+i+'"]');if(el)tot+=(+el.value||0);});
      var tEl=document.getElementById('labTot'+i);if(tEl)tEl.textContent=tot;
      calcLabTotal();
    }
    function calcLabTotal(){
      var total=0;
      for(var i=0;i<10;i++){var el=document.getElementById('labTot'+i);if(el)total+=(+el.textContent||0);}
      var gt=document.getElementById('labGrandTotal');if(gt)gt.textContent=total;
      var ah=document.getElementById('mJah');if(ah)ah.value=total;
    }
    function calcMatRow(m){
      var qty=+(document.querySelectorAll('.mat-qty')[m]||{}).value||0;
      var cost=+(document.querySelectorAll('.mat-cost')[m]||{}).value||0;
      var tot=qty*cost;
      var tEl=document.getElementById('matTot'+m);if(tEl)tEl.textContent='R '+Math.round(tot).toLocaleString('en-ZA');
      calcMatTotal();
    }
    function calcMatTotal(){
      var total=0;
      for(var m=0;m<10;m++){var qty=+(document.querySelectorAll('.mat-qty')[m]||{}).value||0;var cost=+(document.querySelectorAll('.mat-cost')[m]||{}).value||0;total+=qty*cost;}
      var gt=document.getElementById('matGrandTotal');if(gt)gt.textContent='R '+Math.round(total).toLocaleString('en-ZA');
      var ma=document.getElementById('mJma');if(ma)ma.value=Math.round(total);
    }
    // Init totals
    for(var i=0;i<10;i++){calcLabRow(i);}
    for(var m=0;m<10;m++){calcMatRow(m);}
    // Event listeners
    document.querySelectorAll('.lab-mon,.lab-tue,.lab-wed,.lab-thu,.lab-fri,.lab-sat').forEach(function(el){
      el.addEventListener('input',function(){calcLabRow(+this.getAttribute('data-row'));});
    });
    document.querySelectorAll('.mat-qty,.mat-cost').forEach(function(el,idx){
      el.addEventListener('input',function(){calcMatRow(Math.floor(idx/2));});
    });

    document.getElementById('cancelJC').addEventListener('click',closeM);
    document.getElementById('saveJC').addEventListener('click',function(){
      var jobRef=gv('mJj');
      if(!jobRef){toast('Please select an order','e');return;}
      var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
      // Collect labour data
      var labArr=[];
      for(var i=0;i<10;i++){
        var emp=document.querySelectorAll('.lab-emp')[i];
        if(emp&&emp.value){
          labArr.push({emp:emp.value,mon:+(document.querySelectorAll('.lab-mon')[i]||{}).value||0,tue:+(document.querySelectorAll('.lab-tue')[i]||{}).value||0,wed:+(document.querySelectorAll('.lab-wed')[i]||{}).value||0,thu:+(document.querySelectorAll('.lab-thu')[i]||{}).value||0,fri:+(document.querySelectorAll('.lab-fri')[i]||{}).value||0,sat:+(document.querySelectorAll('.lab-sat')[i]||{}).value||0});
        }
      }
      // Collect standing time
      var stArr=[];
      var stEmps=document.querySelectorAll('.st-emp');
      var stRsns=document.querySelectorAll('.st-rsn');
      for(var k=0;k<5;k++){
        if(stEmps[k]&&stEmps[k].value){
          stArr.push({emp:stEmps[k].value,reason:stRsns[k]?stRsns[k].value:'',mon:+(document.querySelectorAll('.st-mon')[k]||{}).value||0,tue:+(document.querySelectorAll('.st-tue')[k]||{}).value||0,wed:+(document.querySelectorAll('.st-wed')[k]||{}).value||0,thu:+(document.querySelectorAll('.st-thu')[k]||{}).value||0,fri:+(document.querySelectorAll('.st-fri')[k]||{}).value||0,sat:+(document.querySelectorAll('.st-sat')[k]||{}).value||0});
        }
      }
      // Collect material data
      var matArr=[];
      for(var m=0;m<10;m++){
        var desc=document.querySelectorAll('.mat-desc')[m];
        if(desc&&desc.value){
          matArr.push({desc:desc.value,qty:+(document.querySelectorAll('.mat-qty')[m]||{}).value||0,unit:document.querySelectorAll('.mat-unit')[m]?(document.querySelectorAll('.mat-unit')[m].value||''):'',cost:+(document.querySelectorAll('.mat-cost')[m]||{}).value||0});
        }
      }
      var totalActHrs=+gv('mJah')||0;
      var totalMatActual=+gv('mJma')||0;
      var data={jcref:gv('mJr'),job_ref:jobRef,bu:ord?ord.bu:gv('mJb'),description:gv('mJd'),foreman:gv('mJfm'),priority:gv('mJpri'),assigned:gv('mJfm'),budget_hrs:+gv('mJbh')||0,actual_hrs:totalActHrs,mat_budget:+gv('mJmb')||0,mat_actual:totalMatActual,status:gv('mJs'),week_start:fmtD(gv('mJwk')),labour_data:JSON.stringify(labArr),standing_data:JSON.stringify(stArr),mat_data:JSON.stringify(matArr)};
      var pr=editId?dbPatch('job_cards','id=eq.'+editId,data):dbPost('job_cards',data);
      pr.then(function(){closeM();return loadAll();}).then(function(){go('jc');toast(editId?'Job card updated':'Job card saved','s');}).catch(function(e){toast(e.message,'e');});
    });
  },100);
}

function oAPIKey(){
  var cur=localStorage.getItem('mm_anthropic_key')||'';
  openM('<div class="mtitle">🔑 Anthropic API Key</div>'
  +'<p style="font-size:12px;color:#718096;margin-bottom:14px">Enter your Anthropic API key. It is stored only in this browser and never sent anywhere except Anthropic.</p>'
  +'<div class="mfr"><label>API Key (starts with sk-ant-...)</label><input id="apiKeyInput" type="password" value="'+cur+'" placeholder="sk-ant-api03-..." style="font-family:monospace;font-size:11px"></div>'
  +(cur?'<p style="font-size:11px;color:#276749;margin-bottom:8px">✓ Key is set</p>':'<p style="font-size:11px;color:#c53030;margin-bottom:8px">⚠ No key set — PDF upload will not work</p>')
  +'<div class="mfoot"><button class="btn" id="cancelAPIKey">Cancel</button><button class="btn btn-p" id="saveAPIKey">Save key</button></div>');
  document.getElementById('cancelAPIKey').addEventListener('click',closeM);
  document.getElementById('saveAPIKey').addEventListener('click',function(){
    var k=document.getElementById('apiKeyInput').value.trim();
    if(!k){toast('Please enter a key','e');return;}
    localStorage.setItem('mm_anthropic_key',k);
    closeM();
    toast('API key saved — PDF upload ready','s');
  });
}

// BU Labour Rates
var BU_RATES={'Fabrication':114.00,'Construction':102.66,'Pumps':207.13,'TMM':105.97,'Motors':60.44,'Wear Protection':73.54,'Mining Supplies':135.02,'Laser Cutting':68.95};

function showJobCost(id){
  var o=null;for(var i=0;i<orders.length;i++){if(orders[i].id===id){o=orders[i];break;}}
  if(!o)return;

  // Calculate actuals
  var matSpent=spos.filter(function(p){return p.job_ref===o.ref;}).reduce(function(s,p){return s+(+p.amount||0);},0);
  var linkedJCs=jcs.filter(function(j){return j.job_ref===o.ref;});
  var totalHrs=linkedJCs.reduce(function(s,j){return s+(+j.actual_hrs||0);},0);
  var buRate=BU_RATES[o.bu]||0;
  var labSpent=Math.round(totalHrs*buRate);
  var totalSpent=matSpent+labSpent;
  var quoteVal=+o.order_val||0;
  var matBudget=linkedJCs.reduce(function(s,j){return s+(+j.mat_budget||0);},0);
  var labBudget=linkedJCs.reduce(function(s,j){return s+(+j.budget_hrs||0);},0)*buRate;
  var totalBudget=matBudget+labBudget||quoteVal;

  // Percentages
  var matPct=matBudget>0?Math.round(matSpent/matBudget*100):0;
  var labPct=labBudget>0?Math.round(labSpent/labBudget*100):0;
  var totPct=totalBudget>0?Math.round(totalSpent/totalBudget*100):0;
  var margin=quoteVal-totalSpent;
  var marginPct=quoteVal>0?Math.round(margin/quoteVal*100):0;

  function tl(pct){
    if(pct>=95)return '<span style="background:#fff5f5;color:#9b1c1c;border:1px solid #fed7d7;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🔴 OVER BUDGET</span>';
    if(pct>=75)return '<span style="background:#fffbeb;color:#92400e;border:1px solid #fcd34d;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🟡 WATCH</span>';
    return '<span style="background:#f0fff4;color:#276749;border:1px solid #c6f6d5;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🟢 ON TRACK</span>';
  }
  function bar(pct){
    var c=pct>=95?'#e53e3e':pct>=75?'#d69e2e':'#38a169';
    var w=Math.min(pct,100);
    return '<div style="background:#f0f2f5;border-radius:4px;height:8px;width:100%;margin-top:4px"><div style="background:'+c+';width:'+w+'%;height:8px;border-radius:4px;transition:width .3s"></div></div>';
  }

  openM('<div class="mtitle">Job Cost Dashboard — '+o.ref+'</div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;display:flex;gap:20px;flex-wrap:wrap">'
  +'<span><strong>Client:</strong> '+o.client+'</span>'
  +'<span><strong>BU:</strong> '+o.bu+'</span>'
  +'<span><strong>Quote Value:</strong> '+R(quoteVal)+'</span>'
  +'<span><strong>Labour Rate:</strong> '+R(buRate)+'/hr</span>'
  +'</div>'

  // Materials row
  +'<div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
  +'<span style="font-weight:600;font-size:13px">Materials</span>'+tl(matPct)+'</div>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12px;margin-bottom:6px">'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Budget</div><div class="mono" style="font-size:14px;font-weight:600">'+R(matBudget)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Actual Spent</div><div class="mono" style="font-size:14px;font-weight:600;color:'+(matPct>=95?'#c53030':matPct>=75?'#d97706':'#276749')+'">'+R(matSpent)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">% Used</div><div class="mono" style="font-size:14px;font-weight:600">'+matPct+'%</div></div>'
  +'</div>'+bar(matPct)+'</div>'

  // Labour row
  +'<div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
  +'<span style="font-weight:600;font-size:13px">Labour <span style="font-size:11px;color:#718096;font-weight:400">('+totalHrs+' hrs × '+R(buRate)+'/hr)</span></span>'+tl(labPct)+'</div>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12px;margin-bottom:6px">'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Budget</div><div class="mono" style="font-size:14px;font-weight:600">'+R(labBudget)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Actual Cost</div><div class="mono" style="font-size:14px;font-weight:600;color:'+(labPct>=95?'#c53030':labPct>=75?'#d97706':'#276749')+'">'+R(labSpent)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">% Used</div><div class="mono" style="font-size:14px;font-weight:600">'+labPct+'%</div></div>'
  +'</div>'+bar(labPct)+'</div>'

  // Total & Margin
  +'<div style="border:2px solid var(--navy);border-radius:8px;padding:14px;margin-bottom:10px;background:#f8fafc">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
  +'<span style="font-weight:700;font-size:13px;color:var(--navy)">Total Job Cost</span>'+tl(totPct)+'</div>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;font-size:12px">'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Total Spent</div><div class="mono" style="font-size:15px;font-weight:700">'+R(totalSpent)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Quote Value</div><div class="mono" style="font-size:15px;font-weight:700">'+R(quoteVal)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Gross Profit</div><div class="mono" style="font-size:15px;font-weight:700;color:'+(margin>=0?'#276749':'#c53030')+'">'+R(margin)+'</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Margin</div><div class="mono" style="font-size:15px;font-weight:700;color:'+(marginPct>=15?'#276749':marginPct>=0?'#d97706':'#c53030')+'">'+marginPct+'%</div></div>'
  +'</div></div>'

  +'<div style="font-size:11px;color:#718096;margin-bottom:10px">📦 '+spos.filter(function(p){return p.job_ref===o.ref;}).length+' supplier POs on Buyer Sheet &nbsp;|&nbsp; 🔧 '+linkedJCs.length+' job card'+(linkedJCs.length!==1?'s':'')+' linked</div>'
  +'<div class="mfoot"><button class="btn" id="closeJobCost">Close</button>'+(o.status==='Completed'&&!o.invoiced?'<button class="btn btn-p" data-id="'+o.id+'" data-action="toFinance">&rarr; Move to Finance</button>':'')+'</div>');

  document.getElementById('closeJobCost').addEventListener('click',closeM);
}


// ── LABOUR RATES ─────────────────────────────────────────────────────────────
function rLRates(){
  var canView=cUser&&(cUser.role==='CEO'||cUser.role==='Finance');
  if(!canView)return '<div class="empty">Access restricted — CEO and Finance only.</div>';
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Active employees</div><div class="kpi-v">'+lrates.filter(function(r){return r.active;}).length+'</div></div><div class="kpi cgo"><div class="kpi-l">Total employees</div><div class="kpi-v">'+lrates.length+'</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Employee labour rates</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addLRBtn">+ Add employee</button></div></div>'
  +'<div class="tw"><table><thead><tr><th>Employee name</th><th>Trade / Role</th><th>Business unit</th><th>Rate per hour (R)</th><th>Status</th><th>Actions</th></tr></thead><tbody>'
  +lrates.map(function(r){return '<tr><td style="font-weight:500">'+r.emp_name+'</td><td>'+r.trade+'</td><td><span class="badge b-bu">'+r.bu+'</span></td><td class="mono" style="font-weight:600">'+R(+r.rate)+'</td><td><span class="badge '+(r.active?'b-done':'b-lost')+'">'+(r.active?'Active':'Inactive')+'</span></td><td style="white-space:nowrap"><button class="btn-g" data-id="'+r.id+'" data-action="editLR">&#9998;</button> <button class="btn-d" data-id="'+r.id+'" data-action="delLR">&#10005;</button></td></tr>';}).join('')
  +(lrates.length===0?'<tr><td colspan="6" class="empty">No employees loaded yet — add employees to enable WI labour costing</td></tr>':'')
  +'</tbody></table></div></div>';
}

function oLR(id){
  var r=id?(function(){for(var i=0;i<lrates.length;i++){if(lrates[i].id===id)return lrates[i];}return null;})():{};
  if(!r)r={};
  openM('<div class="mtitle">'+(id?'Edit employee rate':'Add employee')+'</div>'
  +'<div class="mfr"><label>Employee full name</label><input id="mLRn" value="'+(r.emp_name||'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Trade / Role</label><input id="mLRt" value="'+(r.trade||'')+'"></div><div class="mfr"><label>Business unit</label>'+buS('mLRb',r.bu)+'</div></div>'
  +'<div class="f2"><div class="mfr"><label>Rate per hour (R excl VAT)</label><input type="number" id="mLRr" value="'+(r.rate||0)+'"></div><div class="mfr"><label>Status</label><select id="mLRs"><option value="true"'+(r.active!==false?' selected':'')+'>Active</option><option value="false"'+(r.active===false?' selected':'')+'>Inactive</option></select></div></div>'
  +'<div class="mfoot"><button class="btn" id="cancelLR">Cancel</button><button class="btn btn-p" id="saveLR">'+(id?'Update employee':'Save employee')+'</button></div>');
  document.getElementById('cancelLR').addEventListener('click',closeM);
  document.getElementById('saveLR').addEventListener('click',function(){
    var n=gv('mLRn').trim();
    if(!n){toast('Please enter employee name','e');return;}
    var b={emp_name:n,trade:gv('mLRt'),bu:gv('mLRb'),rate:+gv('mLRr')||0,active:gv('mLRs')==='true'};
    var p=id?dbPatch('labour_rates','id=eq.'+id,b):dbPost('labour_rates',b);
    p.then(function(){closeM();return loadAll();}).then(function(){go('lrates');toast('Employee saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

// ── WORK INSTRUCTIONS ────────────────────────────────────────────────────────
function rWI(){
  var myWIs=cUser&&cUser.role==='HOD'?wis.filter(function(w){return w.bu===cUser.bu||(cUser.bu2&&w.bu===cUser.bu2);}):wis;
  var noOrderCount=myWIs.filter(function(w){return w.job_ref==='NO_ORDER';}).length;
  return '<div class="kpis"><div class="kpi cn"><div class="kpi-l">Total WIs</div><div class="kpi-v">'+myWIs.length+'</div></div><div class="kpi ca"><div class="kpi-l">In progress</div><div class="kpi-v">'+myWIs.filter(function(w){return w.status==="In progress";}).length+'</div></div><div class="kpi cg"><div class="kpi-l">Completed</div><div class="kpi-v">'+myWIs.filter(function(w){return w.status==="Completed";}).length+'</div></div><div class="kpi '+(noOrderCount>0?'ca':'cg')+'"><div class="kpi-l">Awaiting order</div><div class="kpi-v">'+noOrderCount+'</div><div class="kpi-s">Not yet linked to MM</div></div></div>'
  +'<div class="card"><div class="card-hd"><h3>Work instruction register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addWIBtn">+ New WI</button></div></div>'
  +'<div class="toolbar"><input type="text" id="wis" placeholder="Search WI number, MM number, description..."><select id="wibu"><option value="">All BUs</option>'+BUS.map(function(b){return '<option>'+b+'</option>';}).join('')+'</select><select id="wist"><option value="">All statuses</option><option>Open</option><option>In progress</option><option>Completed</option></select></div>'
  +'<div class="tw tw-compact"><table><thead><tr><th style="width:88px">WI #</th><th style="width:76px">MM #</th><th style="width:82px">BU</th><th>Description</th><th style="width:80px">Foreman</th><th style="width:70px">Trade</th><th style="width:64px">Start</th><th style="width:64px">Target</th><th style="width:38px;text-align:center">Est</th><th style="width:38px;text-align:center">Act</th><th style="width:44px;text-align:center">Stand</th><th style="width:74px">Status</th><th style="width:74px">Actions</th></tr></thead><tbody id="witb">'
  +rWIRows()+'</tbody></table></div></div>';
}

function rWIRows(){
  var s=document.getElementById('wis')?document.getElementById('wis').value.toLowerCase():'';
  var bu=gv('wibu'),st=gv('wist');
  var f=wis.filter(function(w){
    if(s&&(w.wi_ref+w.job_ref+w.description+w.foreman).toLowerCase().indexOf(s)<0)return false;
    if(bu&&w.bu!==bu)return false;
    if(st&&w.status!==st)return false;
    return true;
  });
  if(!f.length)return '<tr><td colspan="13" class="empty">No work instructions found</td></tr>';
  return f.map(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    var stData=w.standing_data?JSON.parse(w.standing_data):[];
    var actHrs=labData.reduce(function(s,e){return s+(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);},0);
    var stHrs=stData.reduce(function(s,e){return s+(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);},0);
    var jobCell=w.job_ref==='NO_ORDER'
      ? '<span style="background:#fffbeb;color:#92400e;border:1px solid #fcd34d;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">No order</span>'+(w.waybill?'<div style="font-size:10px;color:#718096;margin-top:2px">'+w.waybill+'</div>':'')
      : w.job_ref;
    var shortD=function(d){if(!d)return '\u2014';var p=String(d).split('-');return p.length===3?p[2]+'/'+p[1]:fd(d);};
    return '<tr>'
    +'<td class="mono" style="font-weight:600">'+w.wi_ref+'</td>'
    +'<td class="mono">'+jobCell+'</td>'
    +'<td><span class="badge b-bu">'+w.bu+'</span></td>'
    +'<td title="'+(w.description||'')+'" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(w.description||'\u2014')+'</td>'
    +'<td title="'+(w.foreman||'')+'" style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(w.foreman||'\u2014')+'</td>'
    +'<td title="'+(w.trade||'')+'" style="max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(w.trade||'\u2014')+'</td>'
    +'<td class="mono">'+shortD(w.start_date)+'</td>'
    +'<td class="mono">'+shortD(w.target_date)+'</td>'
    +'<td class="mono" style="text-align:center">'+w.est_hrs+'</td>'
    +'<td class="mono '+(actHrs>w.est_hrs?'ob':'')+'" style="text-align:center">'+actHrs+'</td>'
    +'<td class="mono '+(stHrs>0?'sla-warn':'')+'" style="text-align:center">'+stHrs+'</td>'
    +'<td>'+obadge(w.status)+'</td>'
    +'<td style="white-space:nowrap"><button class="btn-g" style="padding:2px 3px" data-id="'+w.id+'" data-action="editWI">&#9998;</button><button class="btn-g" style="padding:2px 3px" data-id="'+w.id+'" data-action="printWI" title="Print WI">&#128438;</button><button class="btn-d" style="padding:2px 3px" data-id="'+w.id+'" data-action="delWI">&#10005;</button></td>'
    +'</tr>';
  }).join('');
}

function oWI(editId){
  var w=editId?(function(){for(var i=0;i<wis.length;i++){if(wis[i].id===editId)return wis[i];}return null;})():null;
  var availOrds=getOpenOrders();

  // Auto-generate WI number
  var initJob=w?w.job_ref:(availOrds.length?availOrds[0].ref:'');
  var autoWIRef=function(jobRef){
    if(!jobRef)return '';
    var existing=wis.filter(function(x){return x.job_ref===jobRef;});
    var nextNum=existing.length+1;
    return jobRef+'/'+String(nextNum).padStart(2,'0');
  };
  var initRef=w?w.wi_ref:autoWIRef(initJob);
  var initBU=w?w.bu:(availOrds.length?availOrds[0].bu:'');

  var ordOpts=availOrds.map(function(o){return '<option value="'+o.ref+'"'+(w&&w.job_ref===o.ref?' selected':'')+'>'+o.ref+' — '+o.client+'</option>';}).join('');

  // Employee rows for labour
  var labData=w&&w.labour_data?JSON.parse(w.labour_data):[];
  var labRows='';
  for(var i=0;i<12;i++){
    var ld=labData[i]||{emp:'',mon:0,tue:0,wed:0,thu:0,fri:0,sat:0,kg:0,done:false};
    var empOpts='<option value="">— Select —</option>'+lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'"'+(ld.emp===r.emp_name?' selected':'')+'>'+r.emp_name+' ('+r.trade+')</option>';}).join('');
    labRows+='<tr>'
    +'<td style="width:20px;color:#a0aec0;font-size:11px;text-align:center">'+(i+1)+'</td>'
    +'<td><select class="wi-emp" data-row="'+i+'" style="width:100%;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px">'+empOpts+'</select></td>'
    +'<td><input type="number" class="wi-mon" data-row="'+i+'" value="'+(ld.mon||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-tue" data-row="'+i+'" value="'+(ld.tue||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-wed" data-row="'+i+'" value="'+(ld.wed||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-thu" data-row="'+i+'" value="'+(ld.thu||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-fri" data-row="'+i+'" value="'+(ld.fri||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-sat" data-row="'+i+'" value="'+(ld.sat||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="wi-kg" data-row="'+i+'" value="'+(ld.kg||0)+'" style="width:44px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td style="text-align:center"><input type="checkbox" class="wi-done" data-row="'+i+'"'+(ld.done?' checked':'')+' style="width:16px;height:16px;cursor:pointer"></td>'
    +'<td class="mono" id="wiLabTot'+i+'" style="font-size:11px;text-align:center;font-weight:600;color:var(--navy)">0</td>'
    +'</tr>';
  }

  // Standing time rows
  var stData=w&&w.standing_data?JSON.parse(w.standing_data):[];
  var stRows='';
  for(var k=0;k<5;k++){
    var sd=stData[k]||{emp:'',reason:'',mon:0,tue:0,wed:0,thu:0,fri:0,sat:0};
    var stEmpOpts='<option value="">— Select —</option>'+lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'"'+(sd.emp===r.emp_name?' selected':'')+'>'+r.emp_name+'</option>';}).join('');
    stRows+='<tr>'
    +'<td><select class="st-emp" style="width:100%;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px">'+stEmpOpts+'</select></td>'
    +'<td><input type="text" class="st-rsn" value="'+(sd.reason||'')+'" placeholder="Reason" style="width:80px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px"></td>'
    +'<td><input type="number" class="st-mon" value="'+(sd.mon||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="st-tue" value="'+(sd.tue||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="st-wed" value="'+(sd.wed||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="st-thu" value="'+(sd.thu||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="st-fri" value="'+(sd.fri||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'<td><input type="number" class="st-sat" value="'+(sd.sat||0)+'" style="width:36px;font-size:11px;padding:3px;border:1px solid var(--border);border-radius:4px;text-align:center" min="0"></td>'
    +'</tr>';
  }

  openM('<div class="mtitle">'+(editId?'Edit Work Instruction':'New Work Instruction')+'</div>'
  // Job details
  +'<div class="mfr"><label>MM Number (Order)</label><select id="wiJob" onchange="onWIOrderChange()"><option value="">Select order...</option><option value="NO_ORDER"'+(w&&w.job_ref==='NO_ORDER'?' selected':'')+'>&#9888; No order yet — Assessment / Strip work</option>'+ordOpts+'</select></div>'
  +'<div id="wiNoOrderBox" style="display:none;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-bottom:11px">'
  +'<div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">No Order — Waybill Details</div>'
  +'<div class="f2"><div class="mfr"><label>Waybill number</label><input id="wiWaybill" value="'+(w?w.waybill||'':'')+'" placeholder="e.g. WB-4471"></div><div class="mfr"><label>Client</label><input id="wiClient" value="'+(w?w.client||'':'')+'" placeholder="Client sending the item"></div></div>'
  +'<div class="mfr"><label>Item received / description</label><input id="wiItem" value="'+(w?w.item_desc||'':'')+'" placeholder="e.g. 30kW motor for strip &amp; assess"></div>'
  +'<div style="font-size:11px;color:#92400e">Hours captured here will be linked to an MM Number later once the order is received. Edit this WI and select the MM Number when it comes through.</div>'
  +'</div>'
  +'<div class="f2"><div class="mfr"><label>WI Number (auto)</label><input id="wiRef" value="'+initRef+'"></div><div class="mfr"><label>Business unit — doing the work</label>'+buS('wiBU',initBU)+'</div></div>'
  +'<div id="wiBUNote" style="display:none;background:#ebf4ff;border:1px solid #bee3f8;border-radius:6px;padding:8px 11px;font-size:11px;color:#1e3a5f;margin-bottom:11px"></div>'
  +'<div class="f2"><div class="mfr"><label>Description / Task</label><input id="wiDesc" value="'+(w?w.description||'':'')+'"></div><div class="mfr"><label>Trade / Skill</label><input id="wiTrade" value="'+(w?w.trade||'':'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Foreman / Issued by</label><input id="wiForeman" value="'+(w?w.foreman||'':'')+'"></div><div class="mfr"><label>Priority</label><select id="wiPri"><option'+((!w||w.priority==="Normal")?" selected":"")+'>Normal</option><option'+(w&&w.priority==="High"?" selected":"")+'>High</option><option'+(w&&w.priority==="Low"?" selected":"")+'>Low</option></select></div></div>'
  +'<div class="f2"><div class="mfr"><label>Start date</label><input type="date" id="wiStart" value="'+(w?w.start_date||td():td())+'"></div><div class="mfr"><label>Target completion</label><input type="date" id="wiTarget" value="'+(w?w.target_date||'':'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Estimated hours</label><input type="number" id="wiEstHrs" value="'+(w?w.est_hrs||0:0)+'"></div><div class="mfr"><label>Status</label><select id="wiStatus">'+['Open','In progress','Completed'].map(function(s){return '<option'+(w&&w.status===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div></div>'
  // Labour section
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid var(--navy);padding-bottom:4px">Labour Hours</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);width:20px">#</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:left;min-width:130px">Employee</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Mon</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Tue</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Wed</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Thu</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Fri</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:40px">Sat</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:44px">KG</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:30px">Done</th>'
  +'<th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center;width:44px">Total</th>'
  +'</tr></thead><tbody>'+labRows+'</tbody>'
  +'<tfoot><tr><td colspan="10" style="padding:6px 5px;font-weight:700;text-align:right;font-size:11px">TOTAL LABOUR HOURS:</td><td id="wiLabGrand" style="padding:6px;font-weight:700;font-family:monospace;text-align:center;color:var(--navy)">0</td></tr></tfoot>'
  +'</table></div>'
  // Standing time section
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:#9b1c1c;text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid #9b1c1c;padding-bottom:4px">Standing Time</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:left;min-width:130px">Employee</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:left;min-width:80px">Reason</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Mon</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Tue</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Wed</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Thu</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Fri</th>'
  +'<th style="padding:5px;background:#fff5f5;border-bottom:1px solid var(--border);text-align:center;width:40px">Sat</th>'
  +'</tr></thead><tbody>'+stRows+'</tbody></table></div>'
  // Sign off
  +'<div style="margin:14px 0 6px;font-size:11px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid var(--navy);padding-bottom:4px">Sign-off</div>'
  +'<div class="f2"><div class="mfr"><label>Artisan name</label><input id="wiArtisan" value="'+(w?w.artisan||'':'')+'"></div><div class="mfr"><label>HOD name</label><input id="wiHOD" value="'+(w?w.hod||'':'')+'"></div></div>'
  +'<div class="mfr"><label>Completion status</label><select id="wiComplete"><option value="Partial"'+(w&&w.complete_status==="Partial"?" selected":"")+'>Partial</option><option value="Yes"'+(w&&w.complete_status==="Yes"?" selected":"")+'>Yes — All complete</option><option value="No"'+(w&&w.complete_status==="No"?" selected":"")+'>No</option></select></div>'
  +'<div class="mfoot"><button class="btn" id="cancelWI">Cancel</button><button class="btn btn-p" id="saveWI">'+(editId?'Update WI':'Save WI')+'</button></div>');

  // Wire up calculators
  setTimeout(function(){
    function calcLabRow(i){
      var days=['mon','tue','wed','thu','fri','sat'];
      var tot=0;
      days.forEach(function(d){var el=document.querySelector('.wi-'+d+'[data-row="'+i+'"]');if(el)tot+=(+el.value||0);});
      var tEl=document.getElementById('wiLabTot'+i);if(tEl)tEl.textContent=tot;
      calcLabTotal();
    }
    function calcLabTotal(){
      var total=0;
      for(var i=0;i<12;i++){var el=document.getElementById('wiLabTot'+i);if(el)total+=(+el.textContent||0);}
      var gt=document.getElementById('wiLabGrand');if(gt)gt.textContent=total;
    }
    for(var i=0;i<12;i++){calcLabRow(i);}
    document.querySelectorAll('.wi-mon,.wi-tue,.wi-wed,.wi-thu,.wi-fri,.wi-sat').forEach(function(el){
      el.addEventListener('input',function(){calcLabRow(+this.getAttribute('data-row'));});
    });

    // WI order change
    var wiJobEl=document.getElementById('wiJob');
    if(wiJobEl&&!editId){
      onWIOrderChange();
    }
    if(editId&&w&&w.job_ref==='NO_ORDER'){
      var nb=document.getElementById('wiNoOrderBox');
      if(nb)nb.style.display='block';
    }
    var wiBUEl=document.getElementById('wiBU');
    if(wiBUEl)wiBUEl.addEventListener('change',checkWIBUMatch);
    setTimeout(checkWIBUMatch,60);

    document.getElementById('cancelWI').addEventListener('click',closeM);
    document.getElementById('saveWI').addEventListener('click',function(){
      var jobRef=gv('wiJob');
      if(!jobRef){toast('Please select an order, or choose No order yet','e');return;}
      var isNoOrder=jobRef==='NO_ORDER';
      if(isNoOrder&&!gv('wiWaybill')){toast('Please enter the waybill number','e');return;}
      var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
      // Collect labour data
      var labArr=[];
      var wiEmps=document.querySelectorAll('.wi-emp');
      for(var i=0;i<12;i++){
        if(wiEmps[i]&&wiEmps[i].value){
          labArr.push({
            emp:wiEmps[i].value,
            mon:+(document.querySelectorAll('.wi-mon')[i]||{}).value||0,
            tue:+(document.querySelectorAll('.wi-tue')[i]||{}).value||0,
            wed:+(document.querySelectorAll('.wi-wed')[i]||{}).value||0,
            thu:+(document.querySelectorAll('.wi-thu')[i]||{}).value||0,
            fri:+(document.querySelectorAll('.wi-fri')[i]||{}).value||0,
            sat:+(document.querySelectorAll('.wi-sat')[i]||{}).value||0,
            kg:+(document.querySelectorAll('.wi-kg')[i]||{}).value||0,
            done:!!(document.querySelectorAll('.wi-done')[i]||{}).checked
          });
        }
      }
      // Collect standing time
      var stArr=[];
      var stEmps=document.querySelectorAll('.st-emp');
      var stRsns=document.querySelectorAll('.st-rsn');
      for(var k=0;k<5;k++){
        if(stEmps[k]&&stEmps[k].value){
          stArr.push({
            emp:stEmps[k].value,
            reason:stRsns[k]?stRsns[k].value:'',
            mon:+(document.querySelectorAll('.st-mon')[k]||{}).value||0,
            tue:+(document.querySelectorAll('.st-tue')[k]||{}).value||0,
            wed:+(document.querySelectorAll('.st-wed')[k]||{}).value||0,
            thu:+(document.querySelectorAll('.st-thu')[k]||{}).value||0,
            fri:+(document.querySelectorAll('.st-fri')[k]||{}).value||0,
            sat:+(document.querySelectorAll('.st-sat')[k]||{}).value||0
          });
        }
      }
      var data={
        wi_ref:gv('wiRef'),job_ref:jobRef,bu:gv('wiBU'),
        waybill:isNoOrder?gv('wiWaybill'):'',client:isNoOrder?gv('wiClient'):(ord?ord.client:''),item_desc:isNoOrder?gv('wiItem'):'',
        description:gv('wiDesc'),trade:gv('wiTrade'),foreman:gv('wiForeman'),
        priority:gv('wiPri'),start_date:fmtD(gv('wiStart')),
        target_date:fmtD(gv('wiTarget')),est_hrs:+gv('wiEstHrs')||0,
        status:gv('wiStatus'),artisan:gv('wiArtisan'),hod:gv('wiHOD'),
        complete_status:gv('wiComplete'),
        labour_data:JSON.stringify(labArr),
        standing_data:JSON.stringify(stArr)
      };
      var pr=editId?dbPatch('work_instructions','id=eq.'+editId,data):dbPost('work_instructions',data);
      pr.then(function(){closeM();return loadAll();}).then(function(){go('wi');toast(editId?'WI updated':'WI saved','s');}).catch(function(e){toast(e.message,'e');});
    });
  },100);
}

function onWIOrderChange(){
  var jobRef=gv('wiJob');
  var box=document.getElementById('wiNoOrderBox');
  var buEl=document.getElementById('wiBU');
  var refEl=document.getElementById('wiRef');
  if(jobRef==='NO_ORDER'){
    if(box)box.style.display='block';
    var noOrderWIs=wis.filter(function(x){return x.job_ref==='NO_ORDER';});
    if(refEl)refEl.value='NOPO/'+String(noOrderWIs.length+1).padStart(3,'0');
    checkWIBUMatch();
    return;
  }
  if(box)box.style.display='none';
  var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
  if(ord){
    if(buEl)buEl.value=ord.bu;
    var existing=wis.filter(function(x){return x.job_ref===jobRef;});
    if(refEl)refEl.value=jobRef+'/'+String(existing.length+1).padStart(2,'0');
  }
  checkWIBUMatch();
}

function checkWIBUMatch(){
  var jobRef=gv('wiJob');
  var selBU=gv('wiBU');
  var note=document.getElementById('wiBUNote');
  if(!note)return;
  if(!jobRef||jobRef==='NO_ORDER'){note.style.display='none';return;}
  var ord=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===jobRef){ord=orders[i];break;}}
  if(ord&&selBU&&selBU!==ord.bu){
    note.style.display='block';
    note.innerHTML='&#8505; Order <strong>'+jobRef+'</strong> sits under <strong>'+ord.bu+'</strong>, but this WI is assigned to <strong>'+selBU+'</strong>. Labour hours will be costed to '+selBU+' in the Labour Report.';
  }else{
    note.style.display='none';
  }
}

// ── JOB COSTING (LIVE) ───────────────────────────────────────────────────────
function rJobCosting(){
  var openOrds=orders.filter(function(o){return !o.invoiced;});
  return '<div class="card"><div class="card-hd"><h3>Live job costing — select MM Number</h3></div>'
  +'<div class="toolbar"><select id="jcostMM" onchange="loadJobCost()" style="min-width:200px"><option value="">Select MM Number...</option>'+openOrds.map(function(o){return '<option value="'+o.id+'">'+o.ref+' — '+o.client+'</option>';}).join('')+'</select></div>'
  +'<div id="jcostBody" style="padding:17px"><div class="empty">Select an MM Number above to view live job costing</div></div>'
  +'</div>';
}

function loadJobCost(){
  var id=gv('jcostMM');
  var body=document.getElementById('jcostBody');
  if(!id||!body){return;}
  var o=null;for(var i=0;i<orders.length;i++){if(orders[i].id===id){o=orders[i];break;}}
  if(!o)return;

  // Materials from Buyer Sheet
  var matSpent=spos.filter(function(p){return p.job_ref===o.ref;}).reduce(function(s,p){return s+(+p.amount||0);},0);

  // Labour from WI forms — per employee × their rate
  var jobWIs=wis.filter(function(w){return w.job_ref===o.ref;});
  var labCost=0;
  var labHrs=0;
  var labBreakdown=[];
  var empTotals={};
  jobWIs.forEach(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    labData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      if(!empTotals[e.emp])empTotals[e.emp]=0;
      empTotals[e.emp]+=hrs;
    });
  });
  Object.keys(empTotals).forEach(function(empName){
    var rate=0;
    for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===empName){rate=+lrates[i].rate||0;break;}}
    var hrs=empTotals[empName];
    var cost=hrs*rate;
    labHrs+=hrs;
    labCost+=cost;
    labBreakdown.push({emp:empName,hrs:hrs,rate:rate,cost:cost});
  });

  // Standing time cost — per employee × their rate
  var stCost=0;
  var stHrs=0;
  var stBreakdown=[];
  var stEmpTotals={};
  jobWIs.forEach(function(w){
    var stData=w.standing_data?JSON.parse(w.standing_data):[];
    stData.forEach(function(e){
      if(!e.emp)return;
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      if(!stEmpTotals[e.emp])stEmpTotals[e.emp]={hrs:0,reason:e.reason};
      stEmpTotals[e.emp].hrs+=hrs;
    });
  });
  Object.keys(stEmpTotals).forEach(function(empName){
    var rate=0;
    for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===empName){rate=+lrates[i].rate||0;break;}}
    var hrs=stEmpTotals[empName].hrs;
    var cost=hrs*rate;
    stHrs+=hrs;
    stCost+=cost;
    stBreakdown.push({emp:empName,hrs:hrs,rate:rate,cost:cost,reason:stEmpTotals[empName].reason});
  });

  var totalCost=matSpent+labCost+stCost;
  var quoteVal=+o.order_val||0;
  var grossProfit=quoteVal-totalCost;
  var margin=quoteVal>0?Math.round(grossProfit/quoteVal*100):0;

  function tl(pct){
    if(pct>=95)return '<span style="background:#fff5f5;color:#9b1c1c;border:1px solid #fed7d7;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🔴 CRITICAL</span>';
    if(pct>=75)return '<span style="background:#fffbeb;color:#92400e;border:1px solid #fcd34d;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🟡 WATCH</span>';
    return '<span style="background:#f0fff4;color:#276749;border:1px solid #c6f6d5;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">🟢 ON TRACK</span>';
  }

  var matPct=quoteVal>0?Math.round(matSpent/quoteVal*100):0;
  var labPct=quoteVal>0?Math.round(labCost/quoteVal*100):0;
  var stPct=quoteVal>0?Math.round(stCost/quoteVal*100):0;
  var totPct=quoteVal>0?Math.round(totalCost/quoteVal*100):0;

  body.innerHTML=
  // Header
  '<div style="background:#f4f6f9;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;gap:24px;flex-wrap:wrap;font-size:12px">'
  +'<span><strong>Client:</strong> '+o.client+'</span>'
  +'<span><strong>BU:</strong> '+o.bu+'</span>'
  +'<span><strong>Status:</strong> '+o.status+'</span>'
  +'<span><strong>Quote Value:</strong> <strong style="color:var(--navy)">'+R(quoteVal)+'</strong></span>'
  +'<span><strong>WIs:</strong> '+jobWIs.length+'</span>'
  +'</div>'

  // KPI tiles
  +'<div class="kpis" style="margin-bottom:16px">'
  +'<div class="kpi cgo"><div class="kpi-l">Quote value</div><div class="kpi-v">'+R(quoteVal)+'</div></div>'
  +'<div class="kpi cn"><div class="kpi-l">Total cost</div><div class="kpi-v">'+R(totalCost)+'</div><div class="kpi-s">'+totPct+'% of quote</div></div>'
  +'<div class="kpi '+(grossProfit>=0?'cg':'cr')+'"><div class="kpi-l">Gross profit</div><div class="kpi-v">'+R(grossProfit)+'</div></div>'
  +'<div class="kpi '+(margin>=15?'cg':margin>=0?'ca':'cr')+'"><div class="kpi-l">Margin</div><div class="kpi-v">'+margin+'%</div></div>'
  +'</div>'

  // Materials
  +'<div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
  +'<span style="font-weight:700;font-size:13px">📦 Materials</span>'+tl(matPct)+'</div>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px">'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Buyer Sheet Total</div><div class="mono" style="font-size:16px;font-weight:700">'+R(matSpent)+'</div><div style="font-size:10px;color:#718096">'+spos.filter(function(p){return p.job_ref===o.ref;}).length+' supplier POs</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">% of Quote</div><div class="mono" style="font-size:16px;font-weight:700">'+matPct+'%</div></div>'
  +'<div><div style="color:#718096;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:2px">Remaining</div><div class="mono" style="font-size:16px;font-weight:700">'+R(quoteVal-matSpent)+'</div></div>'
  +'</div></div>'

  // Labour
  +'<div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
  +'<span style="font-weight:700;font-size:13px">🔧 Labour ('+labHrs+' hrs)</span>'+tl(labPct)+'</div>'
  +(labBreakdown.length>0?'<div style="overflow-x:auto;margin-bottom:10px"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:left">Employee</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:center">Hours</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:right">Rate/hr</th><th style="padding:5px;background:#fafbfc;border-bottom:1px solid var(--border);text-align:right">Cost</th></tr></thead><tbody>'+labBreakdown.map(function(e){return '<tr><td style="padding:5px;font-weight:500">'+e.emp+'</td><td style="padding:5px;text-align:center;font-family:monospace">'+e.hrs+'</td><td style="padding:5px;text-align:right;font-family:monospace">'+R(e.rate)+'</td><td style="padding:5px;text-align:right;font-family:monospace;font-weight:600">'+R(e.cost)+'</td></tr>';}).join('')+'<tr style="background:#f4f6f9"><td style="padding:5px;font-weight:700">TOTAL</td><td style="padding:5px;text-align:center;font-family:monospace;font-weight:700">'+labHrs+'</td><td></td><td style="padding:5px;text-align:right;font-family:monospace;font-weight:700">'+R(labCost)+'</td></tr></tbody></table></div>':'<div style="color:#a0aec0;font-size:12px;margin-bottom:10px">No WI labour entries yet</div>')
  +'</div>'

  // Standing time
  +(stHrs>0?'<div style="border:1px solid #fed7d7;border-radius:8px;padding:14px;margin-bottom:10px;background:#fff5f5">'
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
  +'<span style="font-weight:700;font-size:13px;color:#9b1c1c">⚠ Standing Time ('+stHrs+' hrs)</span></div>'
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:5px;background:#fff5f5;border-bottom:1px solid #fed7d7;text-align:left">Employee</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid #fed7d7;text-align:left">Reason</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid #fed7d7;text-align:center">Hours</th><th style="padding:5px;background:#fff5f5;border-bottom:1px solid #fed7d7;text-align:right">Cost</th></tr></thead><tbody>'+stBreakdown.map(function(e){return '<tr><td style="padding:5px;font-weight:500">'+e.emp+'</td><td style="padding:5px;color:#718096">'+e.reason+'</td><td style="padding:5px;text-align:center;font-family:monospace">'+e.hrs+'</td><td style="padding:5px;text-align:right;font-family:monospace;font-weight:600;color:#c53030">'+R(e.cost)+'</td></tr>';}).join('')+'</tbody></table></div>'
  +'</div>':'')

  // Profit summary
  +'<div style="border:2px solid var(--navy);border-radius:8px;padding:16px;background:#f8fafc">'
  +'<div style="font-weight:700;font-size:13px;color:var(--navy);margin-bottom:12px">Profit Summary</div>'
  +'<table style="width:100%;font-size:12px;border-collapse:collapse">'
  +'<tr><td style="padding:5px 0">Quote / Contract Value</td><td style="text-align:right;font-family:monospace;font-weight:600">'+R(quoteVal)+'</td></tr>'
  +'<tr><td style="padding:5px 0;color:#718096">Less: Material Cost</td><td style="text-align:right;font-family:monospace;color:#718096">− '+R(matSpent)+'</td></tr>'
  +'<tr><td style="padding:5px 0;color:#718096">Less: Labour Cost</td><td style="text-align:right;font-family:monospace;color:#718096">− '+R(labCost)+'</td></tr>'
  +(stCost>0?'<tr><td style="padding:5px 0;color:#c53030">Less: Standing Time Cost</td><td style="text-align:right;font-family:monospace;color:#c53030">− '+R(stCost)+'</td></tr>':'')
  +'<tr style="border-top:2px solid var(--navy)"><td style="padding:8px 0;font-weight:700;font-size:14px">GROSS PROFIT</td><td style="text-align:right;font-family:monospace;font-weight:700;font-size:14px;color:'+(grossProfit>=0?'#276749':'#c53030')+'">'+R(grossProfit)+'</td></tr>'
  +'<tr><td style="padding:3px 0;color:#718096">Profit Margin</td><td style="text-align:right;font-family:monospace;font-weight:600;color:'+(margin>=15?'#276749':margin>=0?'#d97706':'#c53030')+'">'+margin+'%</td></tr>'
  +'<tr><td style="padding:3px 0;color:#718096">Job Status</td><td style="text-align:right;font-weight:600;color:'+(grossProfit>=0?'#276749':'#c53030')+'">'+(grossProfit>0?'Profitable':grossProfit===0?'Break-Even':'Loss')+'</td></tr>'
  +'</table></div>';
}

function oSPOEditForm(id,p){
  openM('<div class="mtitle">Edit Supplier PO</div>'
  +'<div class="f2"><div class="mfr"><label>SPO ref</label><input id="mSr" value="'+(p.spref||'')+'"></div><div class="mfr"><label>Job number (MM ref)</label><input id="mSj" value="'+(p.job_ref||'')+'"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Business unit</label>'+buS('mSb',p.bu)+'</div><div class="mfr"><label>Supplier</label><input id="mSs" value="'+(p.supplier||'')+'"></div></div>'
  +'<div class="mfr"><label>Description</label><textarea id="mSd">'+(p.description||'')+'</textarea></div>'
  +'<div class="f2"><div class="mfr"><label>Excl. Amount (R)</label><input type="number" id="mSa" value="'+(p.amount||0)+'"></div><div class="mfr"><label>Date ordered</label><input type="date" id="mSdt" value="'+(p.ordered||td())+'"></div></div>'
  +'<div class="mfoot"><button class="btn" id="cancelSPOE">Cancel</button><button class="btn btn-p" id="saveSPOE">Update PO</button></div>');
  document.getElementById('cancelSPOE').addEventListener('click',closeM);
  document.getElementById('saveSPOE').addEventListener('click',function(){
    var b={spref:gv('mSr'),job_ref:gv('mSj'),bu:gv('mSb'),supplier:gv('mSs'),description:gv('mSd'),amount:+gv('mSa')||0,ordered:fmtD(gv('mSdt'))};
    dbPatch('supplier_pos','id=eq.'+id,b).then(function(){closeM();return loadAll();}).then(function(){go('buyer');toast('PO updated','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function printWI(w){
  var labData=w.labour_data?JSON.parse(w.labour_data):[];
  var stData=w.standing_data?JSON.parse(w.standing_data):[];

  // Build labour rows
  var labRows='';
  var labTotal=0;
  for(var i=0;i<12;i++){
    var ld=labData[i]||null;
    var emp=ld?ld.emp:'';
    var mon=ld?(+ld.mon||0):0,tue=ld?(+ld.tue||0):0,wed=ld?(+ld.wed||0):0;
    var thu=ld?(+ld.thu||0):0,fri=ld?(+ld.fri||0):0,sat=ld?(+ld.sat||0):0;
    var tot=mon+tue+wed+thu+fri+sat;
    var kg=ld?(+ld.kg||0):0;
    var done=ld&&ld.done?'✓':'';
    labTotal+=tot;
    labRows+='<tr>'
    +'<td style="text-align:center;color:#718096">'+(i+1)+'</td>'
    +'<td>'+emp+'</td>'
    +'<td style="text-align:center">'+(mon||'')+'</td>'
    +'<td style="text-align:center">'+(tue||'')+'</td>'
    +'<td style="text-align:center">'+(wed||'')+'</td>'
    +'<td style="text-align:center">'+(thu||'')+'</td>'
    +'<td style="text-align:center">'+(fri||'')+'</td>'
    +'<td style="text-align:center">'+(sat||'')+'</td>'
    +'<td style="text-align:center">'+(kg||'')+'</td>'
    +'<td style="text-align:center;font-weight:700;color:#276749">'+done+'</td>'
    +'</tr>';
  }

  // Build standing time rows
  var stRows='';
  var stTotal=0;
  for(var k=0;k<5;k++){
    var sd=stData[k]||null;
    var semp=sd?sd.emp:'';
    var sreason=sd?sd.reason:'';
    var smon=sd?(+sd.mon||0):0,stue=sd?(+sd.tue||0):0,swed=sd?(+sd.wed||0):0;
    var sthu=sd?(+sd.thu||0):0,sfri=sd?(+sd.fri||0):0,ssat=sd?(+sd.sat||0):0;
    var stot=smon+stue+swed+sthu+sfri+ssat;
    stTotal+=stot;
    stRows+='<tr>'
    +'<td>'+(k+1)+'</td>'
    +'<td>'+sreason+'</td>'
    +'<td>'+semp+'</td>'
    +'<td style="text-align:center">'+(smon||'')+'</td>'
    +'<td style="text-align:center">'+(stue||'')+'</td>'
    +'<td style="text-align:center">'+(swed||'')+'</td>'
    +'<td style="text-align:center">'+(sthu||'')+'</td>'
    +'<td style="text-align:center">'+(sfri||'')+'</td>'
    +'<td style="text-align:center">'+(ssat||'')+'</td>'
    +'<td style="text-align:center;font-weight:700">'+(stot||'')+'</td>'
    +'</tr>';
  }

  var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'
  +'<title>WI '+w.wi_ref+'</title>'
  +'<style>'
  +'*{box-sizing:border-box;margin:0;padding:0}'
  +'body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px}'
  +'.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f1923;padding-bottom:12px;margin-bottom:14px}'
  +'.logo-area{display:flex;flex-direction:column}'
  +'.company{font-size:16px;font-weight:700;color:#0f1923}'
  +'.sub{font-size:10px;color:#718096;margin-top:2px}'
  +'.doc-title{font-size:22px;font-weight:700;color:#0f1923;text-align:right}'
  +'.doc-ref{font-size:10px;color:#718096;text-align:right;margin-top:2px}'
  +'.section-title{background:#0f1923;color:#fff;font-weight:700;font-size:11px;padding:5px 8px;margin:12px 0 6px;letter-spacing:.05em;text-transform:uppercase}'
  +'.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #ccc}'
  +'.grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0;border:1px solid #ccc}'
  +'.field{padding:5px 8px;border-right:1px solid #ccc;border-bottom:1px solid #ccc}'
  +'.field:last-child{border-right:none}'
  +'.field-label{font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}'
  +'.field-value{font-size:11px;font-weight:500;min-height:14px}'
  +'table{width:100%;border-collapse:collapse;font-size:10px}'
  +'th{background:#0f1923;color:#fff;padding:5px 6px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.04em}'
  +'th.c{text-align:center}'
  +'td{padding:5px 6px;border-bottom:1px solid #e2e8f0}'
  +'td.c{text-align:center}'
  +'tr:nth-child(even) td{background:#f9fafb}'
  +'.totrow td{background:#f0f0f0;font-weight:700;border-top:2px solid #0f1923}'
  +'.signoff{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}'
  +'.sign-box{border:1px solid #ccc;padding:10px;border-radius:4px}'
  +'.sign-line{border-bottom:1px solid #333;margin:20px 0 4px;height:1px}'
  +'.footer{margin-top:16px;padding-top:8px;border-top:1px solid #ccc;display:flex;justify-content:space-between;font-size:9px;color:#718096}'
  +'@media print{body{padding:10px}}'
  +'</style></head><body>'

  // Header
  +'<div class="header">'
  +'<div class="logo-area"><div class="company">Mine Minerals Supplies &amp; Services</div><div class="sub">Rustenburg · 066 212 2225 · info@mineminerals.co.za</div></div>'
  +'<div><div class="doc-title">WORK INSTRUCTION</div><div class="doc-ref">Doc Ref: MM-WI-001 | Rev: 00</div></div>'
  +'</div>'

  // Section 1 — Job Details
  +'<div class="section-title">1. Job Details</div>'
  +'<div class="grid4">'
  +'<div class="field"><div class="field-label">WI Number</div><div class="field-value">'+w.wi_ref+'</div></div>'
  +'<div class="field"><div class="field-label">MM Job Number</div><div class="field-value">'+w.job_ref+'</div></div>'
  +'<div class="field"><div class="field-label">Date Issued</div><div class="field-value">'+fd(w.start_date)+'</div></div>'
  +'<div class="field"><div class="field-label">Target Completion</div><div class="field-value">'+fd(w.target_date)+'</div></div>'
  +'</div>'
  +'<div class="grid2">'
  +'<div class="field"><div class="field-label">Job Description</div><div class="field-value">'+w.description+'</div></div>'
  +'<div class="field"><div class="field-label">Business Unit</div><div class="field-value">'+w.bu+'</div></div>'
  +'</div>'
  +'<div class="grid4">'
  +'<div class="field"><div class="field-label">Foreman / Issued By</div><div class="field-value">'+w.foreman+'</div></div>'
  +'<div class="field"><div class="field-label">Trade / Skill</div><div class="field-value">'+w.trade+'</div></div>'
  +'<div class="field"><div class="field-label">Estimated Hours</div><div class="field-value">'+w.est_hrs+'</div></div>'
  +'<div class="field"><div class="field-label">Priority</div><div class="field-value">'+w.priority+'</div></div>'
  +'</div>'

  // Section 2 — Labour Hours
  +'<div class="section-title">2. Labour Hours</div>'
  +'<table><thead><tr>'
  +'<th style="width:24px" class="c">#</th>'
  +'<th>Employee</th>'
  +'<th class="c">Mon</th><th class="c">Tue</th><th class="c">Wed</th><th class="c">Thu</th><th class="c">Fri</th><th class="c">Sat</th>'
  +'<th class="c">KG</th><th class="c">Done ✓</th>'
  +'</tr></thead><tbody>'+labRows
  +'<tr class="totrow"><td></td><td>TOTAL LABOUR HOURS</td><td colspan="6"></td><td></td><td class="c">'+labTotal+'</td></tr>'
  +'</tbody></table>'

  // Section 3 — Standing Time
  +'<div class="section-title">3. Standing Time</div>'
  +'<table><thead><tr>'
  +'<th style="width:24px" class="c">#</th>'
  +'<th>Reason for Standing Time</th>'
  +'<th>Employee</th>'
  +'<th class="c">Mon</th><th class="c">Tue</th><th class="c">Wed</th><th class="c">Thu</th><th class="c">Fri</th><th class="c">Sat</th>'
  +'<th class="c">Total</th>'
  +'</tr></thead><tbody>'+stRows
  +'<tr class="totrow"><td colspan="9" style="text-align:right">TOTAL STANDING TIME (hrs):</td><td class="c">'+stTotal+'</td></tr>'
  +'</tbody></table>'

  // Section 4 — Sign off
  +'<div class="section-title">4. Sign-Off</div>'
  +'<div style="border:1px solid #ccc;padding:8px;margin-bottom:8px;font-size:10px;background:#fffbeb">'
  +'<strong>ARTISAN ACKNOWLEDGEMENT:</strong> I confirm that I have read, understood, and accept the work instructions detailed above and will carry out the work accordingly.'
  +'</div>'
  +'<div class="signoff">'
  +'<div class="sign-box">'
  +'<div class="field-label" style="margin-bottom:4px">Artisan Name</div>'
  +'<div style="font-weight:600;margin-bottom:8px">'+w.artisan+'</div>'
  +'<div class="sign-line"></div>'
  +'<div class="field-label">Artisan Signature &nbsp;&nbsp;&nbsp; Date: _______________</div>'
  +'</div>'
  +'<div class="sign-box">'
  +'<div class="field-label" style="margin-bottom:4px">HOD Name</div>'
  +'<div style="font-weight:600;margin-bottom:8px">'+w.hod+'</div>'
  +'<div class="sign-line"></div>'
  +'<div class="field-label">HOD Signature &nbsp;&nbsp;&nbsp; Date: _______________</div>'
  +'<div style="margin-top:8px"><span class="field-label">All Steps Complete: </span>'
  +'<span style="margin-left:8px">☐ Yes &nbsp; ☐ No &nbsp; ☐ Partial</span></div>'
  +'</div>'
  +'</div>'

  // Footer
  +'<div class="footer">'
  +'<span>Mine Minerals Supplies &amp; Services | Work Instruction Form | Doc Ref: MM-WI-001 | Rev: 00</span>'
  +'<span>Printed: '+new Date().toLocaleDateString('en-ZA')+'</span>'
  +'</div>'

  +'<script>window.onload=function(){window.print();}<\/script>'
  +'</body></html>';

  var win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();}
  else{toast('Allow popups to print','e');}
}

function calcWOTotal(){
  var mb=+document.getElementById('wOmb').value||0;
  var lb=+document.getElementById('wOlb').value||0;
  var ov=+document.getElementById('wOv').value||0;
  var tot=mb+lb;
  var unalloc=ov-tot;
  var totEl=document.getElementById('wOtotal');
  var unEl=document.getElementById('wOunalloc');
  if(totEl)totEl.textContent='R '+Math.round(tot).toLocaleString('en-ZA');
  if(unEl){unEl.textContent='R '+Math.round(unalloc).toLocaleString('en-ZA');unEl.style.color=unalloc<0?'#c53030':unalloc===0?'#276749':'#718096';}
}

function oSubJob(masterId){
  // Get master order
  var master=null;
  if(masterId){for(var i=0;i<orders.length;i++){if(orders[i].id===masterId){master=orders[i];break;}}}
  // Build master options
  var masterOrds=orders.filter(function(o){return !o.invoiced&&!o.master_ref;});
  var masterOpts=masterOrds.map(function(o){return '<option value="'+o.ref+'"'+(master&&master.ref===o.ref?' selected':'')+'>'+o.ref+' — '+o.client+'</option>';}).join('');

  openM('<div class="mtitle">Add Sub-job</div>'
  +'<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:6px;padding:9px 12px;font-size:11px;color:#276749;margin-bottom:14px">A sub-job splits a master MM Number across multiple BUs. Each sub-job gets its own budget, WIs and Buyer Sheet entries.</div>'
  +'<div class="mfr"><label>Master MM Number</label><select id="sjMaster" onchange="onSubJobMasterChange()"><option value="">Select master order...</option>'+masterOpts+'</select></div>'
  +'<div class="f2"><div class="mfr"><label>Sub-job ref (auto)</label><input id="sjRef" value="" readonly style="background:#f4f6f9;font-weight:600;color:#276749"></div><div class="mfr"><label>Business unit</label>'+buS('sjBU','')+'</div></div>'
  +'<div class="mfr"><label>Scope description</label><input id="sjDesc" placeholder="e.g. Fabrication scope — skid base"></div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:12px;margin-bottom:11px"><div style="font-size:10px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Budget Split for this BU</div>'
  +'<div class="f2"><div class="mfr"><label>Sub-job value (R)</label><input type="number" id="sjVal" value="0"></div><div class="mfr"><label>Due date</label><input type="date" id="sjDue"></div></div>'
  +'<div class="f2"><div class="mfr"><label>Material budget (R)</label><input type="number" id="sjMB" value="0"></div><div class="mfr"><label>Labour budget (R)</label><input type="number" id="sjLB" value="0"></div></div>'
  +'</div>'
  +'<div class="mfoot"><button class="btn" id="cancelSJ">Cancel</button><button class="btn btn-p" id="saveSJ">Create sub-job</button></div>');

  document.getElementById('cancelSJ').addEventListener('click',closeM);
  if(masterId)setTimeout(function(){onSubJobMasterChange();},50);

  document.getElementById('saveSJ').addEventListener('click',function(){
    var masterRef=gv('sjMaster');
    if(!masterRef){toast('Please select a master order','e');return;}
    var masterOrd=null;for(var i=0;i<orders.length;i++){if(orders[i].ref===masterRef){masterOrd=orders[i];break;}}
    var sjRef=gv('sjRef');
    if(!sjRef){toast('Sub-job ref not generated — select master first','e');return;}
    var data={
      ref:sjRef,
      master_ref:masterRef,
      client:masterOrd?masterOrd.client:'',
      client_po:masterOrd?masterOrd.client_po:'',
      bu:gv('sjBU'),
      type:gv('sjDesc'),
      order_val:+gv('sjVal')||0,
      mat_budget:+gv('sjMB')||0,
      lab_budget:+gv('sjLB')||0,
      received:td(),
      due:fmtD(gv('sjDue')),
      status:'Open',
      job_cards:0,
      invoiced:false,
      notes:'Sub-job of '+masterRef+' — '+gv('sjDesc')
    };
    dbPost('orders',data).then(function(){
      closeM();return loadAll();
    }).then(function(){
      go('orders');toast('Sub-job '+sjRef+' created','s');
    }).catch(function(e){toast(e.message,'e');});
  });
}

function onSubJobMasterChange(){
  var masterRef=gv('sjMaster');
  if(!masterRef)return;
  // Count existing sub-jobs for this master
  var existing=orders.filter(function(o){return o.master_ref===masterRef;});
  var nextNum=existing.length+1;
  var buEl=document.getElementById('sjBU');
  var bu=buEl?buEl.value:'';
  // Auto ref: MM1350/FAB or MM1350/01 if no BU selected
  var buCode=bu?bu.substring(0,3).toUpperCase():String(nextNum).padStart(2,'0');
  var autoRef=masterRef+'/'+buCode;
  var refEl=document.getElementById('sjRef');
  if(refEl)refEl.value=autoRef;
}


// ── REPORTS ──────────────────────────────────────────────────────────────────
function rReports(){
  return '<div class="card"><div class="card-hd"><h3>Reports</h3></div>'
  +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;padding:17px">'
  +'<button class="report-card" id="rptLabourBtn" style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:20px;text-align:left;cursor:pointer;transition:box-shadow .2s;box-shadow:0 1px 3px rgba(0,0,0,.05)">'
  +'<div style="font-size:28px;margin-bottom:8px">👷</div>'
  +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:4px">Labour Efficiency Report</div>'
  +'<div style="font-size:11px;color:#718096">Available vs worked hours per employee per month. Identifies productivity and standing time patterns.</div>'
  +'</button>'
  +'<div style="background:#f4f6f9;border:1px dashed #e2e8f0;border-radius:10px;padding:20px;text-align:left;opacity:.5">'
  +'<div style="font-size:28px;margin-bottom:8px">📦</div>'
  +'<div style="font-size:13px;font-weight:700;color:#718096;margin-bottom:4px">Materials Report</div>'
  +'<div style="font-size:11px;color:#a0aec0">Coming soon</div>'
  +'</div>'
  +'<div style="background:#f4f6f9;border:1px dashed #e2e8f0;border-radius:10px;padding:20px;text-align:left;opacity:.5">'
  +'<div style="font-size:28px;margin-bottom:8px">💰</div>'
  +'<div style="font-size:13px;font-weight:700;color:#718096;margin-bottom:4px">Profitability Report</div>'
  +'<div style="font-size:11px;color:#a0aec0">Coming soon</div>'
  +'</div>'
  +'<div style="background:#f4f6f9;border:1px dashed #e2e8f0;border-radius:10px;padding:20px;text-align:left;opacity:.5">'
  +'<div style="font-size:28px;margin-bottom:8px">📊</div>'
  +'<div style="font-size:13px;font-weight:700;color:#718096;margin-bottom:4px">BU Performance Report</div>'
  +'<div style="font-size:11px;color:#a0aec0">Coming soon</div>'
  +'</div>'
  +'</div></div>'
  +'<div id="reportContent"></div>';
}

function rLabourReport(){
  var now=new Date();
  var selMonth=document.getElementById('rptMonth')?+document.getElementById('rptMonth').value:now.getMonth();
  var selYear=document.getElementById('rptYear')?+document.getElementById('rptYear').value:now.getFullYear();
  var selBU=document.getElementById('rptBU')?document.getElementById('rptBU').value:'';

  // Working days in the month (Mon-Sat, 8hrs each) — full month and to date
  var daysInMonth=new Date(selYear,selMonth+1,0).getDate();
  var tNow=new Date();tNow.setHours(0,0,0,0);
  var isCurrentMonth=(selMonth===tNow.getMonth()&&selYear===tNow.getFullYear());
  var isFutureMonth=(selYear>tNow.getFullYear())||(selYear===tNow.getFullYear()&&selMonth>tNow.getMonth());
  var lastDay=isCurrentMonth?tNow.getDate():daysInMonth;
  var workDaysFull=0,workDaysToDate=0;
  for(var d=1;d<=daysInMonth;d++){
    var day=new Date(selYear,selMonth,d).getDay();
    if(day>=1&&day<=6){workDaysFull++;if(d<=lastDay)workDaysToDate++;}
  }
  if(isFutureMonth)workDaysToDate=0;
  var workDays=workDaysToDate;
  var autoHrsFull=workDaysFull*8;
  var autoHrs=workDaysToDate*8;
  // Check for a manual override saved for this month
  var override=null;
  for(var mi=0;mi<msettings.length;mi++){
    if(+msettings[mi].month===selMonth&&+msettings[mi].year===selYear){override=msettings[mi];break;}
  }
  var isOverride=!!(override&&+override.available_hrs>0);
  var availHrsFull=isOverride?+override.available_hrs:autoHrsFull;
  // Pro-rate the override by working days elapsed
  var availHrsPerEmp=isOverride
    ? (workDaysFull>0?Math.round(availHrsFull*workDaysToDate/workDaysFull):0)
    : autoHrs;

  // Filter WIs for selected month/year
  var monthWIs=wis.filter(function(w){
    if(!w.start_date)return false;
    var d=new Date(w.start_date);
    return d.getMonth()===selMonth&&d.getFullYear()===selYear&&(!selBU||w.bu===selBU);
  });

  // Aggregate per employee
  var empData={};
  monthWIs.forEach(function(w){
    var labData=w.labour_data?JSON.parse(w.labour_data):[];
    var stData=w.standing_data?JSON.parse(w.standing_data):[];
    labData.forEach(function(e){
      if(!e.emp)return;
      if(!empData[e.emp])empData[e.emp]={emp:e.emp,prodHrs:0,standHrs:0,bu:''};
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      empData[e.emp].prodHrs+=hrs;
      // Get BU from lrates
      for(var i=0;i<lrates.length;i++){if(lrates[i].emp_name===e.emp){empData[e.emp].bu=lrates[i].bu;break;}}
    });
    stData.forEach(function(e){
      if(!e.emp)return;
      if(!empData[e.emp])empData[e.emp]={emp:e.emp,prodHrs:0,standHrs:0,bu:''};
      var hrs=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);
      empData[e.emp].standHrs+=hrs;
    });
  });

  var emps=Object.values(empData);
  if(selBU)emps=emps.filter(function(e){return e.bu===selBU;});

  // Sort by efficiency ascending (worst first)
  emps.sort(function(a,b){return (a.prodHrs/availHrsPerEmp)-(b.prodHrs/availHrsPerEmp);});

  // BU totals
  var buTotals={};
  emps.forEach(function(e){
    if(!buTotals[e.bu])buTotals[e.bu]={prodHrs:0,standHrs:0,count:0};
    buTotals[e.bu].prodHrs+=e.prodHrs;
    buTotals[e.bu].standHrs+=e.standHrs;
    buTotals[e.bu].count++;
  });

  var rnd1=function(n){return Math.round(n*10)/10;};
  emps.forEach(function(e){e.prodHrs=rnd1(e.prodHrs);e.standHrs=rnd1(e.standHrs);});
  Object.keys(buTotals).forEach(function(k){buTotals[k].prodHrs=rnd1(buTotals[k].prodHrs);buTotals[k].standHrs=rnd1(buTotals[k].standHrs);});
  var totalProd=rnd1(emps.reduce(function(s,e){return s+e.prodHrs;},0));
  var totalStand=rnd1(emps.reduce(function(s,e){return s+e.standHrs;},0));
  var totalAvail=emps.length*availHrsPerEmp;
  var overallEff=totalAvail>0?Math.round(totalProd/totalAvail*100):0;

  var monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];

  function effColor(pct){return pct>=80?'#276749':pct>=60?'#d97706':'#c53030';}
  function effBar(pct){
    var c=effColor(pct);
    var w=Math.min(pct,100);
    return '<div style="background:#f0f2f5;border-radius:4px;height:6px;width:100%;margin-top:3px"><div style="background:'+c+';width:'+w+'%;height:6px;border-radius:4px"></div></div>';
  }

  var empRows=emps.map(function(e){
    var avail=availHrsPerEmp;
    var unaccounted=Math.max(0,avail-e.prodHrs-e.standHrs);
    var eff=avail>0?Math.round(e.prodHrs/avail*100):0;
    var effC=effColor(eff);
    return '<tr>'
    +'<td style="padding:8px 12px;font-weight:500;border-bottom:1px solid #f0f2f5">'+e.emp+'</td>'
    +'<td style="padding:8px 12px;border-bottom:1px solid #f0f2f5"><span class="badge b-bu">'+e.bu+'</span></td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;border-bottom:1px solid #f0f2f5">'+avail+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:600;color:#276749;border-bottom:1px solid #f0f2f5">'+e.prodHrs+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;color:#c53030;border-bottom:1px solid #f0f2f5">'+e.standHrs+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;color:#718096;border-bottom:1px solid #f0f2f5">'+unaccounted+'</td>'
    +'<td style="padding:8px 12px;border-bottom:1px solid #f0f2f5;min-width:100px">'
    +'<div style="display:flex;align-items:center;gap:6px">'
    +'<span style="font-weight:700;font-family:monospace;color:'+effC+'">'+eff+'%</span>'
    +effBar(eff)
    +'</div></td>'
    +'</tr>';
  }).join('');

  // BU summary rows
  var buRows=Object.keys(buTotals).map(function(bu){
    var bt=buTotals[bu];
    var avail=bt.count*availHrsPerEmp;
    var eff=avail>0?Math.round(bt.prodHrs/avail*100):0;
    var unaccounted=Math.max(0,avail-bt.prodHrs-bt.standHrs);
    return '<tr style="background:#f8fafc">'
    +'<td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #e2e8f0" colspan="2"><span class="badge b-bu">'+bu+'</span> Total ('+bt.count+' employees)</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;border-bottom:1px solid #e2e8f0">'+avail+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#276749;border-bottom:1px solid #e2e8f0">'+bt.prodHrs+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#c53030;border-bottom:1px solid #e2e8f0">'+bt.standHrs+'</td>'
    +'<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#718096;border-bottom:1px solid #e2e8f0">'+unaccounted+'</td>'
    +'<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:'+effColor(eff)+'">'+eff+'%</td>'
    +'</tr>';
  }).join('');

  var content='<div class="card" style="margin-top:14px">'
  // Header
  +'<div class="card-hd" style="background:var(--navy)">'
  +'<h3 style="color:#fff">👷 Labour Efficiency Report — '+monthNames[selMonth]+' '+selYear+'</h3>'
  +'<div class="card-hd-r">'
  +'<select id="rptBU" onchange="refreshLabourReport()" style="font-size:12px;padding:5px 9px;border:1px solid rgba(255,255,255,.2);border-radius:var(--r);background:rgba(255,255,255,.1);color:#fff"><option value="">All BUs</option>'+BUS.map(function(b){return '<option value="'+b+'"'+(selBU===b?' selected':'')+'>'+b+'</option>';}).join('')+'</select>'
  +'<select id="rptMonth" onchange="refreshLabourReport()" style="font-size:12px;padding:5px 9px;border:1px solid rgba(255,255,255,.2);border-radius:var(--r);background:rgba(255,255,255,.1);color:#fff">'+monthNames.map(function(m,i){return '<option value="'+i+'"'+(i===selMonth?' selected':'')+'>'+m+'</option>';}).join('')+'</select>'
  +'<select id="rptYear" onchange="refreshLabourReport()" style="font-size:12px;padding:5px 9px;border:1px solid rgba(255,255,255,.2);border-radius:var(--r);background:rgba(255,255,255,.1);color:#fff">'
  +[2024,2025,2026,2027].map(function(y){return '<option value="'+y+'"'+(y===selYear?' selected':'')+'>'+y+'</option>';}).join('')
  +'</select>'
  +'<button class="btn btn-sm" id="setHrsBtn" style="background:var(--gold);color:var(--navy);border-color:var(--gold);font-weight:600">&#9881; Set available hours</button>'
  +'</div></div>'
  // KPI tiles
  +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px;background:#f8fafc;border-bottom:1px solid var(--border)">'
  +'<div style="background:#fff;border:1px solid '+(isOverride?'#c8a45a':'var(--border)')+';border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;margin-bottom:4px">Available hrs '+(isCurrentMonth?'to date':'/ employee')+'</div><div style="font-size:22px;font-weight:700;font-family:monospace">'+availHrsPerEmp+'</div><div style="font-size:10px;color:'+(isOverride?'#92400e':'#718096')+'">'+workDaysToDate+' of '+workDaysFull+' days'+(isOverride?' &middot; &#9881; pro-rated':'')+'</div></div>'
  +'<div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;margin-bottom:4px">Employees tracked</div><div style="font-size:22px;font-weight:700;font-family:monospace">'+emps.length+'</div><div style="font-size:10px;color:#718096">From WI entries</div></div>'
  +'<div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;margin-bottom:4px">Total productive hrs</div><div style="font-size:22px;font-weight:700;font-family:monospace;color:#276749">'+totalProd+'</div><div style="font-size:10px;color:#718096">of '+totalAvail+' available</div></div>'
  +'<div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;margin-bottom:4px">Overall efficiency</div><div style="font-size:22px;font-weight:700;font-family:monospace;color:'+effColor(overallEff)+'">'+overallEff+'%</div><div style="font-size:10px;color:#718096;margin-top:3px">'+effBar(overallEff)+'</div></div>'
  +'</div>'
  // Standing time alert
  +(totalStand>0?'<div style="background:#fff5f5;border-bottom:1px solid #fed7d7;padding:10px 14px;font-size:12px;color:#c53030;font-weight:500">⚠ '+totalStand+' standing time hours recorded this month — review reasons with HODs</div>':'')
  // Table
  +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
  +'<thead><tr style="background:#fafbfc">'
  +'<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Employee</th>'
  +'<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">BU</th>'
  +'<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Available Hrs'+(isCurrentMonth?' to date':'')+'</th>'
  +'<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#276749;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Productive Hrs</th>'
  +'<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#c53030;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Standing Hrs</th>'
  +'<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Unaccounted Hrs</th>'
  +'<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border)">Efficiency %</th>'
  +'</tr></thead>'
  +'<tbody>'+empRows+'</tbody>'
  +(emps.length>0?'<tfoot>'+buRows+'<tr style="background:var(--navy)"><td style="padding:10px 12px;font-weight:700;color:#fff" colspan="2">GRAND TOTAL</td><td style="padding:10px 12px;text-align:center;font-family:monospace;font-weight:700;color:#fff">'+totalAvail+'</td><td style="padding:10px 12px;text-align:center;font-family:monospace;font-weight:700;color:#a8f0c6">'+totalProd+'</td><td style="padding:10px 12px;text-align:center;font-family:monospace;font-weight:700;color:#fca5a5">'+totalStand+'</td><td style="padding:10px 12px;text-align:center;font-family:monospace;font-weight:700;color:#fde68a">'+Math.max(0,totalAvail-totalProd-totalStand)+'</td><td style="padding:10px 12px;font-weight:700;color:'+(overallEff>=80?'#a8f0c6':overallEff>=60?'#fde68a':'#fca5a5')+'">'+overallEff+'%</td></tr></tfoot>':'')
  +'</table></div>'
  +(emps.length===0?'<div class="empty">No WI labour data found for '+monthNames[selMonth]+' '+selYear+(selBU?' — '+selBU:'')+'</div>':'')
  +'</div>';

  var rc=document.getElementById('reportContent');
  if(rc)rc.innerHTML=content;
}

function refreshLabourReport(){
  rLabourReport();
}

function oSetHours(){
  var now=new Date();
  var selMonth=document.getElementById('rptMonth')?+document.getElementById('rptMonth').value:now.getMonth();
  var selYear=document.getElementById('rptYear')?+document.getElementById('rptYear').value:now.getFullYear();
  var monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Auto calc
  var daysInMonth=new Date(selYear,selMonth+1,0).getDate();
  var workDays=0;
  for(var d=1;d<=daysInMonth;d++){
    var day=new Date(selYear,selMonth,d).getDay();
    if(day>=1&&day<=6)workDays++;
  }
  var autoHrs=workDays*8;

  var existing=null,existingId=null;
  for(var mi=0;mi<msettings.length;mi++){
    if(+msettings[mi].month===selMonth&&+msettings[mi].year===selYear){existing=msettings[mi];existingId=msettings[mi].id;break;}
  }
  var curHrs=existing&&+existing.available_hrs>0?+existing.available_hrs:autoHrs;

  openM('<div class="mtitle">&#9881; Set Available Hours — '+monthNames[selMonth]+' '+selYear+'</div>'
  +'<div style="background:#f4f6f9;border-radius:8px;padding:11px 13px;margin-bottom:13px;font-size:11px;color:#718096;line-height:1.7">'
  +'<strong style="color:var(--navy)">Auto-calculated:</strong> '+workDays+' working days (Mon\u2013Sat) &times; 8 hrs = <strong style="color:var(--navy)">'+autoHrs+' hrs</strong> for the full month<br>'
  +'Adjust below to account for public holidays, shutdowns or short weeks. The report pro-rates this figure by working days elapsed.'
  +'</div>'
  +'<div class="mfr"><label>Available hours per employee &mdash; full month</label><input type="number" id="shHrs" value="'+curHrs+'" min="0"></div>'
  +'<div class="mfr"><label>Note (optional)</label><input id="shNote" value="'+(existing&&existing.note?existing.note:'')+'" placeholder="e.g. 2 public holidays, 1 week shutdown"></div>'
  +'<div class="mfoot">'
  +(existingId?'<button class="btn btn-del" id="resetHrs">Reset to auto</button>':'')
  +'<button class="btn" id="cancelSH">Cancel</button><button class="btn btn-p" id="saveSH">Save hours</button></div>');

  document.getElementById('cancelSH').addEventListener('click',closeM);

  if(existingId){
    document.getElementById('resetHrs').addEventListener('click',function(){
      dbDel('month_settings','id=eq.'+existingId).then(function(){return loadAll();}).then(function(){
        closeM();go('reports');setTimeout(rLabourReport,100);toast('Reset to auto-calculated hours','s');
      }).catch(function(e){toast(e.message,'e');});
    });
  }

  document.getElementById('saveSH').addEventListener('click',function(){
    var hrs=+gv('shHrs')||0;
    if(hrs<=0){toast('Please enter a valid number of hours','e');return;}
    var data={month:selMonth,year:selYear,available_hrs:hrs,note:gv('shNote')};
    var p=existingId?dbPatch('month_settings','id=eq.'+existingId,data):dbPost('month_settings',data);
    p.then(function(){return loadAll();}).then(function(){
      closeM();go('reports');setTimeout(rLabourReport,100);toast('Available hours saved','s');
    }).catch(function(e){toast(e.message,'e');});
  });
}

// ── PLANNER ──────────────────────────────────────────────────────────────────
var BU_COLOURS={'Fabrication':'#2E5FA3','Construction':'#C87A2E','Pumps':'#276749','TMM':'#9B2C2C','Motors':'#6B46C1','Wear Protection':'#B7791F','Mining Supplies':'#2C7A7B','Laser Cutting':'#4A5568','Draughting':'#805AD5'};
function buColour(bu){return BU_COLOURS[bu]||'#718096';}

function pDate(s){if(!s)return null;var p=String(s).split('-');if(p.length!==3)return null;return new Date(+p[0],+p[1]-1,+p[2]);}
function pISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function pAdd(d,n){var x=new Date(d.getTime());x.setDate(x.getDate()+n);return x;}
function pDiff(a,b){return Math.round((b-a)/86400000);}
function pMonday(d){var x=new Date(d.getTime());var g=x.getDay();var diff=g===0?-6:1-g;x.setDate(x.getDate()+diff);return x;}

function plannerOrder(ref){for(var i=0;i<orders.length;i++){if(orders[i].ref===ref)return orders[i];}return null;}

function plannerAutoPct(ref){
  var jobWIs=wis.filter(function(w){return w.job_ref===ref;});
  if(!jobWIs.length)return 0;
  var est=0,act=0;
  jobWIs.forEach(function(w){
    est+=(+w.est_hrs||0);
    var ld=w.labour_data?JSON.parse(w.labour_data):[];
    ld.forEach(function(e){act+=(+e.mon||0)+(+e.tue||0)+(+e.wed||0)+(+e.thu||0)+(+e.fri||0)+(+e.sat||0);});
  });
  if(est<=0)return 0;
  return Math.min(100,Math.round(act/est*100));
}

function plannerPct(it){
  var ov=+it.progress_override;
  if(!isNaN(ov)&&ov>=0)return Math.min(100,ov);
  return plannerAutoPct(it.job_ref);
}

function rPlanner(){
  return '<div class="card"><div class="card-hd"><h3>Planner &mdash; job schedule</h3><div class="card-hd-r">'
  +'<button class="btn btn-sm" id="plWeekBtn" style="'+(plView==='week'?'background:var(--navy);color:#fff;border-color:var(--navy)':'')+'">Week view</button>'
  +'<button class="btn btn-sm" id="plMonthBtn" style="'+(plView==='month'?'background:var(--navy);color:#fff;border-color:var(--navy)':'')+'">Month view</button>'
  +'<button class="btn btn-p btn-sm" id="plAddBtn">+ Add job to planner</button>'
  +'</div></div>'
  +'<div id="plBody"></div></div>';
}

function renderPlanner(){
  var host=document.getElementById('plBody');
  if(!host)return;
  var items=planr.slice();
  if(cUser&&cUser.role==='HOD'){
    items=items.filter(function(it){var o=plannerOrder(it.job_ref);return o&&(o.bu===cUser.bu||(cUser.bu2&&o.bu===cUser.bu2));});
  }
  if(!items.length){host.innerHTML='<div class="empty">No jobs on the planner yet &mdash; click <strong>+ Add job to planner</strong> to start scheduling.</div>';return;}

  var today=new Date();today.setHours(0,0,0,0);

  // Determine date range
  var minD=null,maxD=null;
  items.forEach(function(it){
    var s=pDate(it.start_date),f=pDate(it.finish_date);
    if(s&&(!minD||s<minD))minD=s;
    if(f&&(!maxD||f>maxD))maxD=f;
    if(s&&(!maxD||s>maxD))maxD=s;
  });
  if(!minD)minD=pAdd(today,-3);
  if(!maxD)maxD=pAdd(today,21);
  if(today<minD)minD=today;
  if(today>maxD)maxD=today;
  minD=pAdd(minD,-2);maxD=pAdd(maxD,4);

  var ROW=36,LEFTW=560;
  var cols=[],colW;
  if(plView==='week'){
    colW=30;
    var c=new Date(minD.getTime());
    while(c<=maxD){cols.push(new Date(c.getTime()));c=pAdd(c,1);}
  }else{
    colW=44;
    var w=pMonday(minD);
    while(w<=maxD){cols.push(new Date(w.getTime()));w=pAdd(w,7);}
  }
  var totalW=cols.length*colW;

  function colIndexFor(d){
    if(plView==='week')return pDiff(minD,d);
    return Math.floor(pDiff(pMonday(minD),d)/7);
  }

  // ── Timeline header ──
  var monthBar='',dayBar='';
  var mGroups=[];
  cols.forEach(function(d,i){
    var key=d.getFullYear()+'-'+d.getMonth();
    if(!mGroups.length||mGroups[mGroups.length-1].key!==key)mGroups.push({key:key,label:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear(),n:1});
    else mGroups[mGroups.length-1].n++;
  });
  mGroups.forEach(function(g){
    monthBar+='<div style="width:'+(g.n*colW)+'px;flex-shrink:0;border-right:1px solid var(--border);font-size:10px;font-weight:700;color:var(--navy);padding:3px 6px;white-space:nowrap;overflow:hidden;background:#fafbfc">'+g.label+'</div>';
  });
  cols.forEach(function(d){
    var isWknd=plView==='week'&&(d.getDay()===0);
    var isToday=plView==='week'&&d.getTime()===today.getTime();
    var lbl=plView==='week'?d.getDate():d.getDate()+'/'+(d.getMonth()+1);
    dayBar+='<div style="width:'+colW+'px;flex-shrink:0;border-right:1px solid #eef1f5;text-align:center;font-size:9px;padding:4px 0;'
    +(isToday?'background:#fffbeb;font-weight:700;color:#92400e;':isWknd?'background:#f7fafc;color:#a0aec0;':'color:#718096;')+'">'+lbl+'</div>';
  });

  // ── Rows ──
  var leftRows='',ganttRows='';
  items.forEach(function(it,idx){
    var o=plannerOrder(it.job_ref);
    var bu=o?o.bu:'';
    var client=o?o.client:(it.job_ref==='NO_ORDER'?'—':'');
    var col=buColour(bu);
    var s=pDate(it.start_date),f=pDate(it.finish_date);
    var days=(s&&f)?pDiff(s,f)+1:0;
    var pct=plannerPct(it);
    var late=f&&f<today&&pct<100;
    var zebra=idx%2?'background:#fbfcfd;':'';

    leftRows+='<div style="display:flex;align-items:center;height:'+ROW+'px;border-bottom:1px solid #f0f2f5;'+zebra+'">'
    +'<div style="width:52px;flex-shrink:0;text-align:center;display:flex;gap:1px;justify-content:center">'
    +'<button class="btn-g" style="padding:0 3px;font-size:11px;line-height:1" data-id="'+it.id+'" data-action="plUp" title="Move up">&#9650;</button>'
    +'<button class="btn-g" style="padding:0 3px;font-size:11px;line-height:1" data-id="'+it.id+'" data-action="plDown" title="Move down">&#9660;</button>'
    +'</div>'
    +'<div style="width:86px;flex-shrink:0;font-family:monospace;font-size:11px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+it.job_ref+'</div>'
    +'<div style="width:118px;flex-shrink:0;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px" title="'+client+'">'+client+'</div>'
    +'<div style="width:96px;flex-shrink:0"><span style="background:'+col+';color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">'+(bu||'—')+'</span></div>'
    +'<div style="width:104px;flex-shrink:0;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px" title="'+(it.assigned_to||'')+'">'+(it.assigned_to||'<span style="color:#cbd5e0">Unassigned</span>')+'</div>'
    +'<div style="width:40px;flex-shrink:0;text-align:center;font-family:monospace;font-size:11px">'+(days||'—')+'</div>'
    +'<div style="width:44px;flex-shrink:0;text-align:center;font-family:monospace;font-size:11px;font-weight:700;color:'+(pct>=100?'#276749':pct>=50?'#d97706':'#718096')+'">'+pct+'%</div>'
    +'<div style="width:52px;flex-shrink:0;text-align:center;white-space:nowrap">'
    +'<button class="btn-g" style="padding:2px 3px" data-id="'+it.id+'" data-action="plEdit">&#9998;</button>'
    +'<button class="btn-d" style="padding:2px 3px" data-id="'+it.id+'" data-action="plDel">&#10005;</button>'
    +'</div></div>';

    var bar='';
    if(s&&f){
      var si=colIndexFor(s),ei=colIndexFor(f);
      var left,width;
      if(plView==='week'){left=si*colW;width=Math.max(colW,(ei-si+1)*colW);}
      else{left=si*colW;width=Math.max(colW,(ei-si+1)*colW);}
      bar='<div style="position:absolute;left:'+left+'px;top:7px;width:'+width+'px;height:22px;background:'+col+'22;border:1.5px solid '+(late?'#c53030':col)+';border-radius:5px;overflow:hidden" title="'+it.job_ref+' — '+days+' days — '+pct+'%">'
      +'<div style="width:'+pct+'%;height:100%;background:'+col+';opacity:.85"></div>'
      +'<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 6px;font-size:9px;font-weight:700;color:'+(pct>45?'#fff':'#2d3748')+';white-space:nowrap;overflow:hidden">'+(it.assigned_to||it.job_ref)+'</div>'
      +'</div>';
    }
    ganttRows+='<div style="position:relative;height:'+ROW+'px;border-bottom:1px solid #f0f2f5;'+zebra+'">'+bar+'</div>';
  });

  // Today marker
  var todayLine='';
  if(today>=minD&&today<=maxD){
    var tl=plView==='week'?colIndexFor(today)*colW+colW/2:colIndexFor(today)*colW+(pDiff(pMonday(today),today)/7)*colW;
    todayLine='<div style="position:absolute;left:'+tl+'px;top:0;bottom:0;width:2px;background:#e53e3e;z-index:3;pointer-events:none"></div>';
  }

  // ── Capacity strip ──
  var busInUse=[];
  items.forEach(function(it){var o=plannerOrder(it.job_ref);if(o&&o.bu&&busInUse.indexOf(o.bu)<0)busInUse.push(o.bu);});
  var capLeft='',capRight='';
  busInUse.forEach(function(bu){
    capLeft+='<div style="display:flex;align-items:center;height:26px;border-bottom:1px solid #f0f2f5;padding-left:10px"><span style="background:'+buColour(bu)+';color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px">'+bu+'</span></div>';
    var cells='';
    cols.forEach(function(d){
      var n=0;
      items.forEach(function(it){
        var o=plannerOrder(it.job_ref);
        if(!o||o.bu!==bu)return;
        var s=pDate(it.start_date),f=pDate(it.finish_date);
        if(!s||!f)return;
        if(plView==='week'){if(d>=s&&d<=f)n++;}
        else{var we=pAdd(d,6);if(s<=we&&f>=d)n++;}
      });
      var bg=n===0?'transparent':n===1?buColour(bu)+'33':n===2?buColour(bu)+'77':buColour(bu);
      cells+='<div style="width:'+colW+'px;flex-shrink:0;border-right:1px solid #f4f6f9;height:26px;display:flex;align-items:center;justify-content:center;background:'+bg+';font-size:9px;font-weight:700;color:'+(n>2?'#fff':'#4a5568')+'">'+(n||'')+'</div>';
    });
    capRight+='<div style="display:flex;height:26px;border-bottom:1px solid #f0f2f5">'+cells+'</div>';
  });

  host.innerHTML=
  '<div style="display:flex;align-items:center;gap:14px;padding:9px 14px;background:#fcfcfd;border-bottom:1px solid var(--border);font-size:11px;color:#718096;flex-wrap:wrap">'
  +'<span><span style="display:inline-block;width:20px;height:8px;background:#2E5FA3;border-radius:2px;vertical-align:middle"></span> Bar fill = % complete</span>'
  +'<span><span style="display:inline-block;width:2px;height:12px;background:#e53e3e;vertical-align:middle"></span> Today</span>'
  +'<span><span style="display:inline-block;width:12px;height:10px;border:1.5px solid #c53030;border-radius:2px;vertical-align:middle"></span> Overdue</span>'
  +'<span style="margin-left:auto">'+items.length+' job'+(items.length!==1?'s':'')+' scheduled</span>'
  +'</div>'
  +'<div style="overflow-y:auto;max-height:560px">'
  +'<div style="display:flex;min-width:100%">'
  // LEFT
  +'<div style="width:'+LEFTW+'px;flex-shrink:0;border-right:2px solid var(--border);background:#fff;position:sticky;left:0;z-index:2">'
  +'<div style="height:22px;background:#fafbfc;border-bottom:1px solid var(--border)"></div>'
  +'<div style="display:flex;align-items:center;height:'+ROW+'px;background:#fafbfc;border-bottom:2px solid var(--border);font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.05em">'
  +'<div style="width:52px;flex-shrink:0;text-align:center">Seq</div>'
  +'<div style="width:86px;flex-shrink:0">Job #</div>'
  +'<div style="width:118px;flex-shrink:0">Client</div>'
  +'<div style="width:96px;flex-shrink:0">BU</div>'
  +'<div style="width:104px;flex-shrink:0">Assigned</div>'
  +'<div style="width:40px;flex-shrink:0;text-align:center">Days</div>'
  +'<div style="width:44px;flex-shrink:0;text-align:center">%</div>'
  +'<div style="width:52px;flex-shrink:0;text-align:center">Edit</div>'
  +'</div>'
  +leftRows
  +(busInUse.length?'<div style="height:28px;display:flex;align-items:center;padding-left:10px;background:#f4f6f9;border-top:2px solid var(--border);border-bottom:1px solid var(--border);font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;letter-spacing:.05em">BU load</div>'+capLeft:'')
  +'</div>'
  // RIGHT
  +'<div style="flex:1;overflow-x:auto" id="plScroll">'
  +'<div style="width:'+totalW+'px;position:relative">'
  +todayLine
  +'<div style="display:flex;height:22px;border-bottom:1px solid var(--border)">'+monthBar+'</div>'
  +'<div style="display:flex;height:'+ROW+'px;background:#fafbfc;border-bottom:2px solid var(--border);align-items:center">'+dayBar+'</div>'
  +ganttRows
  +(busInUse.length?'<div style="height:28px;background:#f4f6f9;border-top:2px solid var(--border);border-bottom:1px solid var(--border)"></div>'+capRight:'')
  +'</div></div>'
  +'</div></div>';
}

function oPlannerAdd(){
  var onPlanner=planr.map(function(p){return p.job_ref;});
  var avail=orders.filter(function(o){return !o.invoiced&&o.status!=='Completed'&&onPlanner.indexOf(o.ref)<0;});
  if(cUser&&cUser.role==='HOD')avail=avail.filter(function(o){return o.bu===cUser.bu||(cUser.bu2&&o.bu===cUser.bu2);});
  if(!avail.length){toast('No unscheduled open jobs available','i');return;}
  var opts=avail.map(function(o){return '<option value="'+o.ref+'">'+o.ref+' — '+o.client+' ('+o.bu+')</option>';}).join('');
  var empList=lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'">';}).join('');

  openM('<div class="mtitle">Add job to planner</div>'
  +'<div class="mfr"><label>Job (MM Number)</label><select id="plJob">'+opts+'</select></div>'
  +'<div class="mfr"><label>Assign to</label><input id="plAssign" list="plEmpList" placeholder="Name of person responsible"><datalist id="plEmpList">'+empList+'</datalist></div>'
  +'<div class="f2"><div class="mfr"><label>Start date</label><input type="date" id="plStart" value="'+td()+'" oninput="plCalcDays()"></div><div class="mfr"><label>Finish date</label><input type="date" id="plFinish" oninput="plCalcDays()"></div></div>'
  +'<div style="background:#f4f6f9;border-radius:6px;padding:9px 12px;font-size:11px;color:#718096;margin-bottom:11px">Duration: <strong id="plDays" style="color:var(--navy)">—</strong></div>'
  +'<div class="mfr"><label>Notes</label><input id="plNotes" placeholder="Optional"></div>'
  +'<div class="mfoot"><button class="btn" id="plCancel">Cancel</button><button class="btn btn-p" id="plSave">Add to planner</button></div>');

  document.getElementById('plCancel').addEventListener('click',closeM);
  document.getElementById('plSave').addEventListener('click',function(){
    var s=gv('plStart'),f=gv('plFinish');
    if(!s||!f){toast('Please set both start and finish dates','e');return;}
    if(pDate(f)<pDate(s)){toast('Finish date cannot be before start date','e');return;}
    var maxSeq=planr.reduce(function(m,p){return Math.max(m,+p.seq||0);},0);
    dbPost('planner_items',{job_ref:gv('plJob'),assigned_to:gv('plAssign'),start_date:fmtD(s),finish_date:fmtD(f),progress_override:-1,seq:maxSeq+1,notes:gv('plNotes')})
    .then(function(){closeM();return loadAll();}).then(function(){go('planner');setTimeout(renderPlanner,60);toast('Added to planner','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function plCalcDays(){
  var s=pDate(gv('plStart')),f=pDate(gv('plFinish'));
  var el=document.getElementById('plDays');
  if(!el)return;
  if(s&&f&&f>=s){var d=pDiff(s,f)+1;el.textContent=d+' day'+(d!==1?'s':'');}
  else el.textContent='—';
}

function oPlannerEdit(id){
  var it=null;for(var i=0;i<planr.length;i++){if(planr[i].id===id){it=planr[i];break;}}
  if(!it)return;
  var o=plannerOrder(it.job_ref);
  var autoP=plannerAutoPct(it.job_ref);
  var ov=+it.progress_override;
  var hasOv=!isNaN(ov)&&ov>=0;
  var empList=lrates.filter(function(r){return r.active;}).map(function(r){return '<option value="'+r.emp_name+'">';}).join('');

  openM('<div class="mtitle">Edit planner entry — '+it.job_ref+'</div>'
  +'<div style="background:#f4f6f9;border-radius:6px;padding:9px 12px;font-size:11px;color:#718096;margin-bottom:13px">'+(o?o.client+' &nbsp;|&nbsp; '+o.bu+' &nbsp;|&nbsp; '+R(+o.order_val||0):'Order not found')+'</div>'
  +'<div class="mfr"><label>Assign to</label><input id="plAssign" list="plEmpList2" value="'+(it.assigned_to||'')+'"><datalist id="plEmpList2">'+empList+'</datalist></div>'
  +'<div class="f2"><div class="mfr"><label>Start date</label><input type="date" id="plStart" value="'+(it.start_date||'')+'" oninput="plCalcDays()"></div><div class="mfr"><label>Finish date</label><input type="date" id="plFinish" value="'+(it.finish_date||'')+'" oninput="plCalcDays()"></div></div>'
  +'<div style="background:#f4f6f9;border-radius:6px;padding:9px 12px;font-size:11px;color:#718096;margin-bottom:11px">Duration: <strong id="plDays" style="color:var(--navy)">—</strong></div>'
  +'<div class="mfr"><label>Progress</label><select id="plPMode" onchange="plToggleP()"><option value="auto"'+(hasOv?'':' selected')+'>Auto from WI hours ('+autoP+'%)</option><option value="man"'+(hasOv?' selected':'')+'>Set manually</option></select></div>'
  +'<div class="mfr" id="plPManBox" style="display:'+(hasOv?'block':'none')+'"><label>Progress %</label><input type="number" id="plPct" value="'+(hasOv?ov:autoP)+'" min="0" max="100"></div>'
  +'<div class="mfr"><label>Notes</label><input id="plNotes" value="'+(it.notes||'')+'"></div>'
  +'<div class="mfoot"><button class="btn" id="plCancel">Cancel</button><button class="btn btn-p" id="plSave">Update</button></div>');

  setTimeout(plCalcDays,40);
  document.getElementById('plCancel').addEventListener('click',closeM);
  document.getElementById('plSave').addEventListener('click',function(){
    var s=gv('plStart'),f=gv('plFinish');
    if(!s||!f){toast('Please set both dates','e');return;}
    if(pDate(f)<pDate(s)){toast('Finish date cannot be before start date','e');return;}
    var pov=gv('plPMode')==='man'?(+gv('plPct')||0):-1;
    dbPatch('planner_items','id=eq.'+id,{assigned_to:gv('plAssign'),start_date:fmtD(s),finish_date:fmtD(f),progress_override:pov,notes:gv('plNotes')})
    .then(function(){closeM();return loadAll();}).then(function(){go('planner');setTimeout(renderPlanner,60);toast('Planner updated','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function plToggleP(){
  var b=document.getElementById('plPManBox');
  if(b)b.style.display=gv('plPMode')==='man'?'block':'none';
}

function plannerMove(id,dir){
  var idx=-1;
  for(var i=0;i<planr.length;i++){if(planr[i].id===id){idx=i;break;}}
  if(idx<0)return;
  var swap=dir==='up'?idx-1:idx+1;
  if(swap<0||swap>=planr.length)return;
  var a=planr[idx],b=planr[swap];
  var sa=+a.seq||0,sb=+b.seq||0;
  if(sa===sb){sa=idx;sb=swap;}
  Promise.all([
    dbPatch('planner_items','id=eq.'+a.id,{seq:sb}),
    dbPatch('planner_items','id=eq.'+b.id,{seq:sa})
  ]).then(function(){return loadAll();}).then(function(){go('planner');setTimeout(renderPlanner,60);}).catch(function(e){toast(e.message,'e');});
}

// ── DRAWINGS ─────────────────────────────────────────────────────────────────
var DRW_STATUS=['Not started','In progress','Internal check','Issued to client','Approved','Superseded'];
var DRW_SB={'Not started':'background:#f7fafc;color:#4a5568;border-color:#e2e8f0','In progress':'background:#ebf4ff;color:#1e3a5f;border-color:#bee3f8','Internal check':'background:#faf5ff;color:#44337a;border-color:#d6bcfa','Issued to client':'background:#fffbeb;color:#92400e;border-color:#fcd34d','Approved':'background:#f0fff4;color:#276749;border-color:#c6f6d5','Superseded':'background:#f7fafc;color:#a0aec0;border-color:#e2e8f0'};
function drwBadge(s){return '<span class="badge" style="'+(DRW_SB[s]||DRW_SB['Not started'])+'">'+s+'</span>';}

function drwAge(d){if(!d)return 0;var a=pDate(d);if(!a)return 0;var t=new Date();t.setHours(0,0,0,0);return Math.max(0,Math.round((t-a)/86400000));}

// Drawing gate status for a job: none | pending | approved
function jobDrwStatus(ref){
  var jd=drws.filter(function(d){return d.job_ref===ref&&d.status!=='Superseded';});
  if(!jd.length)return {state:'none',total:0,approved:0,oldest:0};
  var appr=jd.filter(function(d){return d.status==='Approved';}).length;
  var oldest=0;
  jd.forEach(function(d){if(d.status==='Issued to client'){var a=drwAge(d.issued_date);if(a>oldest)oldest=a;}});
  return {state:appr===jd.length?'approved':'pending',total:jd.length,approved:appr,oldest:oldest};
}

function jobDrwPill(ref){
  var s=jobDrwStatus(ref);
  if(s.state==='none')return '<span style="background:#f7fafc;color:#a0aec0;border:1px solid #e2e8f0;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:600;white-space:nowrap">No drawings</span>';
  if(s.state==='approved')return '<span style="background:#f0fff4;color:#276749;border:1px solid #c6f6d5;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700;white-space:nowrap">&#10003; Approved</span>';
  var col=s.oldest>=14?'background:#fff5f5;color:#9b1c1c;border-color:#fed7d7':'background:#fffbeb;color:#92400e;border-color:#fcd34d';
  return '<span style="'+col+';border-width:1px;border-style:solid;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700;white-space:nowrap" title="'+s.approved+' of '+s.total+' approved">'+s.approved+'/'+s.total+' appr'+(s.oldest>=7?' &middot; '+s.oldest+'d':'')+'</span>';
}

function autoDrwNo(jobRef){
  if(!jobRef)return '';
  var ex=drws.filter(function(d){return d.job_ref===jobRef;});
  return jobRef+'-'+String(ex.length+1).padStart(2,'0');
}

function rDrawings(){
  var active=drws.filter(function(d){return d.status!=='Superseded';});
  var inProg=active.filter(function(d){return d.status==='In progress'||d.status==='Internal check';}).length;
  var issued=active.filter(function(d){return d.status==='Issued to client';});
  var appr=active.filter(function(d){return d.status==='Approved';}).length;
  var overdue=issued.filter(function(d){return drwAge(d.issued_date)>=7;}).length;

  // Blocked jobs: open orders with drawings not all approved
  var blocked=orders.filter(function(o){
    if(o.invoiced||o.status==='Completed')return false;
    return jobDrwStatus(o.ref).state==='pending';
  });
  var blockedVal=blocked.reduce(function(s,o){return s+(+o.order_val||0);},0);

  // Workload per draughtsman
  var byPerson={};
  active.forEach(function(d){
    var p=d.draughtsman||'Unassigned';
    if(!byPerson[p])byPerson[p]={p:p,prog:0,chk:0,iss:0,appr:0,tot:0};
    byPerson[p].tot++;
    if(d.status==='In progress')byPerson[p].prog++;
    else if(d.status==='Internal check')byPerson[p].chk++;
    else if(d.status==='Issued to client')byPerson[p].iss++;
    else if(d.status==='Approved')byPerson[p].appr++;
  });
  var people=Object.keys(byPerson).map(function(k){return byPerson[k];});

  return '<div class="kpis">'
  +'<div class="kpi cn"><div class="kpi-l">Active drawings</div><div class="kpi-v">'+active.length+'</div></div>'
  +'<div class="kpi cb"><div class="kpi-l">On the board</div><div class="kpi-v">'+inProg+'</div><div class="kpi-s">In progress or checking</div></div>'
  +'<div class="kpi '+(overdue>0?'cr':'ca')+'"><div class="kpi-l">Awaiting client</div><div class="kpi-v">'+issued.length+'</div><div class="kpi-s">'+(overdue>0?overdue+' over 7 days':'All within 7 days')+'</div></div>'
  +'<div class="kpi cg"><div class="kpi-l">Approved</div><div class="kpi-v">'+appr+'</div></div>'
  +'<div class="kpi '+(blocked.length>0?'cr':'cg')+'"><div class="kpi-l">Jobs blocked</div><div class="kpi-v">'+blocked.length+'</div><div class="kpi-s">'+R(blockedVal)+' held up</div></div>'
  +'</div>'
  // Workload
  +(people.length?'<div class="card"><div class="card-hd"><h3>Draughtsman workload</h3></div><div class="tw"><table><thead><tr><th>Draughtsman</th><th style="text-align:center">In progress</th><th style="text-align:center">Internal check</th><th style="text-align:center">With client</th><th style="text-align:center">Approved</th><th style="text-align:center">Total</th></tr></thead><tbody>'
  +people.map(function(p){return '<tr><td style="font-weight:500">'+p.p+'</td><td style="text-align:center;font-family:monospace;color:#1e3a5f;font-weight:600">'+(p.prog||'—')+'</td><td style="text-align:center;font-family:monospace;color:#44337a">'+(p.chk||'—')+'</td><td style="text-align:center;font-family:monospace;color:#92400e">'+(p.iss||'—')+'</td><td style="text-align:center;font-family:monospace;color:#276749">'+(p.appr||'—')+'</td><td style="text-align:center;font-family:monospace;font-weight:700">'+p.tot+'</td></tr>';}).join('')
  +'</tbody></table></div></div>':'')
  // Blocked jobs alert
  +(blocked.length?'<div class="card"><div class="card-hd" style="background:#fff5f5;border-bottom:2px solid #fed7d7"><h3 style="color:#9b1c1c">&#9888; Jobs blocked &mdash; drawings not approved</h3></div><div class="tw"><table><thead><tr><th>Job #</th><th>Client</th><th>BU</th><th>Value</th><th>Due</th><th>Drawings</th></tr></thead><tbody>'
  +blocked.map(function(o){var s=jobDrwStatus(o.ref);return '<tr><td class="mono" style="font-weight:600">'+o.ref+'</td><td>'+o.client+'</td><td><span class="badge b-bu">'+o.bu+'</span></td><td class="mono">'+R(+o.order_val)+'</td><td class="mono" style="font-size:11px">'+fd(o.due)+'</td><td>'+jobDrwPill(o.ref)+'</td></tr>';}).join('')
  +'</tbody></table></div></div>':'')
  // Register
  +'<div class="card"><div class="card-hd"><h3>Drawing register</h3><div class="card-hd-r"><button class="btn btn-p btn-sm" id="addDrwBtn">+ New drawing</button></div></div>'
  +'<div class="toolbar"><input type="text" id="ds" placeholder="Search drawing no, title, job, draughtsman..."><select id="dst"><option value="">All statuses</option>'+DRW_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select><select id="ddm"><option value="">All draughtsmen</option>'+people.map(function(p){return '<option>'+p.p+'</option>';}).join('')+'</select></div>'
  +'<div class="tw tw-compact"><table><thead><tr><th style="width:96px">Drawing no</th><th>Title</th><th style="width:76px">Job / Lead</th><th style="width:96px">Draughtsman</th><th style="width:40px;text-align:center">Rev</th><th style="width:104px">Status</th><th style="width:64px">Issued</th><th style="width:54px;text-align:center">Age</th><th style="width:40px;text-align:center">Hrs</th><th style="width:54px">Actions</th></tr></thead><tbody id="dtb">'+rDrwRows()+'</tbody></table></div></div>';
}

function rDrwRows(){
  var s=document.getElementById('ds')?document.getElementById('ds').value.toLowerCase():'';
  var st=gv('dst'),dm=gv('ddm');
  var f=drws.filter(function(d){
    if(s&&((d.drw_no||'')+(d.title||'')+(d.job_ref||'')+(d.draughtsman||'')).toLowerCase().indexOf(s)<0)return false;
    if(st&&d.status!==st)return false;
    if(dm&&d.draughtsman!==dm)return false;
    return true;
  });
  if(!f.length)return '<tr><td colspan="10" class="empty">No drawings found</td></tr>';
  return f.map(function(d){
    var age=d.status==='Issued to client'?drwAge(d.issued_date):0;
    var ageCell=age===0?'<span style="color:#cbd5e0">—</span>':'<span style="font-family:monospace;font-weight:700;color:'+(age>=14?'#c53030':age>=7?'#d97706':'#276749')+'">'+age+'d</span>';
    var shortD=function(x){if(!x)return '—';var p=String(x).split('-');return p.length===3?p[2]+'/'+p[1]:x;};
    var jobCell=d.job_ref?'<span class="mono">'+d.job_ref+'</span>':(d.lead_ref?'<span class="mono" style="color:#805ad5" title="Quote stage">'+d.lead_ref+'</span>':'<span style="color:#cbd5e0">—</span>');
    return '<tr'+(d.status==='Superseded'?' style="opacity:.5"':'')+'>'
    +'<td class="mono" style="font-weight:600">'+(d.drw_no||'')+'</td>'
    +'<td title="'+(d.title||'')+'" style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(d.title||'—')+'</td>'
    +'<td>'+jobCell+'</td>'
    +'<td title="'+(d.draughtsman||'')+'" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(d.draughtsman||'—')+'</td>'
    +'<td style="text-align:center;font-family:monospace;font-weight:600">'+(d.revision||'0')+'</td>'
    +'<td>'+drwBadge(d.status||'Not started')+'</td>'
    +'<td class="mono">'+shortD(d.issued_date)+'</td>'
    +'<td style="text-align:center">'+ageCell+'</td>'
    +'<td style="text-align:center;font-family:monospace">'+(+d.hours||0)+'</td>'
    +'<td style="white-space:nowrap"><button class="btn-g" style="padding:2px 3px" data-id="'+d.id+'" data-action="editDrw">&#9998;</button><button class="btn-d" style="padding:2px 3px" data-id="'+d.id+'" data-action="delDrw">&#10005;</button></td>'
    +'</tr>';
  }).join('');
}

function oDrw(id){
  var d=id?(function(){for(var i=0;i<drws.length;i++){if(drws[i].id===id)return drws[i];}return null;})():null;
  var openOrds=orders.filter(function(o){return !o.invoiced;});
  var openLeads=leads.filter(function(l){return l.status==='Lead'||l.status==='Quoted';});
  var ordOpts=openOrds.map(function(o){return '<option value="'+o.ref+'"'+(d&&d.job_ref===o.ref?' selected':'')+'>'+o.ref+' — '+o.client+'</option>';}).join('');
  var leadOpts=openLeads.map(function(l){return '<option value="'+l.ref+'"'+(d&&d.lead_ref===l.ref?' selected':'')+'>'+l.ref+' — '+l.client+'</option>';}).join('');
  var isLead=d&&!d.job_ref&&d.lead_ref;
  var dmList=lrates.filter(function(r){return r.active&&r.bu==='Draughting';}).map(function(r){return '<option value="'+r.emp_name+'">';}).join('');

  openM('<div class="mtitle">'+(id?'Edit drawing':'New drawing')+'</div>'
  +'<div class="mfr"><label>Linked to</label><select id="dLinkType" onchange="drwToggleLink()"><option value="job"'+(isLead?'':' selected')+'>A job (MM number)</option><option value="lead"'+(isLead?' selected':'')+'>A quote / lead &mdash; no order yet</option></select></div>'
  +'<div class="mfr" id="dJobBox" style="display:'+(isLead?'none':'block')+'"><label>MM number</label><select id="dJob" onchange="drwAutoNo()"><option value="">Select job...</option>'+ordOpts+'</select></div>'
  +'<div class="mfr" id="dLeadBox" style="display:'+(isLead?'block':'none')+'"><label>Lead reference</label><select id="dLead"><option value="">Select lead...</option>'+leadOpts+'</select></div>'
  +'<div class="f2"><div class="mfr"><label>Drawing number</label><input id="dNo" value="'+(d?d.drw_no||'':'')+'"></div><div class="mfr"><label>Revision</label><input id="dRev" value="'+(d?d.revision||'0':'0')+'" placeholder="0, A, B..."></div></div>'
  +'<div class="mfr"><label>Drawing title</label><input id="dTitle" value="'+(d?(d.title||'').replace(/"/g,'&quot;'):'')+'"></div>'
  +'<div class="f2"><div class="mfr"><label>Draughtsman</label><input id="dDm" list="dDmList" value="'+(d?d.draughtsman||'':'')+'"><datalist id="dDmList">'+dmList+'</datalist></div><div class="mfr"><label>Hours spent</label><input type="number" id="dHrs" value="'+(d?+d.hours||0:0)+'" min="0"></div></div>'
  +'<div class="mfr"><label>Status</label><select id="dSt" onchange="drwToggleDates()">'+DRW_STATUS.map(function(s){return '<option'+(d&&d.status===s?' selected':(!d&&s==='Not started'?' selected':''))+'>'+s+'</option>';}).join('')+'</select></div>'
  +'<div class="f2" id="dDateBox"><div class="mfr"><label>Issued to client</label><input type="date" id="dIss" value="'+(d?d.issued_date||'':'')+'"></div><div class="mfr"><label>Approved date</label><input type="date" id="dAppr" value="'+(d?d.approved_date||'':'')+'"></div></div>'
  +'<div class="mfr"><label>Notes</label><input id="dNotes" value="'+(d?(d.notes||'').replace(/"/g,'&quot;'):'')+'"></div>'
  +'<div class="mfoot"><button class="btn" id="dCancel">Cancel</button><button class="btn btn-p" id="dSave">'+(id?'Update drawing':'Save drawing')+'</button></div>');

  setTimeout(drwToggleDates,40);
  document.getElementById('dCancel').addEventListener('click',closeM);
  document.getElementById('dSave').addEventListener('click',function(){
    var isL=gv('dLinkType')==='lead';
    var jobRef=isL?'':gv('dJob');
    var leadRef=isL?gv('dLead'):'';
    if(!jobRef&&!leadRef){toast('Please select a job or a lead','e');return;}
    if(!gv('dNo')){toast('Please enter a drawing number','e');return;}
    var st=gv('dSt');
    var iss=fmtD(gv('dIss')),appr=fmtD(gv('dAppr'));
    if(st==='Issued to client'&&!iss){toast('Please set the issued date','e');return;}
    if(st==='Approved'&&!appr){toast('Please set the approved date','e');return;}
    var data={drw_no:gv('dNo'),title:gv('dTitle'),job_ref:jobRef,lead_ref:leadRef,draughtsman:gv('dDm'),revision:gv('dRev'),status:st,issued_date:iss,approved_date:appr,hours:+gv('dHrs')||0,notes:gv('dNotes')};
    var p=id?dbPatch('drawings','id=eq.'+id,data):dbPost('drawings',data);
    p.then(function(){closeM();return loadAll();}).then(function(){go('drawings');toast('Drawing saved','s');}).catch(function(e){toast(e.message,'e');});
  });
}

function drwToggleLink(){
  var isL=gv('dLinkType')==='lead';
  var jb=document.getElementById('dJobBox'),lb=document.getElementById('dLeadBox');
  if(jb)jb.style.display=isL?'none':'block';
  if(lb)lb.style.display=isL?'block':'none';
}

function drwAutoNo(){
  var el=document.getElementById('dNo');
  if(el&&!el.value)el.value=autoDrwNo(gv('dJob'));
}

function drwToggleDates(){
  var st=gv('dSt');
  var box=document.getElementById('dDateBox');
  if(!box)return;
  box.style.display=(st==='Issued to client'||st==='Approved'||st==='Superseded')?'grid':'none';
  if(st==='Issued to client'){var i=document.getElementById('dIss');if(i&&!i.value)i.value=td();}
  if(st==='Approved'){var a=document.getElementById('dAppr');if(a&&!a.value)a.value=td();}
}

document.addEventListener('click',function(e){
  var tid=e.target.id;
  if(tid==='addLeadBtn'){oLead(null);return;}
  if(tid==='addOrderBtn'){oOrder(null);return;}
  if(tid==='addSubJobBtn'){oSubJob(null);return;}
  if(tid==='addSPOBtn'){oSPO(null);return;}

  if(tid==='expLeadsBtn'){expLeads();return;}
  if(tid==='expOrdersBtn'){expOrders();return;}
  if(tid==='expBuyerBtn'){expBuyer();return;}

  if(tid==='expFinBtn'){expFin();return;}
  if(tid==='refreshBtn'){loadAll().then(function(){go('dash');});return;}
  if(tid==='apiKeyBtn'){oAPIKey();return;}
  if(tid==='addLRBtn'){oLR(null);return;}
  if(tid==='rptLabourBtn'){rLabourReport();return;}
  if(tid==='setHrsBtn'){oSetHours();return;}
  if(tid==='addDrwBtn'){oDrw(null);return;}
  if(tid==='plAddBtn'){oPlannerAdd();return;}
  if(tid==='plWeekBtn'){plView='week';renderPlanner();document.getElementById('plWeekBtn').style.cssText='background:var(--navy);color:#fff;border-color:var(--navy)';document.getElementById('plMonthBtn').style.cssText='';return;}
  if(tid==='plMonthBtn'){plView='month';renderPlanner();document.getElementById('plMonthBtn').style.cssText='background:var(--navy);color:#fff;border-color:var(--navy)';document.getElementById('plWeekBtn').style.cssText='';return;}
  if(tid==='addWIBtn'){oWI(null);return;}
  if(tid==='addLRBtn'){oLR(null);return;}
  var el=e.target.closest('[data-action]');
  if(!el)return;
  var action=el.getAttribute('data-action');
  var id=el.getAttribute('data-id');
  if(action==='wonToOrder')wonToOrder(id);
  if(action==='showJobCost')showJobCost(id);
  if(action==='toFinance')toFinance(id);
  if(action==='editLead')oLead(id);
  if(action==='delLead')cfm('Delete lead','Permanently delete this lead?',function(){dbDel('leads','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('leads');toast('Deleted','s');});});
  if(action==='editOrder')oOrder(id);
  if(action==='delOrder')cfm('Delete order','Permanently delete this order?',function(){dbDel('orders','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('orders');toast('Deleted','s');});});
  if(action==='togSPO'){var p=null;for(var i=0;i<spos.length;i++){if(spos[i].id===id){p=spos[i];break;}}if(p)dbPatch('supplier_pos','id=eq.'+id,{received:!p.received}).then(function(){return loadAll();}).then(function(){go('buyer');toast('Updated','s');});}
  if(action==='editSPO'){
    var sp=null;for(var i=0;i<spos.length;i++){if(spos[i].id===id){sp=spos[i];break;}}
    if(sp)oSPOEditForm(id,sp);
    return;
  }
  if(action==='delSPO')cfm('Delete PO','Permanently delete?',function(){dbDel('supplier_pos','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('buyer');toast('Deleted','s');});});

  if(action==='editInv')oInv(id);
  if(action==='editLR')oLR(id);
  if(action==='delLR')cfm('Delete employee','Remove this employee?',function(){dbDel('labour_rates','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('lrates');toast('Deleted','s');});});
  if(action==='editDrw'){oDrw(id);return;}
  if(action==='delDrw'){cfm('Delete drawing','Permanently delete this drawing record?',function(){dbDel('drawings','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('drawings');toast('Deleted','s');});});return;}
  if(action==='plEdit'){oPlannerEdit(id);return;}
  if(action==='plDel'){cfm('Remove from planner','Remove this job from the planner? The job itself is not deleted.',function(){dbDel('planner_items','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('planner');setTimeout(renderPlanner,60);toast('Removed from planner','s');});});return;}
  if(action==='plUp'){plannerMove(id,'up');return;}
  if(action==='plDown'){plannerMove(id,'down');return;}
  if(action==='editWI')oWI(id);
  if(action==='printWI'){var pw=null;for(var i=0;i<wis.length;i++){if(wis[i].id===id){pw=wis[i];break;}}if(pw)printWI(pw);return;}
  if(action==='delWI')cfm('Delete WI','Permanently delete this work instruction?',function(){dbDel('work_instructions','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('wi');toast('Deleted','s');});});
  if(action==='editLR')oLR(id);
  if(action==='delLR')cfm('Delete employee','Remove this employee rate?',function(){dbDel('labour_rates','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('lrates');toast('Deleted','s');});});
  if(action==='delInv')cfm('Delete invoice','Permanently delete?',function(){dbDel('invoices','id=eq.'+id).then(function(){return loadAll();}).then(function(){go('fin');toast('Deleted','s');});});
  if(action==='addLead')oLead(null);
  if(action==='addOrder')oOrder(null);
  if(action==='addSPO')oSPO();

  if(action==='expLeads')expLeads();
  if(action==='expOrders')expOrders();
  if(action==='expBuyer')expBuyer();

  if(action==='expFin')expFin();
  if(action==='refresh')loadAll().then(function(){go('dash');});
});

document.addEventListener('change',function(e){
  var el=e.target;
  if(el.id==='ls'||el.id==='lbu'||el.id==='lst')fLeads();
  if(el.id==='os'||el.id==='obu'||el.id==='ost')fOrders();

  if(el.id==='bbu'||el.id==='bst'){var tb=document.getElementById('btb');if(tb)tb.innerHTML=rSPOrows();}
  if(el.id==='wibu'||el.id==='wist'){var wtb=document.getElementById('witb');if(wtb)wtb.innerHTML=rWIRows();}
  if(el.id==='dst'||el.id==='ddm'){var dtb=document.getElementById('dtb');if(dtb)dtb.innerHTML=rDrwRows();}
});
document.addEventListener('input',function(e){
  var el=e.target;
  if(el.id==='ls')fLeads();
  if(el.id==='os')fOrders();
  if(el.id==='js')fJCs();
  if(el.id==='bs'){var tb=document.getElementById('btb');if(tb)tb.innerHTML=rSPOrows();}
  if(el.id==='wis'){var wtb=document.getElementById('witb');if(wtb)wtb.innerHTML=rWIRows();}
  if(el.id==='ds'){var dtb=document.getElementById('dtb');if(dtb)dtb.innerHTML=rDrwRows();}
});

function getOpenOrders(){return orders.filter(function(o){return !o.invoiced&&o.status!=='Completed';});}
function autoJCRef(jobRef){if(!jobRef)return 'JC-001';var existing=jcs.filter(function(j){return j.job_ref===jobRef;});return jobRef+'-JC'+String(existing.length+1).padStart(2,'0');}

window.onload=function(){
  var s=null;try{s=sessionStorage.getItem('mm');}catch(e){}
  if(s){try{cUser=JSON.parse(s);launch();}catch(e){}}
};

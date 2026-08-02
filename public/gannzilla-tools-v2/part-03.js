nd(v)%count)+count)%count;return angle(slot,count,state.clockwise,0);}
function renderMarker(doc,prefix){
  var g=doc.getElementById('gannV2_'+prefix);clear(g);if(!state[prefix+'Visible'])return;
  var p=polar(radius(state[prefix+'Wheel']),markerAngle(state[prefix+'Value'])),shape=state[prefix+'Shape'],s=17;
  if(shape==='Circle')svg(doc,'circle',{cx:p.x,cy:p.y,r:s,'class':'gann-v2-marker'},g);
  else if(shape==='Triangle')svg(doc,'polygon',{points:p.x+','+(p.y-s)+' '+(p.x-s)+','+(p.y+s)+' '+(p.x+s)+','+(p.y+s),'class':'gann-v2-marker'},g);
  else svg(doc,'polygon',{points:p.x+','+(p.y-s)+' '+(p.x+s)+','+p.y+' '+p.x+','+(p.y+s)+' '+(p.x-s)+','+p.y,'class':'gann-v2-marker'},g);
}
function chronoDegrees(){
  if(state.chronoRange==='Manual')return num(state.chronoAngle,0);
  var d=new Date();
  if(state.chronoRange==='Annual'){var start=new Date(d.getFullYear(),0,1),end=new Date(d.getFullYear()+1,0,1);return 360*(d-start)/(end-start);}
  if(state.chronoRange==='Monthly'){var ms=new Date(d.getFullYear(),d.getMonth(),1),me=new Date(d.getFullYear(),d.getMonth()+1,1);return 360*(d-ms)/(me-ms);}
  if(state.chronoRange==='Weekly')return ((d.getDay()*86400+d.getHours()*3600+d.getMinutes()*60+d.getSeconds())/(7*86400))*360;
  if(state.chronoRange==='Daily')return ((d.getHours()*3600+d.getMinutes()*60+d.getSeconds())/86400)*360;
  if(state.chronoRange==='Hourly')return ((d.getMinutes()*60+d.getSeconds())/3600)*360;
  return ((d.getSeconds()*1000+d.getMilliseconds())/60000)*360;
}
function renderChrono(doc){
  var g=doc.getElementById('gannV2_chrono');clear(g);if(!state.chronoVisible)return;
  var deg=chronoDegrees(),a=-90+dir(state.chronoClockwise)*deg,p1=polar(INNER,a),p2=polar(OUTER,a);
  svg(doc,'line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,'class':'gann-v2-blue'},g);
  var p=polar(1250,a),t=svg(doc,'text',{x:p.x,y:p.y,'class':'gann-v2-label'},g);t.textContent=Math.round(deg)+'°';
}
function renderAll(){
  try{
    var doc=getDoc();
    if(!doc){setStatus('Waiting for wheel engine…','waiting');return false;}
    activeDoc=doc;installStyle(doc);ensureRoot(doc);
    renderLayout(doc);renderHighlight(doc);renderCounter(doc);renderScale(doc,'secondaryOne',false);renderMarker(doc,'markerOne');renderProtractor(doc);renderChrono(doc);renderScale(doc,'secondaryTwo',true);renderMarker(doc,'markerTwo');
    var count=doc.getElementById('gannV2_counter').children.length;
    setStatus('Connected • Wheel '+state.counterWheel+' • '+count+' numbers','ready');
    return count===(state.counterVisible?clamp(Math.round(state.counterCount),1,360):0);
  }catch(e){setStatus('Tools error: '+String(e&&e.message||e),'error');return false;}
}
function queue(){if(renderTimer)clearTimeout(renderTimer);renderTimer=setTimeout(renderAll,0);}
function centerWheel(){try{var d=getDoc(),w=frame.contentWindow;if(!d||!w)return;w.scrollTo(Math.max(0,(d.documentElement.scrollWidth-w.innerWidth)/2),Math.max(0,(d.documentElement.scrollHeight-w.innerHeight)/2));}catch(e){}}

function bind(el,key){
  if(!el||el.dataset.gannV2Bound)return;el.dataset.gannV2Bound='true';
  function apply(){
    var v=el.type==='checkbox'?el.checked:(el.tagName==='SELECT'?el.value:num(el.value,state[key]));
    if(key.indexOf('Wheel')>=0)v=clamp(Math.round(num(v,3)),1,13);
    if(key==='view'||key.indexOf('Divisions')>=0||key==='counterCount')v=clamp(Math.round(num(v,36)),1,360);
    if(key==='size')v=clamp(num(v,10),1,30);
    if(key==='counterFontSize')v=clamp(num(v,24),10,48);
    state[key]=v;
    if(key==='value'){state.counterStart=v;setValue(document.getElementById('counterStart'),v);}
    if(key==='increment'){state.counterIncrement=v;setValue(document.getElementById('counterIncrement'),v);}
    if(key==='find'){state.markerOneValue=v;setValue(document.getElementById('markerOneValue'),v);}
    sync();queue();
  }
  el.addEventListener('input',apply);el.addEventListener('change',apply);
}
function sync(){
  [
    ['Layout visible','layoutVisible'],['Layout clockwise','clockwise'],['Size','size'],['View','view'],['Data type','dataType'],
    ['Value','value'],['Find','find'],['Increment','increment'],
    ['Highlight visible','highlightVisible'],['Highlight fill','highlightFill'],['Show marks','highlightMarks'],['Show numbers','highlightNumbers'],
    ['Protractor visible','protractorVisible'],['Protractor clockwise','protractorClockwise'],['Protractor angle','protractorAngle'],
    ['Chronometer visible','chronoVisible'],['Chronometer clockwise','chronoClockwise'],['Chronometer angle','chronoAngle'],['Chronometer range','chronoRange']
  ].forEach(function(x){setValue(byLabel(x[0]),state[x[1]]);});
  Object.keys(state).forEach(function(k){setValue(document.getElementById(k),state[k]);});
  var s=section('Counter'),badge=s&&s.querySelector('.compact-badge');if(badge)badge.textContent=String(state.counterCount);
}
function preparePanel(){
  var view=byLabel('View'),type=byLabel('Data type'),fill=byLabel('Highlight fill'),range=byLabel('Chronometer range');
  if(view)view.innerHTML=option(12,'Circle of 12')+option(18,'Circle of 18')+option(24,'Circle of 24')+option(36,'Circle of 36')+option(72,'Circle of 72');
  if(type)type.innerHTML=option('Price')+option('Number')+option('Angle')+option('Time');
  if(fill)fill.innerHTML=option('Cell')+option('Le
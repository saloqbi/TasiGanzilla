e);svgEl(doc,'polygon',{points:points,'class':'gann-marker',transform:'rotate('+(angle+90)+' '+p.x+' '+p.y+')'},g);}
  else svgEl(doc,'polygon',{points:p.x+','+(p.y-size)+' '+(p.x+size)+','+p.y+' '+p.x+','+(p.y+size)+' '+(p.x-size)+','+p.y,'class':'gann-marker'},g);
}
function chronometerAngle(){
  var now=new Date(),range=state.chronoRange;
  if(range==='Manual')return n(state.chronoAngle,0);
  if(range==='Hourly')return (now.getMinutes()*6)+(now.getSeconds()/10);
  if(range==='Daily'||range==='Live')return ((now.getHours()*3600+now.getMinutes()*60+now.getSeconds())/86400)*360;
  if(range==='Weekly')return (((now.getDay()*86400)+(now.getHours()*3600+now.getMinutes()*60+now.getSeconds()))/(7*86400))*360;
  if(range==='Monthly'){var days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();return (((now.getDate()-1)*86400)+(now.getHours()*3600+now.getMinutes()*60+now.getSeconds()))/(days*86400)*360;}
  var start=new Date(now.getFullYear(),0,1),end=new Date(now.getFullYear()+1,0,1);return ((now-start)/(end-start))*360;
}
function renderChrono(doc){
  var g=doc.getElementById('gannTool_chrono');clear(g);if(!state.chronoVisible)return;
  var raw=chronometerAngle(),angle=-90+(direction(state.chronoClockwise)*raw),a=polar(INNER,angle),b=polar(OUTER-35,angle);
  svgEl(doc,'line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,'class':'gann-tool-line-blue'},g);
  svgEl(doc,'path',{d:arcPath(1460,-90,angle),'class':'gann-tool-arc-blue'},g);
  var p=polar(1500,angle),label=svgEl(doc,'text',{x:p.x,y:p.y,'class':'gann-tool-label'},g);label.textContent=state.chronoRange+' '+Math.round(raw)+'°';
  state.markerTwoValue=raw;
}
function renderAll(){
  var doc=getDoc();if(!doc){status('Waiting for wheel engine…',false);return;}
  if(activeDoc!==doc){activeDoc=doc;ensureStyle(doc);ensureRoot(doc);}
  ensureStyle(doc);ensureRoot(doc);
  renderLayout(doc);renderCounter(doc);renderHighlight(doc);renderScale(doc,'secondaryOne',false);renderMarker(doc,'markerOne');renderProtractor(doc);renderChrono(doc);renderScale(doc,'secondaryTwo',true);renderMarker(doc,'markerTwo');
  var audit=window.__auditKawkabatGannzillaToolsV1();status('Connected • Wheel '+state.counterWheel+' • '+audit.counterNumbers+' numbers',audit.ok);
}
function maintain(){
  var doc=getDoc();if(!doc){status('Waiting for wheel engine…',false);return;}
  if(activeDoc!==doc||!doc.getElementById('gannzillaToolsRootV1')){activeDoc=doc;scheduleRender();}
}
function startClock(){
  if(clockTimer)clearInterval(clockTimer);
  clockTimer=setInterval(function(){if(state.chronoVisible&&state.chronoRange!=='Manual')scheduleRender();},1000);
}
window.__auditKawkabatGannzillaToolsV1=function(){
  var doc=getDoc(),root=doc&&doc.getElementById('gannzillaToolsRootV1'),counter=doc&&doc.getElementById('gannTool_counter'),active=0;
  if(doc)Array.prototype.forEach.call(doc.querySelectorAll('#gannzillaToolsRootV1 > g'),function(g){if(g.children.length)active+=1;});
  return{ok:!!doc&&!!root&&!!counter&&(!state.counterVisible||counter.children.length===clamp(Math.round(state.counterCount),1,360)),engine:'GANNZILLA_TOOLS_V1',wheelConnected:!!doc,counterVisible:state.counterVisible,counterWheel:state.counterWheel,counterNumbers:counter?counter.children.length:0,activeTools:active,layoutVisible:state.layoutVisible,clockwise:state.clockwise,view:state.view,dataType:state.dataType,state:Object.assign({},state)};
};
preparePanel();
if(frame)frame.addEventListener('load',function(){activeDoc=null;scheduleRender();setTimeout(centerWheel,400);});
connectTimer=setInterval(maintain,300);
startClock();scheduleRender();
}());
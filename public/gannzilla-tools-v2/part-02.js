ctor-effect:non-scaling-stroke}'+
  '.gann-v2-highlight{fill:#F5D76E;fill-opacity:.36;stroke:#C88B16;stroke-width:2;vector-effect:non-scaling-stroke}'+
  '.gann-v2-label{font-family:Arial,Tahoma,sans-serif;font-size:25px;font-weight:900;text-anchor:middle;dominant-baseline:central;paint-order:stroke fill;stroke:#F7F1E3;stroke-width:4;fill:#17191B;pointer-events:none}'+
  '.gann-v2-tick{stroke:#314850;stroke-width:1.5;vector-effect:non-scaling-stroke}'+
  '.gann-v2-small{font-family:Arial,Tahoma,sans-serif;font-size:14px;font-weight:800;text-anchor:middle;dominant-baseline:central;fill:#314850;pointer-events:none}'+
  '.gann-v2-marker{fill:#F8D55A;stroke:#7A4B00;stroke-width:3;vector-effect:non-scaling-stroke;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}';
  doc.head.appendChild(st);
}
function ensureRoot(doc){
  var wheel=doc.getElementById('wheel'),root=doc.getElementById('gannToolsV2Root');
  if(!root){root=doc.createElementNS(NS,'g');root.id='gannToolsV2Root';root.setAttribute('aria-label','Connected Gannzilla tools V2');var a=doc.getElementById('angleFrame');if(a&&a.parentNode===wheel)wheel.insertBefore(root,a);else wheel.appendChild(root);}
  ['layout','highlight','counter','secondaryOne','markerOne','protractor','chrono','secondaryTwo','markerTwo'].forEach(function(id){if(!doc.getElementById('gannV2_'+id)){var g=doc.createElementNS(NS,'g');g.id='gannV2_'+id;root.appendChild(g);}});
}
function renderLayout(doc){
  var wheel=doc.getElementById('wheel'),div=doc.getElementById('divisions'),frames=doc.getElementById('frames'),fills=doc.getElementById('specialFills'),arcs=doc.getElementById('specialArcs'),g=doc.getElementById('gannV2_layout');
  wheel.style.width=Math.round(3960*(state.size/10))+'px';wheel.style.height=Math.round(3240*(state.size/10))+'px';
  [frames,fills,arcs].forEach(function(x){if(x)x.style.display=state.layoutVisible?'':'none';});
  clear(g);
  if(!state.layoutVisible){if(div)div.style.display='none';return;}
  var count=clamp(Math.round(state.view),4,360);
  if(count===36){if(div)div.style.display='';return;}
  if(div)div.style.display='none';
  for(var i=0;i<count;i++){var a=angle(i,count,state.clockwise,-5*(36/count)),p1=polar(INNER,a),p2=polar(OUTER,a);svg(doc,'line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,'class':'gann-v2-ray'},g);}
}
function renderCounter(doc){
  var g=doc.getElementById('gannV2_counter');clear(g);if(!state.counterVisible)return;
  var count=clamp(Math.round(state.counterCount),1,360),r=radius(state.counterWheel),font=clamp(state.counterFontSize,10,48);
  for(var i=0;i<count;i++){var v=valueForSlot(i,count,state.counterStart,state.counterIncrement),p=polar(r,angle(i,count,state.clockwise,0)),t=svg(doc,'text',{x:p.x,y:p.y,'class':'gann-v2-number '+colorClass(v)+(i%(Math.max(1,Math.round(count/4)))===0?' cardinal-number':''),'font-size':font,'data-wheel':state.counterWheel,'data-slot':i,'data-value':v},g);t.textContent=format(v);}
}
function renderHighlight(doc){
  var g=doc.getElementById('gannV2_highlight');clear(g);if(!state.highlightVisible)return;
  var count=clamp(Math.round(state.counterCount),1,360),slot=slotForValue(state.find,state.counterStart,state.counterIncrement,count);if(slot<0)return;
  var a=angle(slot,count,state.clockwise,0),half=180/count,r1=inner(state.counterWheel),r2=outer(state.counterWheel);
  if(state.highlightFill==='Levels'||state.highlightFill==='Spoke'){r1=INNER;r2=OUTER;}
  if(state.highlightFill==='Ring')svg(doc,'circle',{cx:CX,cy:CY,r:radius(state.counterWheel),'class':'gann-v2-highlight','fill':'none','stroke-width':STEP-16},g);
  else svg(doc,'path',{d:sectorPath(r1,r2,a-half,a+half),'class':'gann-v2-highlight'},g);
  var p=polar(radius(state.counterWheel),a);
  if(state.highlightMarks)svg(doc,'circle',{cx:p.x,cy:p.y,r:11,'class':'gann-v2-marker'},g);
  if(state.highlightNumbers){var t=svg(doc,'text',{x:p.x,y:p.y-28,'class':'gann-v2-label'},g);t.textContent=format(state.find);}
}
function renderProtractor(doc){
  var g=doc.getElementById('gannV2_protractor');clear(g);if(!state.protractorVisible)return;
  var deg=num(state.protractorAngle,0),a=-90+dir(state.protractorClockwise)*deg,p1=polar(INNER,a),p2=polar(OUTER,a);
  svg(doc,'line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,'class':'gann-v2-red'},g);
  svg(doc,'path',{d:arcPath(1320,-90,a),'class':'gann-v2-red'},g);
  var p=polar(1365,a),t=svg(doc,'text',{x:p.x,y:p.y,'class':'gann-v2-label'},g);t.textContent=Math.round(deg)+'°';
}
function renderScale(doc,prefix,blue){
  var g=doc.getElementById('gannV2_'+prefix);clear(g);if(!state[prefix+'Visible'])return;
  var w=state[prefix+'Wheel'],count=clamp(Math.round(state[prefix+'Divisions']),4,360),off=num(state[prefix+'Offset'],0),labels=state[prefix+'Labels'],r=outer(w)-5;
  for(var i=0;i<count;i++){var a=angle(i,count,state.clockwise,off),p1=polar(r-(i%(Math.max(1,Math.round(count/12)))===0?22:11),a),p2=polar(r,a);svg(doc,'line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,'class':'gann-v2-tick'},g);if(labels&&i%(Math.max(1,Math.round(count/12)))===0){var p=polar(r-34,a),t=svg(doc,'text',{x:p.x,y:p.y,'class':'gann-v2-small'},g);t.textContent=String(i);}}
}
function markerAngle(v){var count=clamp(Math.round(state.counterCount),1,360),slot=slotForValue(v,state.counterStart,state.counterIncrement,count);if(slot<0)slot=((Math.rou
e.counterCount),1,360),radius=wheelRadius(state.counterWheel),font=clamp(state.counterFontSize,10,48);
  for(var slot=0;slot<count;slot+=1){
    var value=slotValue(slot,count,state.counterStart,state.counterIncrement),p=polar(radius,angleForSlot(slot,count,state.clockwise,0));
    var text=svgEl(doc,'text',{x:p.x,y:p.y,'class':'gann-tool-number '+colorClass(value)+(slot%(Math.max(1,Math.round(count/4)))===0?' cardinal-number':''),'font-size':font,'data-wheel':state.counterWheel,'data-cycle':'1','data-slot':slot,'data-value':value},g);
    text.textContent=formatValue(value);
  }
}
function renderHighlight(doc){
  var g=doc.getElementById('gannTool_highlight');clear(g);if(!state.highlightVisible)return;
  var count=clamp(Math.round(state.counterCount),1,360),slot=slotForValue(state.find,state.counterStart,state.counterIncrement,count);if(slot<0)return;
  var angle=angleForSlot(slot,count,state.clockwise,0),half=180/count,inner=wheelInner(state.counterWheel),outer=wheelOuter(state.counterWheel);
  if(state.highlightFill==='Levels'||state.highlightFill==='Spoke'){inner=INNER;outer=OUTER;}
  if(state.highlightFill==='Ring')svgEl(doc,'circle',{cx:CX,cy:CY,r:wheelRadius(state.counterWheel),'class':'gann-highlight-ring','stroke-width':STEP-16},g);
  else svgEl(doc,'path',{d:sectorPath(inner,outer,angle-half,angle+half),'class':'gann-highlight'},g);
  var p=polar(wheelRadius(state.counterWheel),angle);
  if(state.highlightMarks)svgEl(doc,'circle',{cx:p.x,cy:p.y,r:11,'class':'gann-marker'},g);
  if(state.highlightNumbers){var label=svgEl(doc,'text',{x:p.x,y:p.y-28,'class':'gann-tool-label'},g);label.textContent=formatValue(state.find);}
}
function renderProtractor(doc){
  var g=doc.getElementById('gannTool_protractor');clear(g);if(!state.protractorVisible)return;
  var angle=-90+(direction(state.protractorClockwise)*n(state.protractorAngle,0)),a=polar(INNER,angle),b=polar(OUTER,angle);
  svgEl(doc,'line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,'class':'gann-tool-line'},g);
  svgEl(doc,'path',{d:arcPath(1320,-90,angle),'class':'gann-tool-arc'},g);
  var p=polar(1365,angle),label=svgEl(doc,'text',{x:p.x,y:p.y,'class':'gann-tool-label'},g);label.textContent=Math.round(n(state.protractorAngle,0))+'°';
}
function renderScale(doc,prefix,blue){
  var g=doc.getElementById('gannTool_'+prefix);clear(g);
  var visible=state[prefix+'Visible'];if(!visible)return;
  var wheel=state[prefix+'Wheel'],count=clamp(Math.round(state[prefix+'Divisions']),4,360),offset=n(state[prefix+'Offset'],0),labels=state[prefix+'Labels'],radius=wheelOuter(wheel)-5;
  for(var i=0;i<count;i+=1){var angle=angleForSlot(i,count,state.clockwise,offset),outer=polar(radius,angle),inner=polar(radius-(i%(Math.max(1,Math.round(count/12)))===0?22:11),angle);svgEl(doc,'line',{x1:inner.x,y1:inner.y,x2:outer.x,y2:outer.y,'class':'gann-scale-tick'},g);if(labels&&i%(Math.max(1,Math.round(count/12)))===0){var p=polar(radius-34,angle),t=svgEl(doc,'text',{x:p.x,y:p.y,'class':'gann-scale-label'},g);t.textContent=String(i);}}
}
function markerAngle(value){
  var count=clamp(Math.round(state.counterCount),1,360),slot=slotForValue(value,state.counterStart,state.counterIncrement,count);
  if(slot<0){slot=((Math.round(value)%count)+count)%count;}
  return angleForSlot(slot,count,state.clockwise,0);
}
function renderMarker(doc,prefix){
  var g=doc.getElementById('gannTool_'+prefix);clear(g);if(!state[prefix+'Visible'])return;
  var wheel=state[prefix+'Wheel'],value=state[prefix+'Value'],shape=state[prefix+'Shape'],angle=markerAngle(value),p=polar(wheelRadius(wheel),angle),size=17;
  if(shape==='Circle')svgEl(doc,'circle',{cx:p.x,cy:p.y,r:size,'class':'gann-marker'},g);
  else if(shape==='Triangle'){var p1=polar(size,angle-90),points=(p.x)+','+(p.y-size)+' '+(p.x-size)+','+(p.y+size)+' '+(p.x+size)+','+(p.y+siz
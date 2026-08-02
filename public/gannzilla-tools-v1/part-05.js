(!root){root=doc.createElementNS(NS,'g');root.id='gannzillaToolsRootV1';root.setAttribute('aria-label','Gannzilla connected tools');var anchor=doc.getElementById('angleFrame');if(anchor&&anchor.parentNode===svg)svg.insertBefore(root,anchor);else svg.appendChild(root);}
  ['layout','highlight','counter','secondaryOne','markerOne','protractor','chrono','secondaryTwo','markerTwo'].forEach(function(id){if(!doc.getElementById('gannTool_'+id)){var g=doc.createElementNS(NS,'g');g.id='gannTool_'+id;root.appendChild(g);}});
  return root;
}
function clear(g){while(g&&g.firstChild)g.removeChild(g.firstChild);}
function svgEl(doc,name,attrs,parent){var el=doc.createElementNS(NS,name);Object.keys(attrs||{}).forEach(function(key){el.setAttribute(key,attrs[key]);});if(parent)parent.appendChild(el);return el;}
function polar(radius,degree){var a=degree*Math.PI/180;return{x:CX+Math.cos(a)*radius,y:CY+Math.sin(a)*radius};}
function wheelInner(wheel){return INNER+(clamp(wheel,1,MAX_WHEELS)-1)*STEP;}
function wheelOuter(wheel){return wheelInner(wheel)+STEP;}
function wheelRadius(wheel){return wheelInner(wheel)+(STEP/2);}
function direction(clockwise){return clockwise?1:-1;}
function colorClass(value){var mod=((Math.round(value)%3)+3)%3;return mod===1?'number-red':mod===2?'number-blue':'number-black';}
function formatValue(value){
  if(state.dataType==='Angle')return Math.round(value)+'°';
  if(state.dataType==='Time'){var total=Math.abs(Math.round(value)),h=Math.floor(total/60)%24,m=total%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
  return String(Number.isInteger(value)?value:Number(value.toFixed(4)));
}
function slotValue(slot,count,start,increment){return slot===0?start+((count-1)*increment):start+((slot-1)*increment);}
function angleForSlot(slot,count,clockwise,offset){return -90+(direction(clockwise)*(slot*360/count))+(offset||0);}
function slotForValue(value,start,increment,count){if(!increment)return 0;var k=Math.round((value-start)/increment);if(k<0||k>=count)return -1;return k+1>=count?0:k+1;}
function sectorPath(inner,outer,start,end){
  var a=polar(outer,start),b=polar(outer,end),c=polar(inner,end),d=polar(inner,start),span=Math.abs(end-start),large=span>180?1:0,sweep=end>=start?1:0;
  return 'M '+a.x+' '+a.y+' A '+outer+' '+outer+' 0 '+large+' '+sweep+' '+b.x+' '+b.y+' L '+c.x+' '+c.y+' A '+inner+' '+inner+' 0 '+large+' '+(sweep?0:1)+' '+d.x+' '+d.y+' Z';
}
function arcPath(radius,start,end){
  var a=polar(radius,start),b=polar(radius,end),delta=end-start,large=Math.abs(delta)>180?1:0,sweep=delta>=0?1:0;
  return 'M '+a.x+' '+a.y+' A '+radius+' '+radius+' 0 '+large+' '+sweep+' '+b.x+' '+b.y;
}

function renderLayout(doc){
  var svg=doc.getElementById('wheel'),divisions=doc.getElementById('divisions'),frames=doc.getElementById('frames'),specialFills=doc.getElementById('specialFills'),specialArcs=doc.getElementById('specialArcs'),g=doc.getElementById('gannTool_layout');
  [frames,specialFills,specialArcs].forEach(function(node){if(node)node.style.display=state.layoutVisible?'':'none';});
  svg.style.width=Math.round(BASE_WIDTH*(state.size/10))+'px';svg.style.height=Math.round(BASE_HEIGHT*(state.size/10))+'px';
  clear(g);
  if(!state.layoutVisible){if(divisions)divisions.style.display='none';return;}
  var count=clamp(Math.round(state.view),4,360);
  if(count===36){if(divisions)divisions.style.display='';return;}
  if(divisions)divisions.style.display='none';
  for(var i=0;i<count;i+=1){var angle=angleForSlot(i,count,state.clockwise,-5*(36/count)),a=polar(INNER,angle),b=polar(OUTER,angle);svgEl(doc,'line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,'class':'gann-layout-ray'},g);}
}
function renderCounter(doc){
  var g=doc.getElementById('gannTool_counter');clear(g);if(!state.counterVisible)return;
  var count=clamp(Math.round(stat
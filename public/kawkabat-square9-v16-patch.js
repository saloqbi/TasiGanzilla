(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const TABLE_SCALE=1.073;
const FRAME_RADIUS=346;
const ROOT_ID='visibleReferenceShapesV16';
const ARROW_ID='directionArrowsV16';
const svg=document.getElementById('squareSvg');
const status=document.getElementById('status');
const badge=document.getElementById('v16Badge');
let applying=false;

function S(tag,attrs,text){
  const n=document.createElementNS(NS,tag);
  Object.entries(attrs||{}).forEach(([k,v])=>n.setAttribute(k,String(v)));
  if(text!==undefined)n.textContent=String(text);
  return n;
}
function p(displayAngle,radius=FRAME_RADIUS){
  const a=(displayAngle-180)*Math.PI/180;
  return {x:500+Math.cos(a)*radius,y:500+Math.sin(a)*radius};
}
function polygonPath(points){return points.map((q,i)=>(i?'L':'M')+q.x+' '+q.y).join(' ')+' Z';}
function arrowPath(displayAngle,radius,length,width){
  const a=(displayAngle-180)*Math.PI/180;
  const tip=p(displayAngle,radius);
  const base=p(displayAngle,radius-length);
  const px=-Math.sin(a)*width,py=Math.cos(a)*width;
  return `M${tip.x} ${tip.y}L${base.x+px} ${base.y+py}L${base.x-px} ${base.y-py}Z`;
}
function addText(root,label,x,y,color,size){
  root.appendChild(S('text',{x,y,'text-anchor':'middle','dominant-baseline':'central','font-family':'Arial,Tahoma,sans-serif','font-size':size,'font-weight':900,fill:color,'paint-order':'stroke fill',stroke:'#fffdf8','stroke-width':1.4,'stroke-opacity':.96},label));
}
function buildVisibleShapes(){
  const root=S('g',{id:ROOT_ID,'data-shape-count':'2','pointer-events':'none'});
  const red='#df6760',green='#4c991b',orange='#d98900';
  const left=p(0),top=p(90),right=p(180),bottom=p(270),greenTop=p(135),greenBottom=p(225);

  root.appendChild(S('path',{d:polygonPath([top,right,bottom,left]),fill:red,'fill-opacity':.105,stroke:red,'stroke-width':2.1,'stroke-opacity':.82,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'}));
  root.appendChild(S('path',{d:polygonPath([left,greenTop,greenBottom]),fill:green,'fill-opacity':.095,stroke:green,'stroke-width':2.1,'stroke-opacity':.84,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'}));

  root.appendChild(S('line',{x1:top.x,y1:top.y,x2:bottom.x,y2:bottom.y,stroke:red,'stroke-width':1.7,'stroke-opacity':.68,'vector-effect':'non-scaling-stroke'}));
  root.appendChild(S('line',{x1:left.x,y1:left.y,x2:right.x,y2:right.y,stroke:red,'stroke-width':1.7,'stroke-opacity':.68,'vector-effect':'non-scaling-stroke'}));

  [left,top,right,bottom].forEach(q=>root.appendChild(S('circle',{cx:q.x,cy:q.y,r:4.1,fill:red,stroke:'#fff','stroke-width':1.35,'vector-effect':'non-scaling-stroke'})));
  [greenTop,greenBottom].forEach(q=>root.appendChild(S('circle',{cx:q.x,cy:q.y,r:3.8,fill:green,stroke:'#fff','stroke-width':1.25,'vector-effect':'non-scaling-stroke'})));

  addText(root,'1/4',500,181,orange,13);
  addText(root,'1/2',815,500,orange,13);
  addText(root,'3/4',500,819,orange,13);
  addText(root,'1/3',716,278,green,12.5);
  addText(root,'2/3',716,722,green,12.5);
  return root;
}
function buildArrows(){
  const root=S('g',{id:ARROW_ID,'data-arrow-count':'6','pointer-events':'none'});
  [0,90,180,270].forEach(angle=>root.appendChild(S('path',{d:arrowPath(angle,FRAME_RADIUS,24,10),fill:'#df5f59',stroke:'#df5f59','stroke-width':1,'fill-opacity':.94,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'})));
  [135,225].forEach(angle=>root.appendChild(S('path',{d:arrowPath(angle,FRAME_RADIUS,21,8),fill:'#38923e',stroke:'#38923e','stroke-width':1,'fill-opacity':.94,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'})));
  return root;
}
function apply(){
  if(applying||!svg||getComputedStyle(svg).display==='none')return false;
  const square=svg.querySelector('#square');
  const originalShapes=svg.querySelector('#mainShapes');
  if(!square||!originalShapes)return false;
  applying=true;
  try{
    square.setAttribute('transform',`translate(500 500) scale(${TABLE_SCALE}) translate(-500 -500)`);
    square.dataset.directScale=String(TABLE_SCALE);
    originalShapes.style.setProperty('display','none','important');

    svg.querySelector('#'+ROOT_ID)?.remove();
    svg.querySelector('#'+ARROW_ID)?.remove();
    svg.appendChild(buildVisibleShapes());
    svg.appendChild(buildArrows());

    if(status)status.textContent='Square of 9 • table fitted inside angle wheel • square and triangle visible';
    if(badge){badge.textContent='V16 ACTIVE • table 1.073× • shapes 2 • arrows 6';badge.style.color='#246238';badge.style.borderColor='#2b7a43';}
    document.documentElement.dataset.visibleShapesV16='true';
    return true;
  } finally { applying=false; }
}
const observer=new MutationObserver(()=>setTimeout(apply,0));
observer.observe(svg,{childList:true});
setInterval(()=>{
  const square=svg?.querySelector('#square');
  if(!square||square.dataset.directScale!==String(TABLE_SCALE)||!svg.querySelector('#'+ROOT_ID)||!svg.querySelector('#'+ARROW_ID))apply();
},220);
window.addEventListener('resize',apply);
window.__auditSquare9VisibleShapesV16=()=>({
  ok:document.documentElement.dataset.visibleShapesV16==='true',
  tableScale:svg.querySelector('#square')?.dataset.directScale||null,
  estimatedTableSide:456*TABLE_SCALE,
  shapeCount:svg.querySelector('#'+ROOT_ID)?.querySelectorAll('path').length||0,
  arrowCount:svg.querySelector('#'+ARROW_ID)?.querySelectorAll('path').length||0,
  frameRadius:FRAME_RADIUS
});
setTimeout(apply,80);setTimeout(apply,450);setTimeout(apply,1100);
}());
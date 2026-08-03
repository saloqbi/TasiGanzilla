(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const TABLE_SCALE=1.073;
const SHAPE_SCALE=1.018;
const FRAME_RADIUS=346;
const ROOT_ID='directionArrowsV14';
const svg=document.getElementById('squareSvg');
const status=document.getElementById('status');
let timer=0;

function S(tag,attrs){
  const node=document.createElementNS(NS,tag);
  Object.entries(attrs||{}).forEach(([key,value])=>node.setAttribute(key,String(value)));
  return node;
}
function displayPoint(radius,displayAngle){
  const angle=(displayAngle-180)*Math.PI/180;
  return{x:500+Math.cos(angle)*radius,y:500+Math.sin(angle)*radius};
}
function arrowPath(displayAngle,radius,length,width){
  const angle=(displayAngle-180)*Math.PI/180;
  const tip=displayPoint(radius,displayAngle);
  const base=displayPoint(radius-length,displayAngle);
  const px=-Math.sin(angle)*width;
  const py=Math.cos(angle)*width;
  return `M${tip.x} ${tip.y}L${base.x+px} ${base.y+py}L${base.x-px} ${base.y-py}Z`;
}
function addArrow(root,displayAngle,color,radius,length,width,opacity){
  root.appendChild(S('path',{
    d:arrowPath(displayAngle,radius,length,width),
    fill:color,
    'fill-opacity':opacity,
    stroke:color,
    'stroke-width':1,
    'stroke-opacity':Math.min(1,opacity+.12),
    'stroke-linejoin':'round',
    'vector-effect':'non-scaling-stroke'
  }));
}
function buildArrows(){
  const root=S('g',{id:ROOT_ID,'data-arrow-count':'6','pointer-events':'none'});
  [0,90,180,270].forEach(angle=>addArrow(root,angle,'#df6760',FRAME_RADIUS,22,9,.82));
  [135,225].forEach(angle=>addArrow(root,angle,'#4c991b',FRAME_RADIUS,19,7,.84));
  return root;
}
function applyExpandedGeometry(){
  if(!svg||getComputedStyle(svg).display==='none')return false;
  const square=svg.querySelector('#square');
  const shapes=svg.querySelector('#mainShapes');
  if(!square||!shapes)return false;

  const squareTransform=`translate(500 500) scale(${TABLE_SCALE}) translate(-500 -500)`;
  const shapeTransform=`translate(500 500) scale(${SHAPE_SCALE}) translate(-500 -500)`;
  square.setAttribute('transform',squareTransform);
  shapes.setAttribute('transform',shapeTransform);
  square.dataset.expandedToFrame='true';
  square.dataset.geometryScale=String(TABLE_SCALE);
  shapes.dataset.expandedToFrame='true';
  shapes.dataset.geometryScale=String(SHAPE_SCALE);

  let arrows=svg.querySelector('#'+ROOT_ID);
  if(!arrows){
    arrows=buildArrows();
    svg.appendChild(arrows);
  }
  if(status)status.textContent='Square of 9 • enlarged table and shapes • direction arrows restored • 1–361';
  document.documentElement.dataset.expandedGeometryV14='true';
  document.documentElement.dataset.tableScaleV14=String(TABLE_SCALE);
  document.documentElement.dataset.shapeScaleV14=String(SHAPE_SCALE);
  return true;
}
function schedule(){
  clearTimeout(timer);
  timer=setTimeout(applyExpandedGeometry,30);
}
const observer=new MutationObserver(schedule);
observer.observe(svg,{childList:true,subtree:true});
window.addEventListener('resize',schedule);
setInterval(()=>{
  if(!svg.querySelector('#'+ROOT_ID)||!svg.querySelector('#square')?.dataset.expandedToFrame)applyExpandedGeometry();
},300);
window.__auditSquare9ExpandedGeometryV14=function(){
  const square=svg.querySelector('#square');
  const shapes=svg.querySelector('#mainShapes');
  const arrows=svg.querySelector('#'+ROOT_ID);
  return{
    ok:!!(square&&shapes&&arrows),
    tableScale:square?.dataset.geometryScale||null,
    shapeScale:shapes?.dataset.geometryScale||null,
    arrowCount:arrows?arrows.querySelectorAll('path').length:0,
    redArrowCount:4,
    greenArrowCount:2,
    frameRadius:FRAME_RADIUS
  };
};
schedule();
}());
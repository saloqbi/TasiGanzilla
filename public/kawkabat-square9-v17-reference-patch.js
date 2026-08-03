(function(){
'use strict';

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('squareSvg');
const status=document.getElementById('status');
const badge=document.getElementById('v16Badge');

const C=500;
const TABLE_SCALE=1.47;
const TABLE_SIDE=456;
const TABLE_CELL=24;
const SHAPE_R=500;
const BACK_ID='referenceBackdropV17';
const FRONT_ID='referenceForegroundV17';
const LEGACY_IDS=['zodiacRing','angleWheel','angleFrames','mainShapes','aspects','moonStrip','cycleCards','optional'];
let applying=false;

function S(tag,attrs,textValue){
  const node=document.createElementNS(NS,tag);
  Object.entries(attrs||{}).forEach(([key,value])=>node.setAttribute(key,String(value)));
  if(textValue!==undefined)node.textContent=String(textValue);
  return node;
}
function point(angle,radius){
  const a=(angle-180)*Math.PI/180;
  return {x:C+Math.cos(a)*radius,y:C+Math.sin(a)*radius};
}
function sector(r1,r2,a0,a1){
  const p0=point(a0,r2),p1=point(a1,r2),q1=point(a1,r1),q0=point(a0,r1);
  return `M${p0.x} ${p0.y}A${r2} ${r2} 0 0 1 ${p1.x} ${p1.y}L${q1.x} ${q1.y}A${r1} ${r1} 0 0 0 ${q0.x} ${q0.y}Z`;
}
function polygon(points){
  return points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')+'Z';
}
function rotation(angle){
  let r=angle-90;
  while(r>180)r-=360;
  while(r<=-180)r+=360;
  if(r>90)r-=180;
  if(r<-90)r+=180;
  return r;
}
function line(parent,a,b,stroke,width,opacity=1){
  parent.appendChild(S('line',{
    x1:a.x,y1:a.y,x2:b.x,y2:b.y,
    stroke,'stroke-width':width,'stroke-opacity':opacity,
    'stroke-linecap':'round','vector-effect':'non-scaling-stroke'
  }));
}
function text(parent,label,p,size,fill,weight=700,rotate=0,strokeWidth=.55){
  parent.appendChild(S('text',{
    x:p.x,y:p.y,'text-anchor':'middle','dominant-baseline':'central',
    'font-family':'Arial,Tahoma,"Segoe UI Symbol",sans-serif',
    'font-size':size,'font-weight':weight,fill,
    transform:rotate?`rotate(${rotate} ${p.x} ${p.y})`:'',
    'paint-order':'stroke fill',stroke:'#fffdf8','stroke-width':strokeWidth,
    'stroke-opacity':.92,'vector-effect':'non-scaling-stroke'
  },label));
}
function arrow(angle,radius,length,width){
  const a=(angle-180)*Math.PI/180;
  const tip=point(angle,radius),base=point(angle,radius-length);
  const px=-Math.sin(a)*width,py=Math.cos(a)*width;
  return `M${tip.x} ${tip.y}L${base.x+px} ${base.y+py}L${base.x-px} ${base.y-py}Z`;
}
function ensureDefs(){
  let defs=svg.querySelector('#referenceDefsV17');
  if(defs)return defs;
  defs=S('defs',{id:'referenceDefsV17'});
  [
    ['amber','#fff7d7','#efbd43','#8e5d12'],
    ['bronze','#f5e7d8','#b97945','#60351d'],
    ['teal','#e4fbf7','#61aa9f','#275f59'],
    ['sage','#eef8df','#8fb768','#46682f'],
    ['violet','#f4edf6','#a994af','#66516f'],
    ['silver','#ffffff','#dedbd1','#77756d'],
    ['blue','#eaf7ff','#6eafd1','#27688f']
  ].forEach(([id,hi,mid,lo])=>{
    const g=S('radialGradient',{id:'ref-'+id,cx:'30%',cy:'27%',r:'74%'});
    g.appendChild(S('stop',{offset:'0%','stop-color':hi}));
    g.appendChild(S('stop',{offset:'38%','stop-color':mid}));
    g.appendChild(S('stop',{offset:'100%','stop-color':lo}));
    defs.appendChild(g);
  });
  svg.insertBefore(defs,svg.firstChild);
  return defs;
}
function buildBackdrop(){
  const root=S('g',{id:BACK_ID,'pointer-events':'none'});
  const zodiac=[
    ['LEO','#efb2ae'],['VIRGO','#c5e3ca'],['LIBRA','#ddd2eb'],['SCORPIO','#c8e2ec'],
    ['SAGITTARIUS','#efb4b0'],['CAPRICORN','#c7e4cb'],['AQUARIUS','#ddd3eb'],['PISCES','#c7e1ec'],
    ['ARIES','#efb2ae'],['TAURUS','#c7e4ca'],['GEMINI','#ddd1ea'],['CANCER','#c7e1ec']
  ];

  root.appendChild(S('circle',{cx:C,cy:C,r:516,fill:'#fffdf8',stroke:'#8f8f89','stroke-width':1.1,'vector-effect':'non-scaling-stroke'}));

  zodiac.forEach(([label,color],i)=>{
    const mid=i*30;
    root.appendChild(S('path',{
      d:sector(486,516,mid-15,mid+15),fill:color,'fill-opacity':.8,
      stroke:'#c6c6bf','stroke-width':.75,'vector-effect':'non-scaling-stroke'
    }));
    text(root,label,point(mid,501),10,'#3c3c39',800,rotation(mid),.5);
  });

  [486,470,458,446].forEach((radius,i)=>root.appendChild(S('circle',{
    cx:C,cy:C,r:radius,fill:'none',
    stroke:i===1?'#a5a59f':'#c8c8c0',
    'stroke-width':i===1?1:.65,'vector-effect':'non-scaling-stroke'
  })));

  for(let angle=0;angle<360;angle++){
    const cardinal=angle%90===0;
    const ten=angle%10===0;
    const five=!ten&&angle%5===0;
    const inner=cardinal?438:ten?444:five?450:454;
    line(root,point(angle,458),point(angle,inner),cardinal?'#a92929':ten?'#cf4747':five?'#686863':'#bbbbb5',cardinal?2.2:ten?1.3:five?.8:.4);
    if(angle%5===0){
      text(root,angle+'°',point(angle,429),cardinal?10.4:ten?8.7:7.5,cardinal?'#1d1d1b':ten?'#33332f':'#6b6b65',cardinal?900:ten?800:600,rotation(angle),.6);
    }
  }

  const dateLabels=[
    [0,'21 MAR'],[30,'6 APR'],[60,'22 JUL'],[90,'21 JUN'],
    [120,'21 MAY'],[150,'6 MAY'],[180,'21 APR'],[210,'7 OCT'],
    [240,'22 OCT'],[270,'21 DEC'],[300,'21 NOV'],[330,'6 NOV']
  ];
  dateLabels.forEach(([angle,label],i)=>{
    const p=point(angle,474),rot=rotation(angle),w=label.length*5.25+12;
    root.appendChild(S('rect',{
      x:p.x-w/2,y:p.y-8,width:w,height:16,rx:7,
      fill:i%3===0?'#f8dbd9':'#eef7eb','fill-opacity':.94,
      stroke:i%3===0?'#dc7670':'#71a968','stroke-width':.8,
      transform:`rotate(${rot} ${p.x} ${p.y})`,'vector-effect':'non-scaling-stroke'
    }));
    text(root,label,p,7.7,i%3===0?'#742b27':'#315e2e',800,rot,.42);
  });

  const red='#e36f72',green='#64aa5f';
  const left=point(0,SHAPE_R),top=point(90,SHAPE_R),right=point(180,SHAPE_R),bottom=point(270,SHAPE_R);
  const gt=point(120,SHAPE_R),gb=point(240,SHAPE_R);
  root.appendChild(S('path',{d:polygon([top,right,bottom,left]),fill:red,'fill-opacity':.115,stroke:'none'}));
  root.appendChild(S('path',{d:polygon([left,gt,gb]),fill:green,'fill-opacity':.13,stroke:'none'}));
  return root;
}
function addMarker(root,col,row,gradient,radius){
  const cell=TABLE_CELL*TABLE_SCALE;
  const start=C-(TABLE_SIDE*TABLE_SCALE)/2;
  const x=start+(col+.5)*cell;
  const y=start+(row+.5)*cell;
  root.appendChild(S('circle',{
    cx:x,cy:y,r:radius,fill:`url(#ref-${gradient})`,
    stroke:'#fff','stroke-width':1.4,'stroke-opacity':.92,
    'vector-effect':'non-scaling-stroke','data-reference-marker':'true'
  }));
  root.appendChild(S('circle',{
    cx:x,cy:y,r:Math.max(2,radius-3.2),fill:'none',
    stroke:'#41413c','stroke-width':.55,'stroke-opacity':.42,
    'vector-effect':'non-scaling-stroke'
  }));
}
function buildForeground(){
  const root=S('g',{id:FRONT_ID,'pointer-events':'none'});
  const red='#dc6467',green='#51a24f',orange='#cf8d00';
  const left=point(0,SHAPE_R),top=point(90,SHAPE_R),right=point(180,SHAPE_R),bottom=point(270,SHAPE_R);
  const gt=point(120,SHAPE_R),gb=point(240,SHAPE_R);

  root.appendChild(S('path',{
    d:polygon([top,right,bottom,left]),fill:'none',stroke:red,
    'stroke-width':2.15,'stroke-opacity':.84,'stroke-linejoin':'round',
    'vector-effect':'non-scaling-stroke'
  }));
  root.appendChild(S('path',{
    d:polygon([left,gt,gb]),fill:'none',stroke:green,
    'stroke-width':2.15,'stroke-opacity':.87,'stroke-linejoin':'round',
    'vector-effect':'non-scaling-stroke'
  }));
  line(root,top,bottom,red,1.8,.7);
  line(root,left,right,red,1.8,.7);

  [0,90,180,270].forEach(angle=>root.appendChild(S('path',{
    d:arrow(angle,SHAPE_R,30,11),fill:red,stroke:red,'stroke-width':1,
    'fill-opacity':.92,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    'data-reference-arrow':'true'
  })));
  [120,240].forEach(angle=>root.appendChild(S('path',{
    d:arrow(angle,SHAPE_R,27,9),fill:green,stroke:green,'stroke-width':1,
    'fill-opacity':.94,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    'data-reference-arrow':'true'
  })));

  [left,top,right,bottom].forEach(p=>root.appendChild(S('circle',{
    cx:p.x,cy:p.y,r:4.3,fill:'#fff',stroke:red,'stroke-width':1.5,
    'vector-effect':'non-scaling-stroke'
  })));
  [gt,gb].forEach(p=>root.appendChild(S('circle',{
    cx:p.x,cy:p.y,r:4,fill:'#fff',stroke:green,'stroke-width':1.45,
    'vector-effect':'non-scaling-stroke'
  })));

  text(root,'1/4',point(90,410),13.5,orange,900,0,.85);
  text(root,'1/2',point(180,455),13.5,orange,900,90,.85);
  text(root,'3/4',point(270,410),13.5,orange,900,0,.85);
  text(root,'1/3',point(120,443),12.5,green,900,-60,.8);
  text(root,'2/3',point(240,443),12.5,green,900,60,.8);

  [
    [6,0,'amber',11],[1,4,'bronze',11],[8,6,'teal',10.5],[9,9,'sage',10],
    [16,12,'sage',11.5],[17,13,'violet',10.5],[0,14,'bronze',10],
    [0,15,'amber',10],[11,16,'amber',11],[14,16,'sage',11],
    [18,16,'bronze',10.5],[0,17,'silver',10.5],[15,17,'blue',11]
  ].forEach(marker=>addMarker(root,...marker));

  [
    [8,'☉','#c84b44'],[56,'☿','#1e1e1c'],[103,'♀','#1e1e1c'],
    [150,'♂','#448333'],[205,'♄','#1e1e1c'],[258,'♆','#1e1e1c'],
    [314,'♇','#1e1e1c'],[348,'☽','#c84b44']
  ].forEach(([angle,glyph,color])=>{
    const p=point(angle,509);
    root.appendChild(S('circle',{
      cx:p.x,cy:p.y,r:6.6,fill:'#fff','fill-opacity':.84,
      stroke:color,'stroke-width':1.1,'vector-effect':'non-scaling-stroke'
    }));
    text(root,glyph,p,12,color,900,0,.45);
  });

  return root;
}
function styleSquare(square){
  square.setAttribute('transform',`translate(${C} ${C}) scale(${TABLE_SCALE}) translate(-${C} -${C})`);
  square.dataset.referenceScaleV17=String(TABLE_SCALE);
  const base=square.querySelector('rect');
  if(base){
    base.setAttribute('fill','#fffdf8');
    base.setAttribute('fill-opacity','.46');
    base.setAttribute('stroke','#62625d');
    base.setAttribute('stroke-width','1.1');
  }
  square.querySelectorAll('text').forEach(node=>{
    node.setAttribute('font-family','Arial,Tahoma,sans-serif');
    node.setAttribute('font-weight','750');
    node.setAttribute('fill','#22221f');
    node.setAttribute('stroke-width','.42');
  });
}
function apply(){
  if(applying||!svg||getComputedStyle(svg).display==='none')return false;
  const square=svg.querySelector('#square');
  if(!square)return false;
  applying=true;
  try{
    ensureDefs();
    LEGACY_IDS.forEach(id=>{
      const node=svg.querySelector('#'+id);
      if(node)node.style.setProperty('display','none','important');
    });
    styleSquare(square);
    svg.querySelector('#'+BACK_ID)?.remove();
    svg.querySelector('#'+FRONT_ID)?.remove();
    svg.insertBefore(buildBackdrop(),square);
    svg.appendChild(buildForeground());

    document.documentElement.dataset.referenceLayoutV17='true';
    if(status)status.textContent='Square of 9 • reference-aligned wheel • 19×19 • 1–361 • red square • green triangle';
    if(badge){
      badge.textContent='V17 ACTIVE • reference geometry • table 1.47× • shapes 2 • arrows 6';
      badge.style.color='#245f37';
      badge.style.borderColor='#2d7b46';
      badge.style.background='rgba(255,255,255,.94)';
    }
    return true;
  }finally{
    applying=false;
  }
}
function needsApply(){
  const square=svg?.querySelector('#square');
  return !square||
    square.dataset.referenceScaleV17!==String(TABLE_SCALE)||
    !svg.querySelector('#'+BACK_ID)||
    !svg.querySelector('#'+FRONT_ID);
}

const observer=new MutationObserver(()=>setTimeout(()=>{if(needsApply())apply();},0));
observer.observe(svg,{childList:true,subtree:false});
setInterval(()=>{if(needsApply())apply();},350);
window.addEventListener('resize',apply);

window.__auditSquare9ReferenceLayoutV17=()=>({
  ok:document.documentElement.dataset.referenceLayoutV17==='true',
  tableScale:svg.querySelector('#square')?.dataset.referenceScaleV17||null,
  tableSide:TABLE_SIDE*TABLE_SCALE,
  tableCell:TABLE_CELL*TABLE_SCALE,
  backdropPresent:!!svg.querySelector('#'+BACK_ID),
  foregroundPresent:!!svg.querySelector('#'+FRONT_ID),
  markerCount:svg.querySelectorAll('#'+FRONT_ID+' [data-reference-marker="true"]').length,
  arrowCount:svg.querySelectorAll('#'+FRONT_ID+' [data-reference-arrow="true"]').length,
  hiddenLegacyLayers:LEGACY_IDS.filter(id=>svg.querySelector('#'+id)?.style.display==='none')
});

setTimeout(apply,60);
setTimeout(apply,350);
setTimeout(apply,900);
}());

(function(){
'use strict';

const NS='http://www.w3.org/2000/svg';
const TABLE_SCALE=1.47;
const TABLE_ORIGINAL_SIDE=456;
const TABLE_ORIGINAL_CELL=24;
const TABLE_ORIGINAL_X=272;
const CENTER=500;
const SHAPE_RADIUS=500;
const ROOT_BACK='referenceBackdropV17';
const ROOT_FRONT='referenceForegroundV17';
const BADGE_TEXT='V17 ACTIVE • reference geometry • table 1.47× • shapes 2 • arrows 6';

const svg=document.getElementById('squareSvg');
const status=document.getElementById('status');
const badge=document.getElementById('v16Badge');
let applying=false;

function S(tag,attrs,textValue){
  const n=document.createElementNS(NS,tag);
  Object.entries(attrs||{}).forEach(([k,v])=>n.setAttribute(k,String(v)));
  if(textValue!==undefined)n.textContent=String(textValue);
  return n;
}

function point(displayAngle,radius){
  const a=(displayAngle-180)*Math.PI/180;
  return {x:CENTER+Math.cos(a)*radius,y:CENTER+Math.sin(a)*radius};
}

function sectorPath(r1,r2,a0,a1){
  const p0=point(a0,r2),p1=point(a1,r2),q1=point(a1,r1),q0=point(a0,r1);
  const large=Math.abs(a1-a0)>180?1:0;
  return `M${p0.x} ${p0.y}A${r2} ${r2} 0 ${large} 1 ${p1.x} ${p1.y}L${q1.x} ${q1.y}A${r1} ${r1} 0 ${large} 0 ${q0.x} ${q0.y}Z`;
}

function polygonPath(points){
  return points.map((q,i)=>(i?'L':'M')+q.x+' '+q.y).join(' ')+' Z';
}

function tangentRotation(displayAngle){
  let rot=displayAngle-90;
  while(rot>180)rot-=360;
  while(rot<=-180)rot+=360;
  if(rot>90)rot-=180;
  if(rot<-90)rot+=180;
  return rot;
}

function addText(parent,label,p,size,fill,weight,rotate,strokeWidth){
  parent.appendChild(S('text',{
    x:p.x,y:p.y,
    'text-anchor':'middle',
    'dominant-baseline':'central',
    'font-family':'Arial,Tahoma,"Segoe UI Symbol",sans-serif',
    'font-size':size,
    'font-weight':weight,
    fill,
    transform:rotate?`rotate(${rotate} ${p.x} ${p.y})`:'',
    'paint-order':'stroke fill',
    stroke:'#fffdf8',
    'stroke-width':strokeWidth,
    'stroke-opacity':.92,
    'vector-effect':'non-scaling-stroke'
  },label));
}

function addLine(parent,a,b,stroke,width,opacity,dash){
  const attrs={
    x1:a.x,y1:a.y,x2:b.x,y2:b.y,
    stroke,
    'stroke-width':width,
    'stroke-opacity':opacity,
    'stroke-linecap':'round',
    'vector-effect':'non-scaling-stroke'
  };
  if(dash)attrs['stroke-dasharray']=dash;
  parent.appendChild(S('line',attrs));
}

function arrowPath(displayAngle,radius,length,width){
  const a=(displayAngle-180)*Math.PI/180;
  const tip=point(displayAngle,radius);
  const base=point(displayAngle,radius-length);
  const px=-Math.sin(a)*width,py=Math.cos(a)*width;
  return `M${tip.x} ${tip.y}L${base.x+px} ${base.y+py}L${base.x-px} ${base.y-py}Z`;
}

function ensureDefs(){
  let defs=svg.querySelector('#referenceDefsV17');
  if(defs)return defs;
  defs=S('defs',{id:'referenceDefsV17'});
  const palette=[
    ['amber','#f5c55f','#9c691a'],
    ['bronze','#c79361','#6e4321'],
    ['teal','#70b6aa','#2f6b63'],
    ['sage','#9ebd78','#4c7133'],
    ['violet','#b4a2ba','#725d7b'],
    ['silver','#e5e3d9','#8b897e'],
    ['blue','#76b5d8','#2d7198'],
    ['rose','#d7928c','#8d4b47']
  ];
  palette.forEach(([id,inner,outer])=>{
    const g=S('radialGradient',{id:'ref-'+id,cx:'32%',cy:'28%',r:'72%'});
    g.appendChild(S('stop',{offset:'0%','stop-color':'#fff','stop-opacity':.95}));
    g.appendChild(S('stop',{offset:'28%','stop-color':inner,'stop-opacity':.98}));
    g.appendChild(S('stop',{offset:'100%','stop-color':outer,'stop-opacity':.98}));
    defs.appendChild(g);
  });
  svg.insertBefore(defs,svg.firstChild);
  return defs;
}

function buildBackdrop(){
  const root=S('g',{id:ROOT_BACK,'pointer-events':'none'});
  const zodiac=[
    ['LEO','#efb4b0'],['VIRGO','#c6e5cb'],['LIBRA','#ddd2ec'],['SCORPIO','#c8e5ef'],
    ['SAGITTARIUS','#efb6b2'],['CAPRICORN','#c8e6cb'],['AQUARIUS','#ded4ed'],['PISCES','#c8e3ef'],
    ['ARIES','#efb4b0'],['TAURUS','#c8e6cc'],['GEMINI','#ddd1ec'],['CANCER','#c8e3ef']
  ];

  root.appendChild(S('circle',{cx:CENTER,cy:CENTER,r:516,fill:'#fffdf8',stroke:'#8e8e88','stroke-width':1.1,'vector-effect':'non-scaling-stroke'}));
  for(let i=0;i<12;i++){
    const start=i*30-15,end=i*30+15;
    root.appendChild(S('path',{
      d:sectorPath(486,516,start,end),
      fill:zodiac[i][1],
      'fill-opacity':.78,
      stroke:'#c7c7c2',
      'stroke-width':.75,
      'vector-effect':'non-scaling-stroke'
    }));
    addText(root,zodiac[i][0],point(i*30,501),10,'#3d3d3a',750,tangentRotation(i*30),.55);
  }

  [486,470,458,446].forEach((r,i)=>root.appendChild(S('circle',{
    cx:CENTER,cy:CENTER,r,
    fill:'none',
    stroke:i===1?'#aaa9a2':'#c9c8c0',
    'stroke-width':i===1?1:.65,
    'vector-effect':'non-scaling-stroke'
  })));

  for(let angle=0;angle<360;angle++){
    const cardinal=angle%90===0;
    const ten=angle%10===0;
    const five=!ten&&angle%5===0;
    const inner=cardinal?438:ten?444:five?450:454;
    addLine(root,point(angle,458),point(angle,inner),cardinal?'#b72e2e':ten?'#d24a4a':five?'#72726e':'#bdbdb7',cardinal?2.1:ten?1.25:five?.75:.4,1);
    if(angle%5===0){
      const labelPoint=point(angle,429);
      addText(root,angle+'°',labelPoint,cardinal?10.2:ten?8.8:7.6,cardinal?'#20201e':ten?'#2f2f2c':'#6f6f69',cardinal?900:ten?800:600,tangentRotation(angle),.65);
    }
  }

  const dates=[
    [0,'21 MAR'],[30,'6 APR'],[60,'22 JUL'],[90,'21 JUN'],
    [120,'21 MAY'],[150,'6 MAY'],[180,'21 APR'],[210,'7 OCT'],
    [240,'22 OCT'],[270,'21 DEC'],[300,'21 NOV'],[330,'6 NOV']
  ];
  dates.forEach(([angle,label],idx)=>{
    const p=point(angle,474);
    const rot=tangentRotation(angle);
    const w=label.length*5.3+12;
    root.appendChild(S('rect',{
      x:p.x-w/2,y:p.y-8,width:w,height:16,rx:7,
      fill:idx%3===0?'#f6d8d6':'#edf6e9',
      'fill-opacity':.92,
      stroke:idx%3===0?'#dc7770':'#72aa68',
      'stroke-width':.8,
      transform:`rotate(${rot} ${p.x} ${p.y})`,
      'vector-effect':'non-scaling-stroke'
    }));
    addText(root,label,p,7.7,idx%3===0?'#782d29':'#335f31',800,rot,.45);
  });

  const red='#e46f72',green='#65ad5f';
  const left=point(0,SHAPE_RADIUS),top=point(90,SHAPE_RADIUS),right=point(180,SHAPE_RADIUS),bottom=point(270,SHAPE_RADIUS);
  const greenTop=point(120,SHAPE_RADIUS),greenBottom=point(240,SHAPE_RADIUS);
  root.appendChild(S('path',{
    d:polygonPath([top,right,bottom,left]),
    fill:red,'fill-opacity':.115,
    stroke:'none'
  }));
  root.appendChild(S('path',{
    d:polygonPath([left,greenTop,greenBottom]),
    fill:green,'fill-opacity':.13,
    stroke:'none'
  }));
  return root;
}

function buildMarker(root,col,row,gradient,radius){
  const scaledCell=TABLE_ORIGINAL_CELL*TABLE_SCALE;
  const scaledX=CENTER-(TABLE_ORIGINAL_SIDE*TABLE_SCALE)/2;
  const x=scaledX+(col+.5)*scaledCell;
  const y=scaledX+(row+.5)*scaledCell;
  root.appendChild(S('circle',{
    cx:x,cy:y,radius,
    r:radius,
    fill:`url(#ref-${gradient})`,
    stroke:'#fff',
    'stroke-width':1.45,
    'stroke-opacity':.9,
    'vector-effect':'non-scaling-stroke',
    'data-reference-marker':'true'
  }));
  root.appendChild(S('circle',{
    cx:x,cy:y,r:Math.max(2,radius-3.2),
    fill:'none',
    stroke:'#45453f',
    'stroke-width':.55,
    'stroke-opacity':.42,
    'vector-effect':'non-scaling-stroke'
  }));
}

function buildForeground(){
  const root=S('g',{id:ROOT_FRONT,'pointer-events':'none'});
  const red='#df6668',green='#54a753',orange='#d19000';
  const left=point(0,SHAPE_RADIUS),top=point(90,SHAPE_RADIUS),right=point(180,SHAPE_RADIUS),bottom=point(270,SHAPE_RADIUS);
  const greenTop=point(120,SHAPE_RADIUS),greenBottom=point(240,SHAPE_RADIUS);

  root.appendChild(S('path',{
    d:polygonPath([top,right,bottom,left]),
    fill:'none',stroke:red,'stroke-width':2.15,'stroke-opacity':.83,
    'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'
  }));
  root.appendChild(S('path',{
    d:polygonPath([left,greenTop,greenBottom]),
    fill:'none',stroke:green,'stroke-width':2.15,'stroke-opacity':.86,
    'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'
  }));
  addLine(root,top,bottom,red,1.8,.68);
  addLine(root,left,right,red,1.8,.68);

  [0,90,180,270].forEach(angle=>{
    root.appendChild(S('path',{
      d:arrowPath(angle,SHAPE_RADIUS,30,11),
      fill:red,stroke:red,'stroke-width':1,'fill-opacity':.9,
      'stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
      'data-reference-arrow':'true'
    }));
  });
  [120,240].forEach(angle=>{
    root.appendChild(S('path',{
      d:arrowPath(angle,SHAPE_RADIUS,27,9),
      fill:green,stroke:green,'stroke-width':1,'fill-opacity':.92,
      'stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
      'data-reference-arrow':'true'
    }));
  });

  [left,top,right,bottom].forEach(p=>root.appendChild(S('circle',{
    cx:p.x,cy:p.y,r:4.3,fill:'#fff',stroke:red,'stroke-width':1.5,
    'vector-effect':'non-scaling-stroke'
  })));
  [greenTop,greenBottom].forEach(p=>root.appendChild(S('circle',{
    cx:p.x,cy:p.y,r:4.0,fill:'#fff',stroke:green,'stroke-width':1.45,
    'vector-effect':'non-scaling-stroke'
  })));

  addText(root,'1/4',point(90,410),13.5,orange,900,0,.9);
  addText(root,'1/2',point(180,455),13.5,orange,900,90,.9);
  addText(root,'3/4',point(270,410),13.5,orange,900,0,.9);
  addText(root,'1/3',point(120,443),12.5,green,900,-60,.85);
  addText(root,'2/3',point(240,443),12.5,green,900,60,.85);

  const markers=[
    [6,0,'amber',11],
    [1,4,'bronze',11],
    [8,6,'teal',10.5],
    [9,9,'sage',10],
    [16,12,'sage',11.5],
    [17,13,'violet',10.5],
    [0,14,'bronze',10],
    [0,15,'amber',10],
    [11,16,'amber',11],
    [14,16,'sage',11],
    [18,16,'bronze',10.5],
    [0,17,'silver',10.5],
    [15,17,'blue',11]
  ];
  markers.forEach(m=>buildMarker(root,...m));

  const planets=[
    [8,'☉','#ca4d45'],[56,'☿','#1d1d1b'],[103,'♀','#1d1d1b'],
    [150,'♂','#4a8a35'],[205,'♄','#1d1d1b'],[258,'♆','#1d1d1b'],
    [314,'♇','#1d1d1b'],[348,'☽','#c94c4b']
  ];
  planets.forEach(([angle,glyph,color])=>{
    const p=point(angle,509);
    root.appendChild(S('circle',{
      cx:p.x,cy:p.y,r:6.6,fill:'#fff','fill-opacity':.82,
      stroke:color,'stroke-width':1.15,'vector-effect':'non-scaling-stroke'
    }));
    addText(root,glyph,p,12,color,900,0,.5);
  });
  return root;
}

function styleSquare(square){
  square.setAttribute('transform',`translate(${CENTER} ${CENTER}) scale(${TABLE_SCALE}) translate(-${CENTER} -${CENTER})`);
  square.dataset.referenceScaleV17=String(TABLE_SCALE);
  const base=square.querySelector('rect');
  if(base){
    base.setAttribute('fill','#fffdf8');
    base.setAttribute('fill-opacity','.46');
    base.setAttribute('stroke','#64645e');
    base.setAttribute('stroke-width','1.1');
  }
  square.querySelectorAll('text').forEach(t=>{
    t.setAttribute('font-family','Arial,Tahoma,sans-serif');
    t.setAttribute('font-weight','750');
    t.setAttribute('fill','#22221f');
    t.setAttribute('stroke-width','.42');
  });
}

function apply(){
  if(applying||!svg||getComputedStyle(svg).display==='none')return false;
  const square=svg.querySelector('#square');
  if(!square)return false;
  applying=true;
  try{
    ensureDefs();
    ['zodiacRing','angleWheel','angleFrames','mainShapes','aspects','moonStrip','cycleCards','optional'].forEach(id=>{
      const n=svg.querySelector('#'+id);
      if(n)n.style.setProperty('display','none','important');
    });

    styleSquare(square);
    svg.querySelector('#'+ROOT_BACK)?.remove();
    svg.querySelector('#'+ROOT_FRONT)?.remove();

    const back=buildBackdrop();
    svg.insertBefore(back,square);
    svg.appendChild(buildForeground());

    if(status)status.textContent='Square of 9 • reference-aligned wheel • 19×19 • 1–361 • red square • green triangle';
    if(badge){
      badge.textContent=BADGE_TEXT;
      badge.style.color='#245f37';
      badge.style.borderColor='#2d7b46';
      badge.style.background='rgba(255,255,255,.94)';
    }
    document.documentElement.dataset.referenceLayoutV17='true';
    return true;
  }finally{
    applying=false;
  }
}

function needsApply(){
  const square=svg?.querySelector('#square');
  return !square||
    square.dataset.referenceScaleV17!==String(TABLE_SCALE)||
    !svg.querySelector('#'+ROOT_BACK)||
    !svg.querySelector('#'+ROOT_FRONT);
}
const observer=new MutationObserver(()=>setTimeout(()=>{if(needsApply())apply();},0));
observer.observe(svg,{childList:true,subtree:false});
setInterval(()=>{if(needsApply())apply();},350);
window.addEventListener('resize',apply);

window.__auditSquare9ReferenceLayoutV17=()=>({
  ok:document.documentElement.dataset.referenceLayoutV17==='true',
  tableScale:svg.querySelector('#square')?.dataset.referenceScaleV17||null,
  tableSide:TABLE_ORIGINAL_SIDE*TABLE_SCALE,
  tableCell:TABLE_ORIGINAL_CELL*TABLE_SCALE,
  backdropPresent:!!svg.querySelector('#'+ROOT_BACK),
  foregroundPresent:!!svg.querySelector('#'+ROOT_FRONT),
  markerCount:svg.querySelectorAll('#'+ROOT_FRONT+' [data-reference-marker="true"]').length,
  arrowCount:svg.querySelectorAll('#'+ROOT_FRONT+' [data-reference-arrow="true"]').length,
  hiddenLegacyLayers:['zodiacRing','angleWheel','angleFrames','mainShapes','aspects','moonStrip','cycleCards','optional']
    .filter(id=>svg.querySelector('#'+id)?.style.display==='none')
});

setTimeout(apply,60);
setTimeout(apply,350);
setTimeout(apply,900);
}());

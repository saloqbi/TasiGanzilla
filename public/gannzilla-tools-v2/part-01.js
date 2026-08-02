(function(){
'use strict';

var NS='http://www.w3.org/2000/svg';
var CX=2200,CY=1800,INNER=180,STEP=110,MAX_WHEELS=13,OUTER=1610;
var frame=document.getElementById('workFrame');
var renderTimer=null,connectTimer=null,activeDoc=null,bound=false;

var state={
  layoutVisible:true,clockwise:true,size:10,view:36,dataType:'Price',
  value:1,find:1,increment:1,
  highlightVisible:false,highlightFill:'Levels',highlightMarks:false,highlightNumbers:false,
  protractorVisible:false,protractorClockwise:true,protractorAngle:0,
  counterVisible:true,counterWheel:3,counterStart:1,counterCount:36,counterIncrement:1,counterFontSize:24,
  secondaryOneVisible:false,secondaryOneWheel:3,secondaryOneDivisions:36,secondaryOneOffset:0,secondaryOneLabels:false,
  markerOneVisible:false,markerOneWheel:3,markerOneValue:1,markerOneShape:'Diamond',
  chronoVisible:false,chronoClockwise:true,chronoAngle:0,chronoRange:'Annual',
  secondaryTwoVisible:false,secondaryTwoWheel:13,secondaryTwoDivisions:36,secondaryTwoOffset:0,secondaryTwoLabels:false,
  markerTwoVisible:false,markerTwoWheel:13,markerTwoValue:1,markerTwoShape:'Triangle'
};

function num(v,f){var x=Number(String(v==null?'':v).replace(/[^0-9.+-]/g,''));return Number.isFinite(x)?x:f;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function byLabel(label){return document.querySelector('[aria-label="'+label+'"]');}
function section(name){return Array.prototype.find.call(document.querySelectorAll('.control-section'),function(s){var n=s.querySelector('.section-name');return n&&n.textContent.trim()===name;});}
function sectionAll(name){return Array.prototype.filter.call(document.querySelectorAll('.control-section'),function(s){var n=s.querySelector('.section-name');return n&&n.textContent.trim()===name;});}
function body(s){return s&&s.querySelector('.section-body');}
function row(label,control){return '<div class="control-row"><div class="control-label">'+label+'</div><div class="control-value">'+control+'</div></div>';}
function option(v,label){return '<option value="'+v+'">'+(label||v)+'</option>';}
function setExpanded(s,yes){if(!s)return;s.classList.toggle('collapsed',!yes);var b=s.querySelector('.section-toggle'),sign=s.querySelector('.section-sign');if(b)b.setAttribute('aria-expanded',yes?'true':'false');if(sign)sign.textContent=yes?'−':'+';}
function setValue(el,v){if(!el)return;if(el.type==='checkbox')el.checked=!!v;else el.value=v;}
function setStatus(text,kind){var el=document.querySelector('.panel-bottom');if(!el)return;el.textContent=text;el.dataset.status=kind||'waiting';}
function getDoc(){try{var d=frame&&frame.contentDocument;return d&&d.getElementById('wheel')?d:null;}catch(e){return null;}}
function polar(r,deg){var a=deg*Math.PI/180;return{x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r};}
function inner(w){return INNER+(clamp(Math.round(w),1,MAX_WHEELS)-1)*STEP;}
function outer(w){return inner(w)+STEP;}
function radius(w){return inner(w)+STEP/2;}
function dir(clockwise){return clockwise?1:-1;}
function angle(slot,count,clockwise,offset){return -90+dir(clockwise)*(slot*360/count)+(offset||0);}
function colorClass(value){var m=((Math.round(value)%3)+3)%3;return m===1?'number-red':m===2?'number-blue':'number-black';}
function clear(g){while(g&&g.firstChild)g.removeChild(g.firstChild);}
function svg(doc,name,attrs,parent){var el=doc.createElementNS(NS,name);Object.keys(attrs||{}).forEach(function(k){el.setAttribute(k,String(attrs[k]));});if(parent)parent.appendChild(el);return el;}
function valueForSlot(slot,count,start,inc){return slot===0?start+(count-1)*inc:start+(slot-1)*inc;}
function slotForValue(value,start,inc,count){if(!inc)return 0;var k=Math.round((value-start)/inc);if(k<0||k>=count)return -1;return k===count-1?0:k+1;}
function format(v){if(state.dataType==='Angle')return Math.round(v)+'°';if(state.dataType==='Time'){var t=Math.abs(Math.round(v)),h=Math.floor(t/60)%24,m=t%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}return Number.isInteger(v)?String(v):String(Number(v.toFixed(4)));}
function sectorPath(r1,r2,a1,a2){var p1=polar(r2,a1),p2=polar(r2,a2),p3=polar(r1,a2),p4=polar(r1,a1),large=Math.abs(a2-a1)>180?1:0,sweep=a2>=a1?1:0;return'M '+p1.x+' '+p1.y+' A '+r2+' '+r2+' 0 '+large+' '+sweep+' '+p2.x+' '+p2.y+' L '+p3.x+' '+p3.y+' A '+r1+' '+r1+' 0 '+large+' '+(sweep?0:1)+' '+p4.x+' '+p4.y+' Z';}
function arcPath(r,a1,a2){var p1=polar(r,a1),p2=polar(r,a2),large=Math.abs(a2-a1)>180?1:0,sweep=a2>=a1?1:0;return'M '+p1.x+' '+p1.y+' A '+r+' '+r+' 0 '+large+' '+sweep+' '+p2.x+' '+p2.y;}

function installStyle(doc){
  if(doc.getElementById('gannToolsV2Style'))return;
  var st=doc.createElement('style');st.id='gannToolsV2Style';
  st.textContent=
  '.gann-v2-number{font-family:Arial,Tahoma,sans-serif;font-weight:800;text-anchor:middle;dominant-baseline:central;direction:ltr;unicode-bidi:bidi-override;paint-order:stroke fill;stroke:#E7CB84;stroke-width:1.05;stroke-opacity:.72;filter:drop-shadow(0 1px 0 rgba(255,255,255,.82));pointer-events:none}'+
  '.gann-v2-ray{stroke:#607985;stroke-width:1.4;opacity:.82;vector-effect:non-scaling-stroke}'+
  '.gann-v2-red{fill:none;stroke:#B21F2D;stroke-width:4;vector-effect:non-scaling-stroke}'+
  '.gann-v2-blue{fill:none;stroke:#174B98;stroke-width:3.5;stroke-dasharray:12 7;ve
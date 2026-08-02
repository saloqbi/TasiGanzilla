nction syncPanel(){
  var mapping=[
    ['Layout visible','layoutVisible'],['Layout clockwise','clockwise'],['Size','size'],['View','view'],['Data type','dataType'],
    ['Value','value'],['Find','find'],['Increment','increment'],['Highlight visible','highlightVisible'],['Highlight fill','highlightFill'],
    ['Show marks','highlightMarks'],['Show numbers','highlightNumbers'],['Protractor visible','protractorVisible'],['Protractor clockwise','protractorClockwise'],
    ['Protractor angle','protractorAngle'],['Chronometer visible','chronoVisible'],['Chronometer clockwise','chronoClockwise'],['Chronometer angle','chronoAngle'],['Chronometer range','chronoRange']
  ];
  mapping.forEach(function(pair){setInput(qLabel(pair[0]),state[pair[1]]);});
  Object.keys(state).forEach(function(key){var el=document.getElementById(key);if(el)setInput(el,state[key]);});
  var counter=sections('Counter')[0],badge=counter&&counter.querySelector('.compact-badge');if(badge)badge.textContent=String(state.counterCount);
}
function changed(){saveState();syncPanel();scheduleRender();}

function getDoc(){try{return frame&&frame.contentDocument&&frame.contentDocument.getElementById('wheel')?frame.contentDocument:null;}catch(error){return null;}}
function centerWheel(){try{var doc=getDoc(),win=frame.contentWindow;if(!doc||!win)return;win.scrollTo(Math.max(0,(doc.documentElement.scrollWidth-win.innerWidth)/2),Math.max(0,(doc.documentElement.scrollHeight-win.innerHeight)/2));}catch(error){}}
function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(function(){renderQueued=false;renderAll();});}
function ensureStyle(doc){
  if(doc.getElementById('gannzillaToolsStyleV1'))return;
  var style=doc.createElement('style');style.id='gannzillaToolsStyleV1';
  style.textContent=
    '.gann-tool-number{font-family:Arial,Tahoma,sans-serif;font-weight:800;text-anchor:middle;dominant-baseline:central;direction:ltr;unicode-bidi:bidi-override;paint-order:stroke fill;stroke:#E7CB84;stroke-width:1.05;stroke-opacity:.72;vector-effect:non-scaling-stroke;filter:drop-shadow(0 1px 0 rgba(255,255,255,.82));pointer-events:none}'+
    '.gann-layout-ray{stroke:#607985;stroke-width:1.3;opacity:.8;vector-effect:non-scaling-stroke}'+
    '.gann-tool-line{fill:none;stroke:#B21F2D;stroke-width:4;vector-effect:non-scaling-stroke;filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}'+
    '.gann-tool-line-blue{fill:none;stroke:#174B98;stroke-width:3.5;stroke-dasharray:12 7;vector-effect:non-scaling-stroke;filter:drop-shadow(0 1px 1px rgba(0,0,0,.28))}'+
    '.gann-tool-arc{fill:none;stroke:#B21F2D;stroke-width:5;opacity:.9;vector-effect:non-scaling-stroke}'+
    '.gann-tool-arc-blue{fill:none;stroke:#174B98;stroke-width:4;stroke-dasharray:10 6;opacity:.9;vector-effect:non-scaling-stroke}'+
    '.gann-highlight{fill:#F5D76E;fill-opacity:.34;stroke:#C88B16;stroke-width:2;vector-effect:non-scaling-stroke}'+
    '.gann-highlight-ring{fill:none;stroke:#F5D76E;stroke-opacity:.38;vector-effect:non-scaling-stroke}'+
    '.gann-tool-label{font-family:Arial,Tahoma,sans-serif;font-size:25px;font-weight:900;text-anchor:middle;dominant-baseline:central;paint-order:stroke fill;stroke:#F7F1E3;stroke-width:4;fill:#17191B;pointer-events:none}'+
    '.gann-scale-tick{stroke:#314850;stroke-width:1.5;vector-effect:non-scaling-stroke}'+
    '.gann-scale-label{font-family:Arial,Tahoma,sans-serif;font-size:14px;font-weight:800;text-anchor:middle;dominant-baseline:central;fill:#314850;pointer-events:none}'+
    '.gann-marker{fill:#F8D55A;stroke:#7A4B00;stroke-width:3;vector-effect:non-scaling-stroke;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}';
  doc.head.appendChild(style);
}
function ensureRoot(doc){
  var svg=doc.getElementById('wheel'),root=doc.getElementById('gannzillaToolsRootV1');
  if
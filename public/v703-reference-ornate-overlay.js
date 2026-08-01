(function(){
'use strict';
if(window.__gannzillaReferenceOrnateOverlayV703)return;
window.__gannzillaReferenceOrnateOverlayV703=true;
var OVERLAY_ID='gannzilla-reference-ornate-overlay-v703';
var ASSET='/assets/v703-ornate-reference-frame.png?v=703';
var wheel=null,overlay=null,raf=0,applyCount=0,lastApply=null;
function findWheel(){var preferred=document.querySelector('canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"],canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"],canvas[data-gannzilla-empty-outer-ring-v518="true"],canvas[data-gannzilla-final-wheel-authority-v506="true"]');if(preferred instanceof HTMLCanvasElement&&!preferred.closest('aside'))return preferred;return Array.from(document.querySelectorAll('canvas')).filter(function(c){return !c.closest('aside')&&c.width>300&&c.height>300;}).sort(function(a,b){return b.width*b.height-a.width*a.height;})[0]||null;}
function create(){if(overlay&&overlay.isConnected)return overlay;overlay=document.createElement('img');overlay.id=OVERLAY_ID;overlay.alt='';overlay.setAttribute('aria-hidden','true');overlay.draggable=false;overlay.src=ASSET;overlay.style.cssText='position:fixed;pointer-events:none;user-select:none;max-width:none;max-height:none;z-index:2147483000;object-fit:fill;transform:translateZ(0);transform-origin:center center;image-rendering:auto;';document.body.appendChild(overlay);return overlay;}
function apply(source){raf=0;wheel=findWheel();if(!(wheel instanceof HTMLCanvasElement))return false;var r=wheel.getBoundingClientRect();var size=Math.min(r.width,r.height)*1.11;if(!(size>300))return false;var x=r.left+r.width/2,y=r.top+r.height/2,img=create();img.style.left=(x-size/2)+'px';img.style.top=(y-size/2)+'px';img.style.width=size+'px';img.style.height=size+'px';img.style.display='block';img.style.opacity='1';img.style.visibility='visible';applyCount++;lastApply={source:source||'apply',build:703,wheelWidth:r.width,overlaySize:size,centerX:x,centerY:y,assetLoaded:!!(img.complete&&img.naturalWidth>0),at:Date.now()};return true;}
function schedule(source){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){apply(source);});}
['resize','scroll','wheel','pointermove','gannzilla:wheel-ivory-champagne-final-authority-v682','gannzilla:outer-empty-ring-mirror-silver-v668','gannzilla:empty-outer-ring-v518','gannzilla:native-dpr-zoom-v504'].forEach(function(n){addEventListener(n,function(){schedule(n);},true);});
[0,80,180,360,700,1300,2400,4200,7000].forEach(function(d){setTimeout(function(){schedule('boot-'+d);},d);});setInterval(function(){schedule('watch');},500);
window.__auditGannzillaReferenceOrnateOverlayV703=function(){return{ok:!!(overlay&&overlay.isConnected&&overlay.complete&&overlay.naturalWidth>0&&overlay.style.display!=='none'),build:703,applyCount:applyCount,lastApply:lastApply};};
}());

(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
var STORAGE_KEY='kawkabat-gannzilla-tools-v1';
var BASE_WIDTH=3960,BASE_HEIGHT=3240,CX=2200,CY=1800,INNER=180,STEP=110,MAX_WHEELS=13,OUTER=1610;
var defaults={
  layoutVisible:true,clockwise:true,size:10,view:36,dataType:'Price',
  value:1,find:1,increment:1,
  highlightVisible:false,highlightFill:'Cell',highlightMarks:false,highlightNumbers:false,
  protractorVisible:false,protractorClockwise:true,protractorAngle:0,
  counterVisible:true,counterWheel:3,counterStart:1,counterCount:36,counterIncrement:1,counterFontSize:24,
  secondaryOneVisible:false,secondaryOneWheel:3,secondaryOneDivisions:36,secondaryOneOffset:0,secondaryOneLabels:false,
  markerOneVisible:false,markerOneWheel:3,markerOneValue:1,markerOneShape:'Diamond',
  chronoVisible:false,chronoClockwise:true,chronoAngle:0,chronoRange:'Annual',
  secondaryTwoVisible:false,secondaryTwoWheel:13,secondaryTwoDivisions:36,secondaryTwoOffset:0,secondaryTwoLabels:false,
  markerTwoVisible:false,markerTwoWheel:13,markerTwoValue:0,markerTwoShape:'Triangle'
};
var state=loadState(),frame=document.getElementById('workFrame'),activeDoc=null,renderQueued=false,connectTimer=null,clockTimer=null;

function cloneDefaults(){return JSON.parse(JSON.stringify(defaults));}
function loadState(){try{var saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return Object.assign(cloneDefaults(),saved||{});}catch(error){return cloneDefaults();}}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(error){}}
function n(value,fallback){var x=Number(String(value==null?'':value).replace(/[^0-9.+-]/g,''));return Number.isFinite(x)?x:fallback;}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function qLabel(label){return document.querySelector('[aria-label="'+label+'"]');}
function sections(name){return Array.prototype.filter.call(document.querySelectorAll('.control-section'),function(section){var node=section.querySelector('.section-name');return node&&node.textContent.trim()===name;});}
function bodyFor(section){return section&&section.querySelector('.section-body');}
function row(label,control){return '<div class="control-row"><div class="control-label">'+label+'</div><div class="control-value">'+control+'</div></div>';}
function setExpanded(section,expanded){if(!section)return;section.classList.toggle('collapsed',!expanded);var button=section.querySelector('.section-toggle'),sign=section.querySelector('.section-sign');if(button)button.setAttribute('aria-expanded',expanded?'true':'false');if(sign)sign.textContent=expanded?'−':'+';}
function option(value,label){return '<option value="'+value+'">'+(label||value)+'</option>';}
function setOptions(select,items){if(!select)return;var selected=select.value;select.innerHTML=items.map(function(item){return option(item[0],item[1]);}).join('');if(Array.prototype.some.call(select.options,function(o){return o.value===selected;}))select.value=selected;}
function setInput(input,value){if(!input)return;if(input.type==='checkbox')input.checked=!!value;else input.value=value;}
function status(text,ready){var bottom=document.querySelector('.panel-bottom');if(!bottom)return;bottom.textContent=text;bottom.dataset.status=ready?'ready':'waiting';}

function preparePanel(){
  var view=qLabel('View'),type=qLabel('Data type'),fill=qLabel('Highlight fill'),range=qLabel('Chronometer range');
  setOptions(view,[[12,'Circle of 12'],[18,'Circle of 18'],[24,'Circle of 24'],[36,'Circle of 36'],[72,'Circle of 72']]);
  setOptions(type,[['Price','Price'],['Number','Number'],['Angle','Angle'],['Time','Time']]);
  setOptions(fill,[['Cell','Cell'],['Levels','Levels'],['Spoke','Spoke'],['Ring','Ring']]);
  setOptions(range,[['Manual','Manual'],['Annual','Annual']
vels')+option('Spoke')+option('Ring');
  if(range)range.innerHTML=option('Manual')+option('Annual')+option('Monthly')+option('Weekly')+option('Daily')+option('Hourly')+option('Live');

  var c=section('Counter');if(c){body(c).innerHTML=row('Visible','<input id="counterVisible" type="checkbox">')+row('Wheel','<input id="counterWheel" type="number" min="1" max="13">')+row('Start','<input id="counterStart" type="number">')+row('Count','<input id="counterCount" type="number" min="1" max="360">')+row('Increment','<input id="counterIncrement" type="number">')+row('Font size','<input id="counterFontSize" type="number" min="10" max="48">');setExpanded(c,true);}
  var scales=sectionAll('Secondary scale');
  if(scales[0])body(scales[0]).innerHTML=row('Visible','<input id="secondaryOneVisible" type="checkbox">')+row('Wheel','<input id="secondaryOneWheel" type="number" min="1" max="13">')+row('Divisions','<input id="secondaryOneDivisions" type="number" min="4" max="360">')+row('Offset','<input id="secondaryOneOffset" type="number">')+row('Labels','<input id="secondaryOneLabels" type="checkbox">');
  if(scales[1])body(scales[1]).innerHTML=row('Visible','<input id="secondaryTwoVisible" type="checkbox">')+row('Wheel','<input id="secondaryTwoWheel" type="number" min="1" max="13">')+row('Divisions','<input id="secondaryTwoDivisions" type="number" min="4" max="360">')+row('Offset','<input id="secondaryTwoOffset" type="number">')+row('Labels','<input id="secondaryTwoLabels" type="checkbox">');
  var markers=sectionAll('Marker');
  if(markers[0])body(markers[0]).innerHTML=row('Visible','<input id="markerOneVisible" type="checkbox">')+row('Wheel','<input id="markerOneWheel" type="number" min="1" max="13">')+row('Value','<input id="markerOneValue" type="number">')+row('Shape','<select id="markerOneShape">'+option('Diamond')+option('Triangle')+option('Circle')+'</select>');
  if(markers[1])body(markers[1]).innerHTML=row('Visible','<input id="markerTwoVisible" type="checkbox">')+row('Wheel','<input id="markerTwoWheel" type="number" min="1" max="13">')+row('Value','<input id="markerTwoValue" type="number">')+row('Shape','<select id="markerTwoShape">'+option('Triangle')+option('Diamond')+option('Circle')+'</select>');

  [
    ['Layout visible','layoutVisible'],['Layout clockwise','clockwise'],['Size','size'],['View','view'],['Data type','dataType'],
    ['Value','value'],['Find','find'],['Increment','increment'],
    ['Highlight visible','highlightVisible'],['Highlight fill','highlightFill'],['Show marks','highlightMarks'],['Show numbers','highlightNumbers'],
    ['Protractor visible','protractorVisible'],['Protractor clockwise','protractorClockwise'],['Protractor angle','protractorAngle'],
    ['Chronometer visible','chronoVisible'],['Chronometer clockwise','chronoClockwise'],['Chronometer angle','chronoAngle'],['Chronometer range','chronoRange']
  ].forEach(function(x){bind(byLabel(x[0]),x[1]);});
  [
    'counterVisible','counterWheel','counterStart','counterCount','counterIncrement','counterFontSize',
    'secondaryOneVisible','secondaryOneWheel','secondaryOneDivisions','secondaryOneOffset','secondaryOneLabels',
    'markerOneVisible','markerOneWheel','markerOneValue','markerOneShape',
    'secondaryTwoVisible','secondaryTwoWheel','secondaryTwoDivisions','secondaryTwoOffset','secondaryTwoLabels',
    'markerTwoVisible','markerTwoWheel','markerTwoValue','markerTwoShape'
  ].forEach(function(id){bind(document.getElementById(id),id);});

  var find=byLabel('Find');if(find&&find.parentElement){var action=find.parentElement.querySelector('.field-action');if(action)action.addEventListener('click',function(){state.highlightVisible=true;state.markerOneVisible=true;state.markerOneValue=state.find;sync();queue();});}
  document.querySelectorAll('.panel-action').forEach(function(el,i){el.style.cursor='pointer';el.addEventListener('click',function(){if(i===0)state.size=clamp(state.size+1,1,30);else if(i===1)state.size=clamp(state.size-1,1,30);else if(i===2){state.counterVisible=true;state.counterWheel=3;state.counterStart=1;state.counterCount=36;state.counterIncrement=1;state.counterFontSize=24;}else{state.size=10;centerWheel();}sync();queue();});});
  var info=document.querySelector('.panel-info');if(info){info.style.cursor='pointer';info.addEventListener('click',function(){renderAll();});}
  sync();bound=true;setStatus('Starting tools…','waiting');queue();
}
window.__auditKawkabatGannzillaToolsV2=function(){var d=getDoc(),g=d&&d.getElementById('gannV2_counter'),root=d&&d.getElementById('gannToolsV2Root');return{ok:!!d&&!!root&&!!g&&g.children.length===36,engine:'GANNZILLA_TOOLS_V2',wheelConnected:!!d,counterWheel:state.counterWheel,counterNumbers:g?g.children.length:0,status:(document.querySelector('.panel-bottom')||{}).textContent||''};};

window.addEventListener('error',function(e){setStatus('Tools error: '+String(e.message||'unknown'),'error');});
preparePanel();
if(frame)frame.addEventListener('load',function(){activeDoc=null;setTimeout(function(){queue();centerWheel();},100);});
connectTimer=setInterval(function(){var d=getDoc();if(d!==activeDoc||!d||!d.getElementById('gannToolsV2Root'))queue();},300);
setInterval(function(){if(state.chronoVisible&&state.chronoRange!=='Manual')queue();},1000);
}());
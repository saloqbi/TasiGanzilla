tor angle','protractorAngle'],
    ['Chronometer visible','chronoVisible'],['Chronometer clockwise','chronoClockwise'],['Chronometer angle','chronoAngle'],['Chronometer range','chronoRange']
  ];
  mapping.forEach(function(pair){var el=qLabel(pair[0]);setInput(el,state[pair[1]]);bind(el,pair[1]);});
  [
    ['counterVisible','counterVisible'],['counterWheel','counterWheel'],['counterStart','counterStart'],['counterCount','counterCount'],['counterIncrement','counterIncrement'],['counterFontSize','counterFontSize'],
    ['secondaryOneVisible','secondaryOneVisible'],['secondaryOneWheel','secondaryOneWheel'],['secondaryOneDivisions','secondaryOneDivisions'],['secondaryOneOffset','secondaryOneOffset'],['secondaryOneLabels','secondaryOneLabels'],
    ['markerOneVisible','markerOneVisible'],['markerOneWheel','markerOneWheel'],['markerOneValue','markerOneValue'],['markerOneShape','markerOneShape'],
    ['secondaryTwoVisible','secondaryTwoVisible'],['secondaryTwoWheel','secondaryTwoWheel'],['secondaryTwoDivisions','secondaryTwoDivisions'],['secondaryTwoOffset','secondaryTwoOffset'],['secondaryTwoLabels','secondaryTwoLabels'],
    ['markerTwoVisible','markerTwoVisible'],['markerTwoWheel','markerTwoWheel'],['markerTwoValue','markerTwoValue'],['markerTwoShape','markerTwoShape']
  ].forEach(function(pair){var el=document.getElementById(pair[0]);setInput(el,state[pair[1]]);bind(el,pair[1]);});

  var findInput=qLabel('Find');
  if(findInput&&findInput.parentElement){var action=findInput.parentElement.querySelector('.field-action');if(action)action.addEventListener('click',function(){state.highlightVisible=true;setInput(qLabel('Highlight visible'),true);state.markerOneVisible=true;setInput(document.getElementById('markerOneVisible'),true);state.markerOneValue=state.find;setInput(document.getElementById('markerOneValue'),state.find);changed();});}

  document.querySelectorAll('.panel-action').forEach(function(node,index){
    node.setAttribute('role','button');node.tabIndex=0;
    function run(){
      if(index===0){state.size=clamp(n(state.size,10)+1,1,30);}
      else if(index===1){state.size=clamp(n(state.size,10)-1,1,30);}
      else if(index===2){state=cloneDefaults();syncPanel();}
      else if(index===3){state.size=10;syncPanel();centerWheel();}
      setInput(qLabel('Size'),state.size);changed();
    }
    node.addEventListener('click',run);node.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});
  });
  var info=document.querySelector('.panel-info');
  if(info)info.addEventListener('click',function(){var audit=window.__auditKawkabatGannzillaToolsV1();status(audit.ok?'Connected • '+audit.activeTools+' active tools • '+audit.counterNumbers+' counter numbers':'Waiting for wheel engine…',audit.ok);});
  syncPanel();
}

function bind(el,key){
  if(!el)return;
  function apply(){
    var value=el.type==='checkbox'?el.checked:(el.tagName==='SELECT'?el.value:n(el.value,state[key]));
    if(key==='view')value=clamp(Math.round(n(value,36)),4,360);
    if(key==='size')value=clamp(n(value,10),1,30);
    if(/Wheel$/.test(key)||key.indexOf('Wheel')>=0)value=clamp(Math.round(n(value,3)),1,MAX_WHEELS);
    if(key.indexOf('Divisions')>=0||key==='counterCount')value=clamp(Math.round(n(value,36)),1,360);
    if(key==='counterFontSize')value=clamp(n(value,24),10,48);
    state[key]=value;
    if(key==='value'){state.counterStart=value;setInput(document.getElementById('counterStart'),value);}
    if(key==='increment'){state.counterIncrement=value;setInput(document.getElementById('counterIncrement'),value);}
    if(key==='find'){state.markerOneValue=value;setInput(document.getElementById('markerOneValue'),value);}
    changed();
  }
  el.addEventListener('input',apply);el.addEventListener('change',apply);
}
fu
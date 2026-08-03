(function(){
  'use strict';

  var NS='http://www.w3.org/2000/svg';
  var cx=2200,cy=1800;
  var params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  var wheel=document.getElementById('wheel');
  var angleFrame=document.getElementById('angleFrame');
  if(!wheel||!angleFrame)return;

  function bool(name,fallback){
    var value=params.get(name);
    if(value===null)return !!fallback;
    return value==='1'||value==='true'||value==='on';
  }
  function num(name,fallback){
    var value=Number(String(params.get(name)==null?fallback:params.get(name)).replace(',','.'));
    return Number.isFinite(value)?value:fallback;
  }
  function text(name,fallback){
    var value=params.get(name);
    return value===null?fallback:String(value);
  }
  function make(name,attrs){
    var node=document.createElementNS(NS,name);
    Object.keys(attrs||{}).forEach(function(key){node.setAttribute(key,String(attrs[key]));});
    return node;
  }
  function polar(radius,degree){
    var radians=degree*Math.PI/180;
    return {x:cx+Math.cos(radians)*radius,y:cy+Math.sin(radians)*radius};
  }
  function normalize(degree){
    var value=degree%360;
    return value<0?value+360:value;
  }
  function layer(id,label,before){
    var old=document.getElementById(id);
    if(old)old.remove();
    var group=make('g',{id:id,'aria-label':label,'pointer-events':'none'});
    wheel.insertBefore(group,before||angleFrame);
    return group;
  }
  function addCircle(group,radius,stroke,width,opacity,dash){
    var node=make('circle',{cx:cx,cy:cy,r:radius,fill:'none',stroke:stroke,'stroke-width':width,'stroke-opacity':opacity,'vector-effect':'non-scaling-stroke'});
    if(dash)node.setAttribute('stroke-dasharray',dash);
    group.appendChild(node);
    return node;
  }
  function addLine(group,x1,y1,x2,y2,stroke,width,opacity,dash){
    var node=make('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:stroke,'stroke-width':width,'stroke-opacity':opacity,'stroke-linecap':'round','vector-effect':'non-scaling-stroke'});
    if(dash)node.setAttribute('stroke-dasharray',dash);
    group.appendChild(node);
    return node;
  }
  function addText(group,value,radius,degree,size,fill,weight){
    var point=polar(radius,degree);
    var rotation=normalize(degree+90);
    if(rotation>90&&rotation<270)rotation+=180;
    var node=make('text',{
      x:point.x,y:point.y,
      'text-anchor':'middle','dominant-baseline':'central',
      'font-family':'Arial,Tahoma,sans-serif','font-size':size,'font-weight':weight||800,
      fill:fill||'#17191B',transform:'rotate('+rotation+' '+point.x+' '+point.y+')',
      'paint-order':'stroke fill',stroke:'#F7F1E3','stroke-width':'1.2','stroke-opacity':'0.9',
      'vector-effect':'non-scaling-stroke'
    });
    node.textContent=value;
    group.appendChild(node);
    return node;
  }
  function addTriangle(group,radius,degree,color,size,label){
    var point=polar(radius,degree),radians=degree*Math.PI/180;
    var tangentX=-Math.sin(radians),tangentY=Math.cos(radians),normalX=Math.cos(radians),normalY=Math.sin(radians);
    var tip={x:point.x+normalX*size,y:point.y+normalY*size};
    var left={x:point.x-tangentX*size*.62,y:point.y-tangentY*size*.62};
    var right={x:point.x+tangentX*size*.62,y:point.y+tangentY*size*.62};
    var node=make('path',{
      d:'M '+tip.x+' '+tip.y+' L '+left.x+' '+left.y+' L '+right.x+' '+right.y+' Z',
      fill:color,stroke:'#2B1608','stroke-width':'2.5','vector-effect':'non-scaling-stroke'
    });
    node.style.filter='drop-shadow(0 0 6px rgba(0,0,0,.38))';
    group.appendChild(node);
    if(label)addText(group,label,radius+size+18,degree,18,color,900);
  }
  function polygonPath(radius){
    var points=[];
    for(var index=0;index<4;index+=1){
      var point=polar(radius,-45+index*90);
      points.push((index?'L ':'M ')+point.x+' '+point.y);
    }
    return points.join(' ')+' Z';
  }
  function formatDecimal(value){
    var fixed=Number(value).toFixed(8).replace(/\.?0+$/,'');
    return fixed==='-0'?'0':fixed;
  }

  /* Find */
  var rawFind=String(params.get('find')||'').trim().replace(',','.');
  var findValue=Number(rawFind),hasFind=rawFind!==''&&Number.isFinite(findValue),found=null;
  if(hasFind){
    var candidates=wheel.querySelectorAll('[data-price-value]');
    Array.prototype.some.call(candidates,function(node){
      var value=Number(node.getAttribute('data-price-value'));
      if(Number.isFinite(value)&&Math.abs(value-findValue)<=Math.max(1e-9,Math.abs(findValue)*1e-10)){
        found=node;
        return true;
      }
      return false;
    });
  }
  document.documentElement.dataset.findRequested=hasFind?'true':'false';
  document.documentElement.dataset.findFound=found?'true':'false';
  if(found){
    var findLayer=layer('findHighlightLayer','Find highlight '+rawFind);
    var box=found.getBBox();
    var findRect=make('rect',{
      x:box.x-14,y:box.y-10,width:box.width+28,height:box.height+20,
      rx:Math.max(10,(box.height+20)/2),fill:'#FFD86A','fill-opacity':'0.24',
      stroke:'#B87900','stroke-width':'4','vector-effect':'non-scaling-stroke'
    });
    findRect.style.filter='drop-shadow(0 0 8px rgba(255,190,0,.9))';
    findLayer.appendChild(findRect);
    window.setTimeout(function(){
      var rect=found.getBoundingClientRect(),root=document.scrollingElement||document.documentElement;
      root.scrollLeft+=rect.left+rect.width/2-window.innerWidth/2;
      root.scrollTop+=rect.top+rect.height/2-window.innerHeight/2;
    },180);
  }

  /* Highlight */
  var highlightVisible=bool('highlight',false);
  var highlightFill=text('highlightFill','levels').toLowerCase();
  var highlightMarks=bool('highlightMarks',false);
  var highlightNumbers=bool('highlightNumbers',false);
  var view=text('view','circle36');
  var squareMode=view==='square4'||view==='square9'||view==='permanentSquare'||view==='tetragon';
  var divisionCount=view==='circle12'?12:view==='circle24'?24:(view==='square4'||view==='tetragon'?4:(view==='square9'||view==='permanentSquare'?9:36));
  var startValue=num('value',0.01),increment=num('increment',1);
  if(increment===0)increment=1;
  if(highlightVisible){
    var highlightLayer=layer('highlightLayer','Highlight '+highlightFill,document.getElementById('numbersCycle1')||angleFrame);
    if(highlightFill==='cross'){
      addLine(highlightLayer,590,cy,3810,cy,'#D49A32',104,.13);
      addLine(highlightLayer,cx,190,cx,3410,'#4E8EAE',104,.11);
      addLine(highlightLayer,590,cy,3810,cy,'#FFF1C0',3,.52);
      addLine(highlightLayer,cx,190,cx,3410,'#E9F7FF',3,.52);
      [{degree:-90,label:'0°'},{degree:0,label:'90°'},{degree:90,label:'180°'},{degree:180,label:'270°'}].forEach(function(item){
        var point=polar(1580,item.degree);
        if(highlightMarks)highlightLayer.appendChild(make('circle',{cx:point.x,cy:point.y,r:10,fill:'#FFD86A',stroke:'#8A5A00','stroke-width':3,'vector-effect':'non-scaling-stroke'}));
        if(highlightNumbers)addText(highlightLayer,item.label,1542,item.degree,18,'#17191B',900);
      });
    }else{
      for(var level=1;level<=10;level+=1){
        var radius=455+(level-1)*110,color=level%2?'#E0B044':'#4E8EAE';
        if(squareMode){
          highlightLayer.appendChild(make('path',{d:polygonPath(radius),fill:'none',stroke:color,'stroke-width':94,'stroke-opacity':level%2?'.11':'.075','stroke-linejoin':'round','vector-effect':'non-scaling-stroke'}));
        }else{
          addCircle(highlightLayer,radius,color,94,level%2?.11:.075);
        }
        var point=polar(radius,-90);
        if(highlightMarks)highlightLayer.appendChild(make('circle',{cx:point.x,cy:point.y,r:10,fill:'#FFD86A',stroke:'#8A5A00','stroke-width':3,'vector-effect':'non-scaling-stroke'}));
        if(highlightNumbers){
          var endOrdinal=level*divisionCount;
          addText(highlightLayer,formatDecimal(startValue+(endOrdinal-1)*increment),radius,-90,18,'#17191B',900);
        }
      }
    }
  }

  /* Protractor */
  var proVisible=bool('protractorVisible',false),proClockwise=bool('protractorClockwise',true),proAngle=num('protractorAngle',0),proSign=proClockwise?1:-1;
  var counterVisible=bool('counterVisible',false),counterClockwise=bool('counterClockwise',true),counterStart=num('counterStart',1),counterStep=num('counterStep',1),counterOffset=Math.max(20,num('counterRadius',34)),counterFont=Math.max(8,num('counterFontSize',11));
  var proSecondaryVisible=bool('proSecondaryVisible',false),proSecondaryClockwise=bool('proSecondaryClockwise',true),proSecondaryStart=num('proSecondaryStart',0),proSecondaryIncrement=num('proSecondaryIncrement',10),proSecondaryDivisions=Math.max(4,Math.round(num('proSecondaryDivisions',36))),proSecondaryOffset=Math.max(25,num('proSecondaryRadius',60)),proSecondaryFont=Math.max(8,num('proSecondaryFontSize',10));
  var proMarkerVisible=bool('proMarkerVisible',false),proMarkerAngle=num('proMarkerAngle',0),proMarkerRadius=num('proMarkerRadius',0),proMarkerColor=text('proMarkerColor','#e93020'),proMarkerWidth=Math.max(12,num('proMarkerWidth',24)),proMarkerLabel=text('proMarkerLabel','');
  if(proVisible){
    var proLayer=layer('protractorRuntimeLayer','Protractor');
    var proRadius=1480;
    addCircle(proLayer,proRadius,'#D43C32',5,.95);
    addCircle(proLayer,proRadius-15,'#F7B2A8',1.6,.75);
    for(var degreeIndex=0;degreeIndex<360;degreeIndex+=5){
      var degree=proSign*degreeIndex+proAngle-90;
      var length=degreeIndex%30===0?28:degreeIndex%10===0?18:9;
      var outer=polar(proRadius,degree),inner=polar(proRadius-length,degree);
      addLine(proLayer,outer.x,outer.y,inner.x,inner.y,'#8E1914',degreeIndex%30===0?3:degreeIndex%10===0?2:1,.95);
      if(degreeIndex%30===0)addText(proLayer,String(degreeIndex)+'°',proRadius-46,degree,15,'#8E1914',900);
    }
    if(counterVisible){
      var counterRadius=proRadius-counterOffset,counterSign=counterClockwise?1:-1;
      addCircle(proLayer,counterRadius,'#7D3D32',1.5,.55,'8 7');
      for(var counterIndex=0;counterIndex<36;counterIndex+=1){
        addText(proLayer,formatDecimal(counterStart+counterIndex*counterStep),counterRadius,counterSign*counterIndex*10+proAngle-90,counterFont,'#4D281F',800);
      }
    }
    if(proSecondaryVisible){
      var secondaryRadius=proRadius+proSecondaryOffset,secondarySign=proSecondaryClockwise?1:-1;
      addCircle(proLayer,secondaryRadius,'#235D8A',2.5,.78);
      for(var secondaryIndex=0;secondaryIndex<proSecondaryDivisions;secondaryIndex+=1){
        var secondaryDegree=secondarySign*secondaryIndex*(360/proSecondaryDivisions)+proAngle-90;
        var secondaryOuter=polar(secondaryRadius,secondaryDegree),secondaryInner=polar(secondaryRadius-14,secondaryDegree);
        addLine(proLayer,secondaryOuter.x,secondaryOuter.y,secondaryInner.x,secondaryInner.y,'#235D8A',1.5,.8);
        if(secondaryIndex%Math.max(1,Math.round(proSecondaryDivisions/12))===0){
          addText(proLayer,formatDecimal(proSecondaryStart+secondaryIndex*proSecondaryIncrement),secondaryRadius+22,secondaryDegree,proSecondaryFont,'#174B72',800);
        }
      }
    }
    if(proMarkerVisible){
      addTriangle(proLayer,proMarkerRadius>0?proMarkerRadius:proRadius,proSign*proMarkerAngle+proAngle-90,proMarkerColor,proMarkerWidth,proMarkerLabel);
    }
  }

  /* Chronometer */
  var chronoVisible=bool('chronoVisible',true),chronoClockwise=bool('chronoClockwise',true),chronoAngle=num('chronoAngle',0),chronoRange=text('chronoRange','Annual'),chronoSign=chronoClockwise?1:-1;
  var chronoSecondaryVisible=bool('chronoSecondaryVisible',false),chronoSecondaryReverse=bool('chronoSecondaryReverse',true),chronoSecondaryAngle=num('chronoSecondaryAngle',180);
  var chronoMarkerVisible=bool('chronoMarkerVisible',false),chronoMarkerAngle=num('chronoMarkerAngle',0),chronoMarkerColor=text('chronoMarkerColor','#168A52'),chronoMarkerLabel=text('chronoMarkerLabel','');
  if(chronoVisible){
    var chronoLayer=layer('chronometerRuntimeLayer','Chronometer');
    var chronoRadius=1260;
    var rangeMap={
      Annual:{count:12,labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']},
      Semiannual:{count:6,labels:['1','2','3','4','5','6']},
      Quarterly:{count:4,labels:['Q1','Q2','Q3','Q4']},
      Monthly:{count:31,labels:null},
      Weekly:{count:7,labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']},
      Daily:{count:24,labels:null},
      Intraday:{count:24,labels:null}
    };
    var range=rangeMap[chronoRange]||rangeMap.Annual;
    addCircle(chronoLayer,chronoRadius,'#168A52',5,.9);
    addCircle(chronoLayer,chronoRadius+15,'#8BD3AC',1.5,.7);
    for(var tick=0;tick<range.count;tick+=1){
      var tickDegree=chronoSign*tick*(360/range.count)+chronoAngle-90;
      var tickOuter=polar(chronoRadius,tickDegree),tickInner=polar(chronoRadius-22,tickDegree);
      addLine(chronoLayer,tickOuter.x,tickOuter.y,tickInner.x,tickInner.y,'#0B6A3B',tick%Math.max(1,Math.round(range.count/12))===0?2.6:1.3,.9);
      var tickLabel=range.labels?range.labels[tick]:String(tick+1);
      if(range.count<=12||tick%Math.max(1,Math.round(range.count/12))===0)addText(chronoLayer,tickLabel,chronoRadius-46,tickDegree,15,'#0B6A3B',900);
    }
    if(chronoSecondaryVisible){
      var chronoSecondaryRadius=chronoRadius-82,chronoSecondarySign=chronoSecondaryReverse?-chronoSign:chronoSign;
      addCircle(chronoLayer,chronoSecondaryRadius,'#5AB783',2,.68,'10 7');
      for(var chronoSecondaryIndex=0;chronoSecondaryIndex<12;chronoSecondaryIndex+=1){
        addText(chronoLayer,String(chronoSecondaryIndex+1),chronoSecondaryRadius,chronoSecondarySign*chronoSecondaryIndex*30+chronoAngle+chronoSecondaryAngle-90,13,'#397759',800);
      }
    }
    if(chronoMarkerVisible)addTriangle(chronoLayer,chronoRadius,chronoSign*chronoMarkerAngle+chronoAngle-90,chronoMarkerColor,24,chronoMarkerLabel);
  }

  document.documentElement.dataset.protractorVisible=proVisible?'true':'false';
  document.documentElement.dataset.chronometerVisible=chronoVisible?'true':'false';
  window.__auditKawkabatProtractorChronometerV2=function(){
    return {
      ok:true,
      protractor:{visible:proVisible,clockwise:proClockwise,angle:proAngle,counter:counterVisible,secondary:proSecondaryVisible,marker:proMarkerVisible},
      chronometer:{visible:chronoVisible,clockwise:chronoClockwise,angle:chronoAngle,range:chronoRange,secondary:chronoSecondaryVisible,marker:chronoMarkerVisible}
    };
  };
}());

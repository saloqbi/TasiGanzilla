(function(){
  'use strict';
  window.__installKawkabatCircle36BrandingGateV1 = function(options){
    var getPanelDocument = options.getPanelDocument;
    var getView = options.getView;
    var ids = ['logoImage','angleFrame','angleTicks','angleLabels','outerBlackFrame','cardinalOrnaments'];
    var hookedFrame = null;

    function wheelFrame(){
      var panel = getPanelDocument();
      return panel ? panel.getElementById('wheelFrame') : null;
    }
    function wheelDocument(){
      var frame = wheelFrame();
      try{return frame && frame.contentDocument ? frame.contentDocument : null;}catch(_){return null;}
    }
    function apply(){
      var doc = wheelDocument();
      if(!doc)return false;
      var visible = String(getView()) === 'circle36';
      ids.forEach(function(id){
        var node = doc.getElementById(id);
        if(!node)return;
        node.style.setProperty('display',visible ? '' : 'none','important');
        node.setAttribute('aria-hidden',visible ? 'false' : 'true');
      });
      doc.documentElement.dataset.circle36BrandingVisible = visible ? 'true' : 'false';
      doc.documentElement.dataset.circle36BrandingView = String(getView());
      return true;
    }
    function bind(){
      var frame = wheelFrame();
      if(!frame || frame === hookedFrame)return;
      hookedFrame = frame;
      frame.addEventListener('load',function(){setTimeout(apply,60);setTimeout(apply,240);});
    }
    function sync(){bind();apply();}
    return {apply:apply,sync:sync,ids:ids.slice()};
  };
}());

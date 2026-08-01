(function(){
'use strict';
if(window.__gannzillaV703DocumentPrototypeFrameHook)return;
window.__gannzillaV703DocumentPrototypeFrameHook=true;
var RUNTIME_PATH='/v703-reference-ornate-overlay.js?v=703-reference-overlay';
var runtimeTag='<script src="'+RUNTIME_PATH+'"></'+'script>';
var injected=false;
function inject(markup){if(injected||typeof markup!=='string')return markup;if(/<\/body\s*>/i.test(markup)){injected=true;return markup.replace(/<\/body\s*>/i,runtimeTag+'</body>');}if(/<html(?:\s|>)/i.test(markup)){injected=true;return markup+runtimeTag;}return markup;}
[Document&&Document.prototype,typeof HTMLDocument!=='undefined'&&HTMLDocument.prototype].filter(Boolean).forEach(function(proto){['write','writeln'].forEach(function(name){var native=proto[name];if(typeof native!=='function'||native.__v703patched)return;var replacement=function(){var args=Array.prototype.slice.call(arguments);if(this===document&&!injected){for(var i=0;i<args.length;i++){if(typeof args[i]==='string'){args[i]=inject(args[i]);if(injected)break;}}}return native.apply(this,args);};replacement.__v703patched=true;try{Object.defineProperty(proto,name,{configurable:true,writable:true,value:replacement});}catch(_){proto[name]=replacement;}});});
window.__auditGannzillaV703DocumentPrototypeFrameHook=function(){return{ok:injected,build:703,runtimePath:RUNTIME_PATH};};
}());

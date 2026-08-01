(function(){
'use strict';
if(window.__gannzillaV704DocumentPrototypeFrameHook)return;
window.__gannzillaV704DocumentPrototypeFrameHook=true;
var RUNTIME_PATH='/v704-comfort-ornate-frame.js?v=704-comfort-frame';
var runtimeTag='<script src="'+RUNTIME_PATH+'"></'+'script>';
var injected=false;
function inject(markup){if(injected||typeof markup!=='string')return markup;if(/<\/body\s*>/i.test(markup)){injected=true;return markup.replace(/<\/body\s*>/i,runtimeTag+'</body>');}if(/<html(?:\s|>)/i.test(markup)){injected=true;return markup+runtimeTag;}return markup;}
[Document&&Document.prototype,typeof HTMLDocument!=='undefined'&&HTMLDocument.prototype].filter(Boolean).forEach(function(proto){['write','writeln'].forEach(function(name){var native=proto[name];if(typeof native!=='function'||native.__v704patched)return;var replacement=function(){var args=Array.prototype.slice.call(arguments);if(this===document&&!injected){for(var i=0;i<args.length;i++){if(typeof args[i]==='string'){args[i]=inject(args[i]);if(injected)break;}}}return native.apply(this,args);};replacement.__v704patched=true;try{Object.defineProperty(proto,name,{configurable:true,writable:true,value:replacement});}catch(_){proto[name]=replacement;}});});
window.__auditGannzillaV704DocumentPrototypeFrameHook=function(){return{ok:injected,build:704,runtimePath:RUNTIME_PATH};};
}());

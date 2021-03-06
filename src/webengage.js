var availableFunctions = {
  'loadWebEngage': loadWebEngage
};

function loadWebEngage(){
  var _body = document.getElementsByTagName('body') [0];
  if(_body){
    (function(d){
      var _div = d.createElement('div');
      _div.id = "_webengage_script_tag";
      _body.appendChild(_div);

      var _we = d.createElement('script');
      _we.type = 'text/javascript';
      _we.async = true;

      var initScript = document.createElement("script");
      initScript.setAttribute('type', 'text/javascript');
      initScript.text  = 'var webengage; !function(e,t,n){function o(e,t){e[t[t.length-1]]=function(){r.__queue.push([t.join("."),arguments])}}var i,s,r=e[n],g=" ",l="init options track screen onReady".split(g),a="feedback survey notification".split(g),c="options render clear abort".split(g),p="Open Close Submit Complete View Click".split(g),u="identify login logout setAttribute".split(g);if(!r||!r.__v){for(e[n]=r={__queue:[],__v:"5.0",user:{}},i=0;i<l.length;i++)o(r,[l[i]]);for(i=0;i<a.length;i++){for(r[a[i]]={},s=0;s<c.length;s++)o(r[a[i]],[a[i],c[s]]);for(s=0;s<p.length;s++)o(r[a[i]],[a[i],"on"+p[s]])}for(i=0;i<u.length;i++)o(r.user,["user",u[i]]);setTimeout(function(){var f=t.createElement("script"),d=t.getElementById("_webengage_script_tag");f.type="text/javascript",f.async=!0,f.src=("https:"==t.location.protocol?"https://ssl.widgets.webengage.com":"http://cdn.widgets.webengage.com")+"/js/widget/webengage-min-v-5.0.js",d.parentNode.insertBefore(f,d)})}}(window,document,"webengage");';
      initScript.text += 'webengage.init("' + licenseCode + '");';
      d.body.appendChild(initScript);

      var _sNode = d.getElementById('_webengage_script_tag');
      _sNode.parentNode.insertBefore(_we, _sNode);
    })(document);
  } else {
    setTimeout(loadWebEngage, 2000);
  }
}

if(methodToInvoke) {
  if(methodToInvokeDataArray != null) {
    availableFunctions[methodToInvoke].apply(undefined, methodToInvokeDataArray);
  } else {
    availableFunctions[methodToInvoke].apply(undefined);
  }
}

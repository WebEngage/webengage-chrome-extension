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
      initScript.text  = "var _weq = _weq || {};";
      initScript.text += "_weq['webengage.licenseCode'] = '" + licenseCode + "';";
      initScript.text += "_weq['webengage.widgetVersion'] = '4.0';";
      initScript.text += "_weq['webengage.survey.forcedRender'] = true;";
      initScript.text += "_weq['webengage.notification.forcedRender'] = true;";
      d.body.appendChild(initScript);
      
      _we.src = (d.location.protocol == 'https:' ? "https://ssl.widgets.webengage.com" : "http://cdn.widgets.webengage.com") + "/js/widget/webengage-min-v-4.0.js"; 
      //_we.src = (d.location.protocol == 'https:') ? "http://yourjavascript.com/26891102614/webengage-v-4-0.js" : "http://yourjavascript.com/26891102614/webengage-v-4-0.js";
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

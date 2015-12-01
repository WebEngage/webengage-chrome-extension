chrome.tabs.onCreated.addListener(function(tab){
	
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo && changeInfo.status == "complete" && (typeof(tab.url) != 'undefined')) {
		doNewTabUpdatedEvent(tab, tab.url);
	}
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	chrome.tabs.getSelected(null, function(tab) { 
	    if((typeof(tab.url) != 'undefined') && tab.url.length > 0) {
	 		doNewTabUpdatedEvent(tab, tab.url);   	
	    }
	})
});

chrome.runtime.onMessage.addListener(
  	function(request, sender, sendResponse) {
    	if (request.action == "enable_auto_insert") {
	    	sendResponse(enableAutoInsert(request.websiteUrl, request.websiteDomain, request.licenseCode));
	    } else if (request.action == "disable_auto_insert") {
	    	sendResponse(disableAutoInsert(request.websiteUrl, request.websiteDomain));
	    }
});

function enableAutoInsert(websiteUrl, websiteDomain, licenseCode){
	var successMessage = "", errorMessage = "", success = true;

	if (typeof(localStorage) == 'undefined' ) {
		success = false;
		errorMessage = "Your browser does not support HTML5 localStorage. Try upgrading.";
	} else {
	  try {
	    localStorage.setItem(websiteDomain, licenseCode);
	    
	    success = true;
		successMessage = "Saved Successfully";
	  } catch (e) {
	    if (e == QUOTA_EXCEEDED_ERR) {
	    	success = false;
			errorMessage = "Quota exceeded!";
	    } else {
	    	success = false;
			errorMessage = e.toString();
	    }
	  }
	}

	return constructResponse(success, successMessage, errorMessage);
}

function disableAutoInsert(websiteUrl, websiteDomain){
	var successMessage = "", errorMessage = "", success = true;

	if (typeof(localStorage) == 'undefined' ) {
		success = false;
		errorMessage = "Your browser does not support HTML5 localStorage. Try upgrading.";
	} else {
	  	try {
	    	localStorage.removeItem(websiteDomain);
	    
		    success = true;
			successMessage = "Saved Successfully";
	  	} catch (e) {
	    	success = false;
			errorMessage = e.toString();
	  	}
	}

	return constructResponse(success, successMessage, errorMessage);
}


function constructResponse(success, successMessage, errorMessage, dataKey, dataValue){
	var returnMessageKey = "", returnMessageValue = "";

	if(success == true) {
		returnMessageKey = "successMessage";
		returnMessageValue = successMessage;
	} else {
		returnMessageKey = "errorMessage";
		returnMessageValue = errorMessage;
	}

	if(dataKey) {
		return {'success': success, returnMessageKey: returnMessageValue, dataKey: dataValue};
	} else {
		return {'success': success, returnMessageKey: returnMessageValue};
	}
}

function getDomainFromUrl(url){
	var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];
    if(domain) domain = domain.replace(/^(https?:\/\/)?(www\.)?/,'');

    return domain;
}

function addWebEngageScript(newTab, lc){
	if(lc && lc.length > 0) {
		chrome.tabs.executeScript(newTab.id, {
		    code: "var methodToInvoke = 'loadWebEngage'; \
		    	   var methodToInvokeDataArray = null; \
		    	   var licenseCode = '" + lc + "';"
		}, function() {
		    chrome.tabs.executeScript(newTab.id, {file: 'webengage.js'});
		});
	} else {
		console.log("Invalid/Null licenseCode");
	}
}

function doNewTabUpdatedEvent(newTab, url){
	isAutoInsertEnabled(newTab, url, function(isEnabled, savedLicenseCode){
		if(isEnabled != null) {
			if(isEnabled) {
				//autoEnableWebEngageLicenseCode = savedLicenseCode;
				addWebEngageScript(newTab, savedLicenseCode);
			} else {
				//autoEnableWebEngageLicenseCode = null;
			}
		} else {
			//autoEnableWebEngageLicenseCode = null;
		}
	});
}

function isAutoInsertEnabled(newTab, url, callback){
	var websiteDomain = getDomainFromUrl(url);
    if(websiteDomain) {
    	try {
	    	var savedLicenseCode = localStorage.getItem(websiteDomain);
	    	if(savedLicenseCode && savedLicenseCode.length > 0) {
	    		if(callback) callback(true, savedLicenseCode);
	    	} else {
	    		if(callback) callback(false);
	    	}
	    } catch(err){
	    	if(callback) callback(null);
	    }
    } else {
    	if(callback) callback(null);
    }
}

var $buttonAddWebEngageScript, $licenseCodeInput, $checkboxSaveLicenseCode, lc = "";
var $notificationContainerCommon, $notificationText;
var weData = null;
var autoEnableWebEngageLicenseCode = null;
var popupNotificationsTimerHandle = null, popupNotificationsQueue = [], showingNotification = false;;

chrome.runtime.onMessage.addListener(
  	function(request, sender, sendResponse) {
    	console.log("Popup.js: Message received from " + (sender.tab ? "content script:" + sender.tab.url : "extension"));
	    if(request.action == "website_saved") {
	    	console.log("url from callback: " + request.url);
	    	return {'success': true};
	    }
});

function showResponseMessage(response){
	if(response.success == true) {
		enqueuePopupNotification("Success" + (response.successMessage ? ": " + response.successMessage : ""), "success")
	} else {
  		enqueuePopupNotification("Error" + (response.errorMessage ? ": " + response.errorMessage : ""), "error");
	}
}

function addWebEngageScript(lc){
	if(lc && lc.length > 0) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  	chrome.tabs.executeScript(tabs[0].id, {
			    code: "var methodToInvoke = 'loadWebEngage'; \
			    	   var methodToInvokeDataArray = null; \
			    	   var licenseCode = '" + lc + "';"
			}, function() {
			    chrome.tabs.executeScript(tabs[0].id, {file: 'webengage.js'});
			});
		});
	} else {
		enqueuePopupNotification("Invalid/Null licenseCode", "warn");
	}
}

function saveOtherLicenseCodeCallback(isSuccess, savedLicenseCode){
	if(isSuccess == true) {
		setSavedLicenseCodeState(savedLicenseCode);
		enqueuePopupNotification("Auto-Trigger Enabled", "success");
	} else {
		$checkboxSaveLicenseCode.prop("checked", false);
		enqueuePopupNotification("Error!", "error");
	}
}

function deleteOtherLicenseCodeCallback(isSuccess){
	if(isSuccess == true) {
		setDeletedLicenseCodeState();
		enqueuePopupNotification("successfully Deleted", "success");
	} else {
		$checkboxSaveLicenseCode.prop("checked", true);
		enqueuePopupNotification("Error!", "error");
	}
}

function doPopupInit(){
	popupNotificationsTimerHandle = setInterval(showPopupNotification, 1000);

	isAutoInsertEnabled(function(isEnabled, savedLicenseCode){
		if(isEnabled != null) {
			if(isEnabled) {
				autoEnableWebEngageLicenseCode = savedLicenseCode;
				$checkboxSaveLicenseCode.prop("checked", true);
	    		$licenseCodeInput.val(savedLicenseCode);
	    		$licenseCodeInput.attr('disabled', true);
			} else {
				autoEnableWebEngageLicenseCode = null;
				$checkboxSaveLicenseCode.prop("checked", false);
	    		$licenseCodeInput.val("");
	    		$licenseCodeInput.attr('disabled', false);	
			}
		} else {
			autoEnableWebEngageLicenseCode = null;
		}
	});
}

function isAutoInsertEnabled(callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
	    var activeTab = arrayOfTabs[0];
	    var activeTabId = arrayOfTabs[0].id;

	    var websiteDomain = getDomainFromUrl(activeTab.url);
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
	});	
}

function init() {
    $buttonAddWebEngageScript = $('#button_add_webengage_script');
    $checkboxSaveLicenseCode = $("#checkbox_save_license_code");
    $licenseCodeInput = $('#licenseCodeInput');

    $notificationContainerCommon = $(".notification_container_common");
    $notificationText = $("#notification_text");

    $buttonAddWebEngageScript.bind('click', function(){
    	addWebEngageScript($licenseCodeInput.val());
    });

    $checkboxSaveLicenseCode.change(function(){
    	if($(this).prop("checked") == true) {
    		enableAutoInsert($licenseCodeInput.val(), saveOtherLicenseCodeCallback);
    	} else {
    		disableAutoInsert(deleteOtherLicenseCodeCallback);
    	}
    });

    doPopupInit();
}

function enqueuePopupNotification(message, type){
	popupNotificationsQueue.push({'message': message, 'type': type});
}

function showPopupNotification(){
	if(popupNotificationsQueue.length > 0 && showingNotification == false) {
		showingNotification = true;

		var currentPopupNotificationData = popupNotificationsQueue.shift();
		var message = currentPopupNotificationData.message;
		var type = currentPopupNotificationData.type;

		$notificationContainerCommon.slideDown();
		$notificationContainerCommon.removeClass (function (index, css) {
		    return (css.match (/(^|\s)notification_type_\S+/g) || []).join(' ');
		});

		if(type) {	
			if(type == "success") {
				$notificationContainerCommon.addClass('notification_type_success');
			} else if(type == "error") {
				$notificationContainerCommon.addClass('notification_type_error');
			} else if(type == "info") {
				$notificationContainerCommon.addClass('notification_type_info');
			} else if(type == "warn") {
				$notificationContainerCommon.addClass('notification_type_warn');
			}
		}

		$notificationText.text(message);

		setTimeout(function(){
			$notificationContainerCommon.slideUp();
			showingNotification = false;
		}, 2000);
	}
}

function enableAutoInsert(lc, callback, context){
	if(lc && lc.length > 0) {
		chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
		    var activeTab = arrayOfTabs[0];
		    var activeTabId = arrayOfTabs[0].id;

		    var domain = getDomainFromUrl(activeTab.url);
		    if(domain) {
			    chrome.runtime.sendMessage({action: "enable_auto_insert", websiteUrl: activeTab.url, websiteDomain: domain, licenseCode: lc}, function(response) {
					//showResponseMessage(response);
					if(callback) callback.call(context, true, lc);
				});
			} else {
				if(callback) callback.call(context, false);
				enqueuePopupNotification("There was some error in getting domain info. Please refresh the page and try again", "error");
			}
		});
	} else {
		if(callback) callback.call(context, false);
		enqueuePopupNotification("Invalid license code", "warn");
	}
}

function disableAutoInsert(callback, context){
	autoEnableWebEngageLicenseCode = null;
	
	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
	    var activeTab = arrayOfTabs[0];
	    var activeTabId = arrayOfTabs[0].id;

	    var domain = getDomainFromUrl(activeTab.url);
	    if(domain) {
		    chrome.runtime.sendMessage({action: "disable_auto_insert", websiteUrl: activeTab.url, websiteDomain: domain}, function(response) {
				//showResponseMessage(response);
				if(callback) callback.call(context, true);
			});
		} else {
			if(callback) callback.call(context, false);
			enqueuePopupNotification("There was some problem in getting domain info. Please refresh the page and try again", "warn");
		}
	});
}

function updateWeData(callback){
	chrome.runtime.sendMessage({action: "get_updated_data"}, function(response) {
		if(response.success && response.data && response.data.length > 0) {
			try {
				weData = JSON.parse(response.data);
			    if(callback) callback(true);
			} catch(err){
				if(callback) callback(false, "Error in parsing saved data. Please try updating.");
			}
		} else {
			if(!response.success || response.error) {
				if(callback) callback(false);
			} else {
				if(callback) callback(false, "Empty Data. Please add data first.");
			}
		}
	});
}

function enableAutoInsertMainCallback(context) {
	$(context).parent().css('display', 'none');
	$(context).parent().siblings(".disable-autoinsert").css('display', 'inline-block');
}

function disableAutoInsertMainCallback(context) {
	$(context).parent().css('display', 'none');
	$(context).parent().siblings(".enable-autoinsert").css('display', 'inline-block');
}

function getDomainFromUrl(url){
	var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];
    if(domain) domain = domain.replace(/^(https?:\/\/)?(www\.)?/,'');

    return domain;
}

function setDeletedLicenseCodeState(){
	$checkboxSaveLicenseCode.prop("checked", false);

	$licenseCodeInput.val("");
	$licenseCodeInput.attr('disabled', false);	
}

function setSavedLicenseCodeState(savedLicenseCode){
	$checkboxSaveLicenseCode.prop("checked", true);

	$licenseCodeInput.val(savedLicenseCode);
	$licenseCodeInput.attr('disabled', true);
}


$(document).ready(init);

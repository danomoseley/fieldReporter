var APP_PATH = "http://api.intelligentdata.com/FieldReporter/api/";
var GLOBAL_appVersion = "dev";

function IDS(obj)
{
	var ref = this;
	this.debug = false;
	this.fastLoad = true;
	this.remoteURL = "http://api.intelligentdata.com/FieldReporter/api/";
	this.APP_PATH = "http://api.intelligentdata.com/FieldReporter/api/";
	this.cameraSupported = false;
	this.loadTimes = {};
	this.styles = new Array(
		this.remoteURL + "css/main.css",
		this.remoteURL + "css/photoGallery.css",
		this.remoteURL + "fancybox/jquery.fancybox-1.3.4.css",
		this.remoteURL + "css/ui-lightness/jquery-ui-1.8.16.custom.css",
		this.remoteURL + "css/autocomplete.css",
		this.remoteURL + "datatables/css/demo_table.css"
	);	
	this.loadCSS();
}

IDS.prototype.switchApp = function(appID){
	if(apps[appID]){
		$("#main .app").hide();
		apps[appID].html.show();
		localStorage[GLOBAL_appVersion + "_currentApp"] = appID;
	}else{
		console.log("App " + appID + " does not exist");
	}
}

IDS.prototype.promote = function(SessionID){
	localStorage.clear();
	window.localStorage["sessionID"] = SessionID;
	location.reload();
}

IDS.prototype.init = function(){
	
	var ref = this;
	var data = {};
	data["sessionID"] = window.localStorage["sessionID"];
	$.ajax({
		url: this.APP_PATH + 'app.asmx/init',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				if(ref.debug) alert("init loaded");
				ref.scripts = data.json.scripts.collection;
				$.holdReady(false);
			}
		}
	});	
}

IDS.prototype.auth = function(){
	var ref = this;
	if(!window.localStorage["sessionID"] || window.localStorage["sessionID"] == ""){		
		this.login();
	}else{
		var data = {};
		data["sessionID"] = window.localStorage["sessionID"];
		$.ajax({
			url: this.APP_PATH + 'app.asmx/validateSession',
			type: 'POST',
			cache: false,
			data: data,
			dataType: "json",
			traditional: true,
			success: function (data) {
				if(data.success == "true"){
					var validation = data.json.user.collection[0];
					if(validation.response == "True"){
						if(!ref.fastLoad){
							ref.init();
						}else{
							$.holdReady(false);
						}
					}else{
						ref.login();
						localStorage.clear();
					}
				}
			}
		});		
	}
}

IDS.prototype.ping = function(){
	var ref = this;
	var pingStart = new Date();
	if (!ref.haveConnectionToServer) {
		$(".appStatus").removeClass("red orange green");
		$(".appStatus").addClass("red");
	}
	ref.haveConnectionToServer = false;
	
	var data = {};
	data["sessionID"] = ref.getSession();
	data["revisionID"] = localStorage[GLOBAL_appVersion + "_100000_lastSeenRevision"];
	if(data["sessionID"]){
		$.ajax({
			url: APP_PATH + 'app.asmx/validateSession',
			type: 'POST',	
			cache: false,
			data: data,
			dataType: "json",
			traditional: true,
			success: function (data) {
				var validation = data.json.user.collection[0];
				if(validation.response == "True"){
					var diff = new Date();
					diff.setDate(diff - pingStart);
					pingTime = diff.getMilliseconds();
					if (pingTime > 1000) {
						$(".appStatus").removeClass("red orange green");
						$(".appStatus").addClass("orange");
					} else {
						$(".appStatus").removeClass("red orange green");
						$(".appStatus").addClass("green");
					}
					
					
					
					$.each(data.json.appVersion.collection,function(k,v){
						if(apps[v.AppID].revision != v.RevisionID){
							$(".updateApp",apps[v.AppID].html).addClass("available");
						}
						localStorage[GLOBAL_appVersion + "_" + v.AppID + "_lastSeenRevision"] = v.RevisionID;
					});
					
					$.each(data.json.appRevision.collection,function(k,v){
						ref.toast("New Application Updates!",v.Detail,10,true);
					});
					
					ref.haveConnectionToServer = true;
				}else{					
					localStorage.clear();
					ref.login();
				}
				
			}
		});
	}
}

IDS.prototype.resizeTable = function(theDataTable){
	
}

IDS.prototype.toast = function(title,message,seconds,persistant){
	if(persistant == undefined) persistant = false;
	if(seconds == undefined) seconds = 2;
	var id = (new Date()).getTime();
	var slice =	$("<li>").addClass("toast "+ id).append(
		$("<div>").html(message)
	)
	.prepend(
		$("<h1>").css("padding","5px").html(title).append(
			$("<button>")
				.addClass("notificationClose")
				.html("<span>X</span>")
				.click(function(){ 
					$(this).parent().parent().remove();
				})
		)
	);
	if(!persistant){
		setTimeout(function(){ 
			$("."+id).remove(); 
		},seconds*1000);
	}
	$(".notifications").append( slice );
}

IDS.prototype.onLoad = function(ref){
	if(ref.debug) alert("jquery loaded");
	$.holdReady(true);
	ref.loadScript(
		this.remoteURL + "fancybox/jquery.fancybox-1.3.4.pack.js",
		function(){
			ref.loadScript(
				ref.remoteURL + "js/lib.js",
				function(){
					ref.auth();
				}
			);
		}
	);	
	
	$(document).ready(function() {
		if(ref.debug) alert("hold ready lifted");
		if(!ref.phoneGap) navigator.geolocation.watchPosition(updateLocation);
		if(!ref.fastLoad){
			ref.loadScripts(ref.scripts,function(){$(".loading").remove();});
		}else{
			ref.loadScript(ref.APP_PATH + "app.asmx/requiredScripts?s=" + ref.getSession(),function(){$(".loading").remove();});
		}		
		setInterval(function(){ ref.ping(); },10000);
	});
}

IDS.prototype.getSession = function(){
	if(window.localStorage["sessionID"]==undefined){
		if($(".lockOverlay").length==0){
			this.login();
		}
		return false;
	}else{
		return window.localStorage["sessionID"];
	}
}

IDS.prototype.login = function(){
	var ref = this;
	var id = (new Date()).getTime();
	var login = $("<div>").addClass("login").append(
		$("<input>").attr("type","text").attr("placeholder","User Name").attr("id","username"+id),
		$("<input>").attr("type","password").attr("placeholder","Password").attr("id","password"+id),		
		//$("<input>").attr("type","number").attr("placeholder","Authorization Code").attr("id","authcode"+id),
		$("<input>").attr("type","submit").attr("value","Login").click(function(){
			var data = {};
			data["username"] = $("#username"+id).val();
			data["password"] = $("#password"+id).val();
			//data["authCode"] = $("#authcode"+id).val();
			//if($("#authcode"+id).val() == "")
			data["authCode"] = "00000";
			data["useragent"] = navigator.userAgent;
			$.ajax({
				url: ref.APP_PATH + 'app.asmx/auth',
				type: 'POST',
				cache: false,
				data: data,
				dataType: "json",
				traditional: true,
				success: function (data) {
					if(data.success == "true"){
						var user = data.json.user.collection[0];
						if(user.status == 1){
							window.localStorage["sessionID"] = user.sessionID;
							$("#"+id).remove();
							ref.init();
						}else if(user.status == 2){
							$("#"+id+" .statusMsg").html(user.message);
						}else{
							$("#"+id+" .statusMsg").html("Invalid login");
						}
					}
				}
			});
		}),
		$("<div>").addClass("statusMsg").css("width","100%").css("text-align","center").css("color","white")
	).css("margin-top",getViewportHeight()/2);
	
	$(window).resize(function(){
		login.css("margin-top",getViewportHeight()/2);
	});
	
	$("body").append(
		$("<div>").addClass("lockOverlay").attr("id",id).append(
			login
		)
	);
	
	login.css("width",	$("#username"+id,login).outerWidth(true)
						+$("#password"+id,login).outerWidth(true)
						+$("input[type='submit']",login).outerWidth(true)
	);
	
	document.onkeydown = function (evt) { 
      var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
      if (keyCode == 13)   //13 = the code for pressing ENTER
 
      {
         $("input[type='submit']",login).trigger('click');
      }
    }
	
	//login.css("width",$("#username"+id,login).outerWidth(true));
}

IDS.prototype.loadScripts = function(scripts,callback){
	var ref = this;	
	if(scripts.length>0){
		if(ref.debug) alert("loading " + scripts.length + " scripts");
		var script = scripts.shift();
		var ref = this;
		ref.loadScript(script.path,(scripts.length>0) ? function(){ref.loadScripts(scripts,callback);} : callback);
	}
}

IDS.prototype.loadCSS = function(){
	var ref = this;
	if(ref.debug) alert("loadCSS started");
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('link');
	script.rel = 'stylesheet';
	script.type = 'text/css';
	script.media = "only screen and (max-device-width: 1024px)";
	script.href = this.remoteURL + "css/ipad.css";
	head.appendChild(script);

	var script2 = document.createElement('link');
	script2.rel = 'apple-touch-icon';
	script2.href = this.remoteURL + "img/icon.png";
	head.appendChild(script2);

	for(i in this.styles){
		this.loadStyle(this.styles[i]);
	}
	if(ref.debug) alert("css loaded");
}

IDS.prototype.loadScript = function(url, callback)
{
	var ref = this;
	if(!ref.loadTimes[url]){		
		if(ref.debug) alert("loading " + url);
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.src= url;
		
		if(callback != undefined){
		   script.onreadystatechange = callback;
		   script.onload = callback
		}

		head.appendChild(script);
		this.loadTimes[url] = new Date();
	}else{
		console.log("script " + url + " already loaded at " + ref.loadTimes[url]);
		if(callback != undefined){
			callback();
		}
	}
}

IDS.prototype.loadStyle = function(url, callback)
{
	var ref = this;
	if(!ref.loadTimes[url]){
		var ref = this;
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('link');
		script.rel = 'stylesheet';
		script.type = 'text/css';
		script.href = url;
	   
		if(callback != undefined){
			script.onreadystatechange= function () {
			  if (this.readyState == 'complete') callback();
			}
			script.onload= callback;
		}

		head.appendChild(script);
		this.loadTimes[url] = new Date();
	}else{
		console.log("style " + url + " already loaded at " + ref.loadTimes[url]);
		if(callback != undefined){
			callback();
		}
	}
}

IDS.prototype.createTable = function(data,columns){
	if(data != undefined && columns != undefined){
		
		return ret;
	}
}

IDS.prototype.initPhoneGap = function(ref){
	ref.cameraSupported = true;
	document.addEventListener("deviceready",onDeviceReady,false);
	ref.phoneGap = true;
	
	function onDeviceReady() {
		navigator.geolocation.watchPosition(updateLocation);
		ref.phoneGapReady = true;
		if(ref.debug) alert("phonegap Loaded");
		$(".newPhoto.disabled").removeClass("disabled");
    }
}

function googleMapsLoaded(){
	//alert("maps finished loading");
}

var IDS = new IDS();
IDS.loadScript("phonegap.js",function(){IDS.initPhoneGap(IDS);});
IDS.loadScript("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",function(){IDS.onLoad(IDS);});

function updateLocation(position){
	IDS.geolocationSupported = true;
	IDS.lastLocation = position;
}
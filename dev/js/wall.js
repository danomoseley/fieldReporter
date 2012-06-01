function Wall(wall,app)
{
	this.app = app;
	this.ID = wall.ID;
	this.nav = undefined;
	this.loading();
	this.windows = {};
	this.windowLayout = [];
	this.numWindows = 0;
	this.currentWindow = undefined;
	var ref = this;
	this.lastHide = undefined;
	this.windowContainer = $("<div>").addClass("windowContainer");
	this.navBar = $("<div>").attr("id","navBar");
	this.notificationTray = $("<div>").addClass("notificationTray");
	this.appStatus = $("<div>").addClass("appStatus").addClass("green");
	this.haveConnectionToServer = false;
	this.notifications = $("<ul>").addClass("notifications");
	
	if(animations){
		this.windowContainer.addClass("animated");
	}
	
	var i=0;
	$.each(wall.windows,function(name,window){
		ref.windowLayout.push(window.windowID);
		ref.addWindow(window,i);
		i++;
	});
	
	this.navBar.append(
		$("<div>").addClass("button updateApp").html("Update").append(
			$("<div>").addClass("alert").html("!")
		).click(function(){
			if(confirm("Update Application?")){
				location.reload();
			}
		}),
		$("<div>").addClass("button").html("Log Out").click(function(){
			if(confirm("Are you sure you want to log out?")){
				localStorage.clear();
				location.reload();
			}
		}),
		this.notificationTray
	);
	
	this.html = $("<div>").addClass("wall").append(
		this.navBar,
		this.windowContainer
	);
	
	this.app.html.append(
		ref.html
	);
	
	this.notificationTray.append(
		this.notifications,
		this.appStatus
	)
	
	IDS.toast("Welcome","Welcome to the FieldReporter");
	
	$(window).resize(function(){
		$(".view",ref.windowContainer).css("max-height",(getViewportHeight()-ref.navBar.outerHeight(true)-$(".screenNav",this.windowContainer).outerHeight(true)-$(".viewTitle",ref.currentWindow.currentScreen.html).outerHeight(true)-(2*parseInt($(".view").css("padding-bottom")))-(2*parseInt($(".view").css("padding-top"))))+"px");
		$.each(ref.windows, function(key, value) { 
			value.center();
		});
	});
	/*
	$(this.obj).swipe({
		swipe:swipe,
		threshold:50
	});*/
	
	function swipe(event, direction)
	{
		if(direction=="left") ref.scrollRight();
		if(direction=="right") ref.scrollLeft();
		if(direction=="up") ref.currentWindow.scrollDown();
		if(direction=="down") ref.currentWindow.scrollUp();
	}
	
	
	var lastScreen = localStorage[GLOBAL_appVersion + "_" + this.ID + "_currentScreen"];
	
	if(localStorage[GLOBAL_appVersion + "_" + this.ID + "_currentWindow"] != undefined){
		this.changeWindowByID(localStorage[GLOBAL_appVersion + "_" + this.ID + "_currentWindow"],false);
		if(lastScreen != undefined){
			this.currentWindow.changeScreenByID(lastScreen,false);
		}
	}
	
	//$(".view").css("max-height",getViewportHeight()-$("#navBar").outerHeight(true)-$(".screenNav").outerHeight(true)-$(".viewTitle",ref.currentWindow.currentScreen.obj).outerHeight(true)-(2*parseInt($(".view").css("padding-bottom")))-(2*parseInt($(".view").css("padding-top")))+"px");
	//this.changeWindow(this.currentWindow.name).changeScreen(this.currentWindow.currentScreen.name);
	this.complete();
}



Wall.prototype.scrollLeft = function(){
	if(this.windowLayout[this.currentWindow.windowNum-1]!=undefined){
		this.changeWindow(this.windowLayout[this.currentWindow.windowNum-1]);	
	}
}

Wall.prototype.scrollRight = function(){
	if(this.windowLayout[this.currentWindow.windowNum+1]!=undefined){
		this.changeWindow(this.windowLayout[this.currentWindow.windowNum+1]);	
	}
}

Wall.prototype.scrollUp = function(){
	if(this.currentWindow.screenLayout[this.currentWindow.currentScreen.screenNum-1]!=undefined){
		this.currentWindow.changeScreen(this.currentWindow.screenLayout[this.currentWindow.currentScreen.screenNum-1]);	
	}
}

Wall.prototype.scrollDown = function(){
	if(this.currentWindow.screenLayout[this.currentWindow.currentScreen.screenNum+1]!=undefined){
		this.currentWindow.changeScreen(this.currentWindow.screenLayout[this.currentWindow.currentScreen.screenNum+1]);	
	}
}

Wall.prototype.addWindow = function(window,num)
{
	this.numWindows++;
	var windowName = window.windowID;
	var ref = this;
	
	var theWindow = new Window(window,num,this);
	
    this.windows[window.ID] = theWindow;
	this.windowContainer.append(theWindow.html);
	this.windowContainer.css("width",(this.numWindows*100)+'%');
	$(".window",this.windowContainer).css("width",(100/this.numWindows)+"%");
	if(this.numWindows == 1) this.currentWindow = theWindow;	
	
	this.navBar.append(
		$("<div>").addClass("button").html($(window).attr("title")).click(function(){
			ref.changeWindow(theWindow);
		})
	);
	return this.windows[$(window).attr("windowID")];	
}

Wall.prototype.changeWindow = function(window,hide){
	if(hide == undefined) hide = true;
	if(window){
		if(hide){
			$(".window .screenContainer",this.windowContainer).hide();
			this.currentWindow.screenContainer.show();
			clearTimeout(this.lastHide);
			var lastWindow = this.currentWindow;
			if(lastWindow.ID != window.ID){
				this.lastHide = setTimeout(function(){ lastWindow.screenContainer.hide(); },500);
			}
			window.screenContainer.show();
		}
		
		var windowNum = window.windowNum;
		this.windowContainer.css("margin-left",(-100*windowNum)+'%');
		$(".window").removeClass("active");
		//$($(this.obj.children())[windowNum]).addClass("active");
		this.currentWindow = window;
		localStorage[GLOBAL_appVersion + "_" + this.ID + "_currentWindow"] = window.ID;
		localStorage[GLOBAL_appVersion + "_" + this.ID + "_currentScreen"] = window.currentScreen.ID;
		return window;
	}
}

Wall.prototype.changeWindowByID = function(ID,hide){
	this.changeWindow(this.windows[ID],hide);
}

Wall.prototype.loading = function(){
	//$(this.obj).append($("<div>").addClass("loading"));
}

Wall.prototype.complete = function(){
	//$(".loading",this.obj).remove();
}
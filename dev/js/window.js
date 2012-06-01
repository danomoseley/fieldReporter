function Window(window,num,wall)
{
	this.wall = wall;
	this.window = window;
	this.currentScreen = undefined;
	this.name = window.ID;
	this.ID = window.ID;
	this.windowNum = num;
    this.screenNavWidth = 0;
	this.screens = {};
	this.screenLayout = [];
	var ref = this;
	this.lastHide = undefined;
	this.screenContainer = $("<div>").addClass("screenContainer");
	this.screenNav = $("<div>").addClass("screenNav");
	this.html = $("<div>").addClass("window").append(this.screenNav,this.screenContainer);	
		
	if(animations){
		this.screenContainer.addClass("animated");
	}
	this.screenContainer.css("height",(Object.size(window.screens)*100)+'%');
	
	var i=0;
	$.each(window.screens,function(name,screen){
		ref.screenLayout.push(screen.ID);
		ref.screens[screen.ID] = new Screen(screen,i,ref);
		ref.screenContainer.append(ref.screens[screen.ID].html);
		if(i==0) ref.currentScreen = ref.screens[screen.ID];
		if(screen.title){
			var theNav = $("<div>").addClass("button").draggable().html($(screen).attr("title")).click(function(){
				$(".active",ref.screenNav).removeClass("active");
				$(this).addClass("active");
				ref.changeScreen(ref.screens[screen.ID]);
			});
			ref.screenNav.append(
				theNav
			);
			ref.screenNavWidth += 140;
		}
		i++;
	});
	ref.screenNav.width(ref.screenNavWidth).css("margin-left",(-1*(ref.screenNavWidth/2))+"px");
	$(".screen",this.screenContainer).css("height",(100/Object.size(window.screens))+"%");
	
	/*$(".screen",obj).each(function(i,screen){
		ref.screenLayout.push($(screen).attr("screenID"));
		ref.screens[$(screen).attr("screenID")] = new Screen(screen,i);
		if(i==0) ref.currentScreen = ref.screens[$(screen).attr("screenID")];
		if($(screen).attr("title")){
			$(".screenNav",ref.obj).append(
				$("<div>").addClass("button").html($(screen).attr("title")).click(function(){
					ref.changeScreen($(screen).attr("screenID"));
				})
			);
		}
	});*/
}

Window.prototype.scrollDown = function(){
	if(this.screenLayout[this.currentScreen.screenNum+1]!=undefined){
		this.changeScreen(this.screenLayout[this.currentScreen.screenNum+1]);	
	}
}

Window.prototype.scrollUp = function(){
	if(this.screenLayout[this.currentScreen.screenNum-1]!=undefined){
		this.changeScreen(this.screenLayout[this.currentScreen.screenNum-1]);	
	}
}

Window.prototype.center = function(){
	$(".screenContainer",this.html).removeClass("animated").css("margin-top",(-1*this.currentScreen.screenNum*getViewportHeight())+"px").toggleClass("animated");
	//$(".screenContainer",this.obj);
	$.each(this.screens, function(key, value) { 
		value.center();
	});
}

Window.prototype.changeScreen = function(screen,hide){
	if(hide == undefined) hide = true;
	if(screen){
		if(hide){
			$(".viewContainer",this.screenContainer).hide();
			this.currentScreen.viewContainer.show();
			clearTimeout(this.lastHide);
			var lastScreen = this.currentScreen;
			if(lastScreen.ID != screen.ID){
				this.lastHide = setTimeout(function(){ lastScreen.viewContainer.hide(); },500);
			}
			screen.viewContainer.show();
		}
		
		if(this.currentScreen){
			if(this.currentScreen.screenID != screen.screenID){
				var ref = this.currentScreen.obj;
			}	
		}
		
		this.screenContainer.css("margin-top",(-1*screen.screenNum*getViewportHeight())+"px");
		this.currentScreen = screen;
		
		localStorage[GLOBAL_appVersion + "_" + this.wall.ID + "_currentScreen"] = this.currentScreen.ID;
		return screen;
	}
}

Window.prototype.changeScreenByID = function(ID,hide){
	this.changeScreen(this.screens[ID],hide);
}	
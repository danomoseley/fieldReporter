function Screen(screen,num,window2)
{
	this.window = window2;
	this.ID = screen.ID;
	this.currentView = undefined;
	this.screenNum = undefined;
	this.form = undefined;
	this.viewHistory = new Array();
	if(num!=undefined){
		this.screenNum = num;
	}
	this.views = {};
	var ref = this;
	this.viewContainer = $("<div>").addClass("viewContainer wide");
	this.html = $("<div>").addClass("screen").append(this.viewContainer);
	
	if(screen.views){
		$.each(screen.views,function(i,view){
			if(view.ID == undefined && i==0) view.ID  = "default";
			if(view.ID  == undefined && i>0) view.ID  = "default"+i;
			
			var win = undefined;
			if(window[view.viewType]){
				win = new window[view.viewType](view,ref)
				ref.views[view.ID] = win;
				
			}else{
				win = new View(view,ref)
				ref.views[view.ID] = win;
			}
			ref.viewContainer.append(win.html);
			if(ref.viewHistory.length == 0){
				ref.viewHistory.push(view.ID);
				win.html.addClass("active frontSide");
				$(".goBack",win.html).hide();
			}else{
				win.html.hide();
			}
			if(ref.currentView == undefined){
				ref.currentView = ref.views[view.ID];
			}
		});
	}
}

Screen.prototype.center = function(){
	$.each(this.views, function(key, value) { 
		value.center();
	});
}

Screen.prototype.changeView = function(viewID,refresh){
	if(refresh == undefined) refresh = true;
	if(this.views[viewID]){
		if(this.viewHistory[this.viewHistory.length-1] != viewID){
			this.viewHistory.push(viewID);
			$(".view",this.viewContainer).removeClass("backSide").hide();
			$(".view.active",this.viewContainer).addClass("backSide").removeClass("active").removeClass("frontSide").removeClass("active");
			this.views[viewID].html.addClass("active frontSide").show();
			if(refresh && this.views[viewID].refresh){
				this.views[viewID].refresh();
			}
			$(".viewNav",this.views[viewID].html).forceRedraw(true);
		}
	}else{
		console.log("View " + viewID + " not found");
	}
}
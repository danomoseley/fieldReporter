function App(obj)
{
	var ref = this;
	this.revision = obj.revision;
	this.newestRevision = 0;
	this.ID = obj.ID;
	this.walls = obj.walls;
	this.debug = false;
	this.cameraSupported = true;
	this.remoteURL = "http://api.intelligentdata.com/FieldReporter/dev/";
	this.APP_PATH = "http://api.intelligentdata.com/FieldReporter/api/";
	this.init();
}

App.prototype.init = function(){
	var ref = this;
	ref.html = $("<div>").addClass("app");
	$.each(ref.walls,function(wallID,wall){
		ref.walls[wallID] = new Wall(wall,ref);
	});
	ref.html.hide();
	if(localStorage[GLOBAL_appVersion + "_currentApp"] && this.ID == localStorage[GLOBAL_appVersion + "_currentApp"]) ref.html.show();
	if(!localStorage[GLOBAL_appVersion + "_currentApp"] && ref.ID == 100000) ref.html.show();
	$("#main").append(ref.html);
	
}

App.prototype.changeWall = function(wallID){
	$(".wall",this.html).hide();
	this.walls[wallID].html.show();
}

function onDeviceReady() {
	GLOBAL_cameraSupported = true;
}


var currentScreen = 0;
var wall;
var apps = {};
var cameraSupported = false;
var appData = {};
var currentLocation = undefined;
var animations = true;
var layout;
var afterLoad = new Array();
var masterQueue = new masterSync();

$(document).ready(function () {	
	$("#main").show();
	$("#main").append($("<div>").addClass("loading rounded").css("height","100%"));
	
	var data = {};
	data["sessionID"] = IDS.getSession();
	$.ajax({
		url: APP_PATH + 'app.asmx/getLayout',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				$.each(data.json.apps,function(appID,app){
					apps[appID] = new App(app);
				});
				$(".loading",$("#main")).remove();
			}
		}
	});		

	$.ajax({
		url: APP_PATH + 'app.asmx/getAppData',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				$.each(data.json,function(type,collection){
					if(collection.type == "object"){
						if(collection.collection){
							$.each(collection.collection,function(k,obj){
								if(!appData[type]) appData[type] = {};
								appData[type][obj.ID] = new Data(obj);
								appData[type][obj.ID].dataType = type;
							});
						}
					}
					else if(collection.type == "singleton")
					{
						appData[type] = collection.collection;
					}
					else if(collection.type == "relation")
					{
						$.each(collection.collection,function(k,obj){
							if(!appData[type]) appData[type] = {};
							if(!appData[type][obj.ID]) appData[type][obj.ID] = new Array;							
							appData[type][obj.ID].push(obj);
						});
					}
				});
				
				appData.ready = true;
				
				while(afterLoad.length>0){
					afterLoad.pop()();
				}
				
				
				if(appData.Settings.animations=="True"){
					$("#appAnimations").attr("checked","checked");
				}else{
					$("#appAnimations").removeAttr("checked");
				}
				
				if(appData.Settings.wide=="True"){
					$("#appWide").attr("checked","checked");
				}else{
					$("#appWide").removeAttr("checked");
				}
			}
		}
	});	
	
	$("#appAnimations").change(function(){
		$("#windowContainer").toggleClass("animated");
		$(".screenContainer").toggleClass("animated");
	});
	
	$("#appWide").change(function(){
		$(".viewContainer").toggleClass("wide");
	});
	createGallery($("#gallery"),"0","0")
});


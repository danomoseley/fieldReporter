function View(view,screen)
{
	this.screen = screen;
	this.view=view;
	var ref = this;
	this.theDataTable = undefined;
	this.filters = {};
	this.content = $("<div style='width:100%;height:100%;-moz-box-sizing:border-box;-webkit-box-sizing: border-box;box-sizing:border-box;'>").addClass("content");	
	this.html = $("<div>").addClass("view").append(
		$("<div>").addClass("scroller").append(
			this.content
		)
	);
	
	this.html.addClass("rounded");
	this.html.addClass("shadow");
	
	if(view && view.cssClass){
		this.html.addClass(view.cssClass);
	}
	
	$(document).ready(function(){
		ref.center();
	});
	
	$(window).resize(function(){
		ref.resize();
	});
	this.addNav();
}

View.prototype.setObj = function(obj){
	this.obj = obj;
	this.addNav();
}

View.prototype.defaultAjaxParameters = function(){
	var data = {};
	data["sessionID"] = IDS.getSession();
	if(IDS.lastLocation){
		data["latitude"] = IDS.lastLocation.coords.latitude;
		data["longitude"] = IDS.lastLocation.coords.longitude;
	}
	return data;
}

View.prototype.addNav = function(){
	var ref = this;
	if(this.view && this.view.title){
		this.html.prepend(
			$("<div>").addClass("viewNav").append(
				ref.goBack ? 
				$("<div>").addClass("goBack").click(function(){
					ref.goBack();
				}) : "",
				$("<h2 class='viewTitle'>").html(this.view.title),
				ref.refresh ? 
				$("<div>").addClass("refresh").click(function(){
					ref.refresh();
				}) : "",
				ref.map ? 
				$("<div>").addClass("map").click(function(){
					ref.map();
				}) : ""
			)
		);
	}
}

View.prototype.loading = function(){
	$(this.html).append(
		$("<div>").addClass("loading rounded").click(function(){
			$(this).remove();
		})
	);
}

View.prototype.complete = function(){
	$(".loading",this.html).remove();
}
 
View.prototype.center = function()    // Define Method
{
	var windowHidden = false;
	var viewHidden = false;
	if(!$(this.obj).parent().parent().is(":visible")) windowHidden = true;
	if(!$(this.obj).is(":visible")) viewHidden = true;
	
	if(windowHidden) $(this.obj).parent().parent().show();
	if(viewHidden) $(this.obj).show();
	
    $(this.html).css("margin-top",(getViewportHeight()-parseInt($(this.html).css("max-height"))+$(".viewNav",this.html).outerHeight(true))/2);
	
	if(windowHidden) $(this.obj).parent().parent().hide();
	if(viewHidden) $(this.obj).hide();
}

View.prototype.getMaxRows = function(){
	var exHeight = $(this.html).height() - ($(".dataTables_wrapper",this.html).outerHeight(true) - $(".dataTables_wrapper table",this.html).outerHeight(true) + $(".filters",this.html).outerHeight(true) + 75);	
	return parseInt((exHeight-$(".dataTables_wrapper tr",this.html).outerHeight(true))/$(".dataTables_wrapper tr",this.html).outerHeight(true));
}

View.prototype.resize = function(){	
	if(this.theDataTable != undefined){
		this.theDataTable.fnSettings()._iDisplayLength = this.getMaxRows();
		this.theDataTable.fnDraw();
	}
}

View.prototype.createTable = function(table,data,columns,theDataTable){
	var ref = this;
	
	if(theDataTable == undefined){
		theDataTable = $(table).dataTable({
			"aaData": data,
			"aoColumns": columns,
			"bPaginate": true,
			"sPaginationType": "full_numbers",
			"bLengthChange": false,
			"iDisplayLength": 30,
			"bFilter": true,
			"bSort": true,
			"bInfo": false,
			"bAutoWidth": false,
			"bRetrive": true,
			"bDestroy": true,
			"sDom": 'lftip',
			"fnDrawCallback": function() {
				$("tbody tr",table).unbind();
				$("tbody tr",table).bind('click',function(event) {
					var aData = ref.theDataTable.fnGetData( event.target.parentNode );
					ref.loadDetail(aData);
				});
			}
		});
	}else{
		theDataTable.fnClearTable();
		theDataTable.fnAddData(data);
	}
	return theDataTable;
}

View.prototype.makeTable = function(table,data,columns,aaSorting,rowSelectFunction){
	var ref = this;
	var theDataTable = table.dataTable({
		"aaData": data,
		"aoColumns": columns,
		"bPaginate": true,
		"sPaginationType": "full_numbers",
		"bLengthChange": false,
		"iDisplayLength": 10,
		"bFilter": true,
		"bSort": true,
		"bInfo": false,
		"bAutoWidth": false,
		"bRetrive": true,
		"bDestroy": true,
		"sDom": 'lftip',
		"fnDrawCallback": function() {
			if(rowSelectFunction!=undefined){
				$("tbody tr",table).unbind();
				$("tbody tr",table).bind('click',function(event) {
					var aData = theDataTable.fnGetData( event.target.parentNode );
					rowSelectFunction(aData);
				});
			}
		},
		"aaSorting": aaSorting
	});
	table.forceRedraw(true);
	
	return theDataTable;
}

View.prototype.goBack = function(){
	this.screen.viewHistory.pop();
	var lastScreenID = this.screen.viewHistory.pop();
	this.screen.changeView(lastScreenID);
}

View.prototype.initializeMap = function(){
	var id = (new Date()).getTime();
	this.mapDiv = $("<div style='height:100%;width:100%;'>").attr("id",id);
	$("body").append(this.mapDiv);
	var myOptions = {
	  zoom: 8,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	this.googleMap = new google.maps.Map(document.getElementById(id),
		myOptions);
	this.googleMap.setCenter(new google.maps.LatLng(IDS.lastLocation.coords.latitude,IDS.lastLocation.coords.longitude));
	this.mapMarkers = [];
	$("body #"+id).remove();
}

View.prototype.writeDataMap = function(data,callback){
	if(!this.googleMap) this.initializeMap();
	
	var ref = this;
	
	for( i in this.mapMarkers){
		this.mapMarkers[i].setMap(null);
	}
	
	var bounds = new google.maps.LatLngBounds();
	$.each(data,function(k,markerData){
		if(markerData.Latitude && markerData.Longitude){
			var loc = new google.maps.LatLng(markerData.Latitude, markerData.Longitude);	
			var pin = new google.maps.Marker({
				map: ref.googleMap,
				position: loc,
				draggable: true
			});
			google.maps.event.addListener(pin, 'click', function(){ callback(markerData); });
			ref.mapMarkers.push(pin);
			bounds.extend(loc);
		}
	});
	ref.googleMap.fitBounds(bounds);
	
	
	return this.mapDiv;	
}
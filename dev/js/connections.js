Connections.prototype = new tableView();
function Connections(view,screen)
{
	// CALL PARENT CONSTRUCTOR !Important
	tableView.apply(this, arguments);
	this.paint();
}

Connections.prototype.loadDetail = function(todo){
	var connectionDetail = this.screen.views['10023'];
	todoDetail.load(todo);
	todoDetail.paint();
	this.screen.changeView('10023');
}

Connections.prototype.paintNewConnection = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div>").html(IDS.remoteURL + "?ref=dgf79d8f7gh98df7gh0f")
	);
	
	return this.info;
}

Connections.prototype.paintConnectionList = function(){
	var ref = this;
	ref.loading();
	
	var deviceList = $("<table>").append("<thead>","<tbody>");
	
	var deviceSection = $("<div style='clear:both;'>").append(
		deviceList
	);
	
	$.ajax({
		url: APP_PATH + 'FieldHost.asmx/getConnections',
		type: 'POST',
		cache: false,
		data: ref.defaultAjaxParameters(),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				ref.connections = new collection(data.json.connection.collection);
				var columns = [
					{"sTitle": "Company", "mDataProp": "Company"},
				];
				
				var theDataTable = deviceList.dataTable({
					"aaData": ref.connections.array,
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
					"aaSorting": [[ 5, "desc" ]]
				});
				$("tbody",deviceList).click(function(event) {
					$(theDataTable.fnSettings().aoData).each(function (){
						$(this.nTr).removeClass('row_selected');
					});
					var aData = theDataTable.fnGetData( event.target.parentNode );
					var fieldDeviceDetail = ref.screen.views["10023"];
					fieldDeviceDetail.load(aData);
					fieldDeviceDetail.paint();
					ref.screen.changeView("10023",false);
				});
				$("tr",deviceList).click( function() {} );
				deviceList.forceRedraw(true);
				ref.complete();
			}
		}
	});
	
	return deviceSection;
}

Connections.prototype.paintOpenConnectionList = function(){
	var ref = this;
	ref.loading();
	
	var deviceList = $("<table>").append("<thead>","<tbody>");
	
	var deviceSection = $("<div style='clear:both;'>").append(
		deviceList
	);
	
	$.ajax({
		url: APP_PATH + 'FieldHost.asmx/getOpenConnections',
		type: 'POST',
		cache: false,
		data: ref.defaultAjaxParameters(),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				ref.connections = new collection(data.json.connection.collection);
				var columns = [
					{"sTitle": "Company", "mDataProp": "Company"},
				];
				
				var theDataTable = deviceList.dataTable({
					"aaData": ref.connections.array,
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
					"aaSorting": [[ 5, "desc" ]]
				});
				$("tbody",deviceList).click(function(event) {
					$(theDataTable.fnSettings().aoData).each(function (){
						$(this.nTr).removeClass('row_selected');
					});
					var aData = theDataTable.fnGetData( event.target.parentNode );
					var fieldDeviceDetail = ref.screen.views["10023"];
					fieldDeviceDetail.load(aData);
					fieldDeviceDetail.paintReply();
					ref.screen.changeView("10023",false);
				});
				$("tr",deviceList).click( function() {} );
				deviceList.forceRedraw(true);
				ref.complete();
			}
		}
	});
	
	return deviceSection;
}

Connections.prototype.refresh = function(){
	this.paint();
}

Connections.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintNewConnection(),
		this.paintConnectionList(),
		this.paintOpenConnectionList()
	);
	this.content.forceRedraw(true);
}

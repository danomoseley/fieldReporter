reportListing.prototype = new tableView();
function reportListing(view,screen)
{
	tableView.apply(this, arguments);
	// CALL PARENT CONSTRUCTOR !Important
	this.setFilters(
		{"ID":{"type":"text","ID":"ID"},"Host":{"type":"text","ID":"hostID"},"Client":{"type":"text","ID":"client"},"Store #":{"type":"text","ID":"storenum"},"Category":{"type":"text","ID":"category"},"Type":{"type":"select","ID":"type","options":[{"text":"All","value":""},{"text":"Quote","value":"quote"},{"text":"Monitor","value":"Monitor"},{"text":"Report","value":"Report"}]}}
	);
	var ref = this;
	this.refresh();
}

reportListing.prototype.map = function(){
	var ref = this;
	this.screen.changeView("10011");
	this.screen.views["10011"].content.html(
		this.writeDataMap(appData["Order"].data,function(markerData){
			ref.loadDetail(markerData);
		})
	);
}

reportListing.prototype.loadDetail = function(report){
	var reportDetail = this.screen.views['10004'];
	reportDetail.load(report);
	reportDetail.paint();
	this.screen.changeView('10004');
}

reportListing.prototype.loadReportDetail = function(report){

}

reportListing.prototype.refresh = function(){
	var ref = this;
	ref.loading();

	$.ajax({
		url: APP_PATH + 'report.asmx/getReportListing',
		type: 'POST',
		cache: false,
		data: this.ajaxParameters(),
		dataType: "json",
		traditional: true,
		success: function (data) {
			appData["Order"] = new collection(data.json.report.collection);
			if(data.success == "true"){
				var columns = [
					{"sTitle": "Report #", "mDataProp": "ID", "asSorting": [ "desc" ]},
					{"sTitle": "Host", "mDataProp": "FieldHostCompany"},
					{"sTitle": "Client", "mDataProp": "ClientCompany"},
					{"sTitle": "Storenum", "mDataProp": "Storenum"},
					{"sTitle": "NTE", "mDataProp": "VendorCost"},
					{"sTitle": "Severity", "mDataProp": "Severity"},
					{"sTitle": "Status", "mDataProp": "Status"},
					{"sTitle": "Type", "mDataProp": "Type"},
					{"sTitle": "Follow Up", "mDataProp": "FollowUp"},
					{"sTitle": "Comment", "mDataProp": "ShortComment"}
				];
				ref.theDataTable = ref.makeTable(ref.table,appData["Order"].array,columns,[[0,"desc"]],function(aData){ ref.loadDetail(aData); });
				// = ref.createTable(ref.table,appData["Order"].array,columns,ref.theDataTable);
				ref.resize();
				
				ref.complete();
			}
		}
	});	
}

reportListing.prototype.updateListing = function(){
	this.theDataTable.fnClearTable();
	this.theDataTable.fnAddData(appData["Order"].array);
}


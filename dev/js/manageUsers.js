manageUsers.prototype = new tableView();
function manageUsers(view,screen)
{
	// CALL PARENT CONSTRUCTOR !Important
	tableView.apply(this, arguments);
	this.refresh();
}

manageUsers.prototype.loadDetail = function(managedUser){
	var userDetail = this.screen.views['10017'];
	userDetail.load(managedUser);
	userDetail.paint();
	this.screen.changeView('10017',false);
}

manageUsers.prototype.refresh = function(){
	
	var ref = this;
	ref.loading();
	
	$.ajax({
		url: APP_PATH + 'user.asmx/getManagedUsers',
		type: 'POST',
		cache: false,
		data: this.ajaxParameters(),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				appData["managedUser"] = new collection(data.json.managedUser.collection);
				var columns = [
					{"sTitle": "ID", "mDataProp": "ID", "asSorting": [ "desc" ]},
					{"sTitle": "First Name", "mDataProp": "FirstName"},
					{"sTitle": "Last Name", "mDataProp": "LastName"},
					{"sTitle": "Username", "mDataProp": "Username"},
					{"sTitle": "Phone", "mDataProp": "Phone"},
					{"sTitle": "Email", "mDataProp": "Email"}
				];
				ref.theDataTable = ref.createTable(ref.table,appData["managedUser"].array,columns,ref.theDataTable);
				ref.resize();
				
				ref.complete();
			}
		}
	});
}
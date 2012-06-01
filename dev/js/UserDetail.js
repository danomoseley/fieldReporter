UserDetail.prototype = new View();
function UserDetail(view,screen)
{
	View.apply(this, arguments);
	this.getCurrentUser();
}

UserDetail.prototype.getCurrentUser = function(){
	var ref = this;
	if(!appData.currentUser){
		$.ajax({
			url: APP_PATH + 'user.asmx/getCurrentUser',
			type: 'POST',
			cache: false,
			data: ref.defaultAjaxParameters(),
			dataType: "json",
			traditional: true,
			success: function (data) {
				if(data.success == "true"){
					for (userID in data.json.user.collection) break;
					appData["currentUser"] = data.json.user.collection[userID];
					ref.load(appData["currentUser"]);
					ref.paint();
				}
			}
		});
	}else{
		ref.load(appData["currentUser"]);
	}
}

UserDetail.prototype.load = function(user){
	this.user = new Data(user);
	this.user.dataType = "User";
}

UserDetail.prototype.paintInfo = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div class='label'>").html("First Name"),$("<div class='value'>").html(ref.user.FirstName),
		$("<div class='label'>").html("Last Name"),$("<div class='value'>").html(ref.user.LastName),
		
		$("<div class='label'>").html("Phone Number"),$("<div class='value'>").html(ref.user.Phone),
		$("<div class='label'>").html("Email"),$("<div class='value'>").html(ref.user.Email)
	);
	
	return this.info;
}

UserDetail.prototype.paintAddDevice = function(){
	var ref = this;
	var reset = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Add New Device'>").click(function(){
			var data = {};
			data["userID"] = ref.user.ID;	
			
			$.ajax({
				url: APP_PATH + 'user.asmx/addFieldDevice',
				type: 'POST',
				cache: false,
				data: $.extend(data,ref.defaultAjaxParameters()),
				dataType: "json",
				traditional: true,
				success: function (data) {
					if(data.success == "true"){
						ref.refresh();
					}
				}
			});
		})
	);
	
	return reset;
}

UserDetail.prototype.paintInfoEdit = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div class='label'>").html("Username"),$("<div class='value'>").html(ref.user.Username),
		$("<div class='label'>").html("First Name"),$("<div class='value'>").append(
			$("<input type='text'>").val(ref.user.FirstName).change(function(){
				ref.user.set("FirstName",$(this).val());
			})
		),
		$("<div class='label'>").html("Last Name"),$("<div class='value'>").append(
			$("<input type='text'>").val(ref.user.LastName).change(function(){
				ref.user.set("LastName",$(this).val());
			})
		),
		$("<div class='label'>").html("Phone Number"),$("<div class='value'>").append(
			$("<input type='text'>").val(ref.user.Phone).change(function(){
				ref.user.set("Phone",$(this).val());
			})
		),
		$("<div class='label'>").html("Email"),$("<div class='value'>").append(
			$("<input type='text'>").val(ref.user.Email).change(function(){
				ref.user.set("Email",$(this).val());
			})
		)
	);
	
	return this.info;
}

UserDetail.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintInfoEdit(),
		this.paintAddDevice(),
		this.paintDeviceList()
	);
	this.content.forceRedraw(true);
}

UserDetail.prototype.paintDeviceList = function(view){	
	var ref = this;
	var data = {};
	data["userID"] = this.user.ID;	
	
	var deviceList = $("<table>").append("<thead>","<tbody>");
	
	var deviceSection = $("<div style='clear:both;'>").append(
		deviceList
	);
	
	$.ajax({
		url: APP_PATH + 'user.asmx/getDeviceList',
		type: 'POST',
		cache: false,
		data: $.extend(data,ref.defaultAjaxParameters()),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				
				ref.devices = new collection(data.json.device.collection,"FieldDevice");
				var columns = [
					{"sTitle": "ID", "mDataProp": "ID"},
					{"sTitle": "Active", "mDataProp": "ActiveType"},
					{"sTitle": "Name", "mDataProp": "Name", "bVisible": false},
					{"sTitle": "Name", "mDataProp": "NameEdit","iDataSort": 2},
					{"sTitle": "Auth Code", "mDataProp": "AuthorizationCode"},					
					{"sTitle": "Billing", "mDataProp": "BillingID", "bVisible": false},
					{"sTitle": "Billing", "mDataProp": "BillingIDEdit","iDataSort": 5},
					{"sTitle": "LastActivity", "mDataProp": "LastActivity"},
					{"sTitle": "Current", "mDataProp": "currentDevice", "bVisible": false},
					{"sTitle": "Current", "mDataProp": "currentDeviceCheck","iDataSort": 8},
					
				];
				
				var theDataTable = deviceList.dataTable({
					"aaData": ref.devices.array,
					"aoColumns": columns,
					"bPaginate": true,
					"sPaginationType": "full_numbers",
					"bLengthChange": false,
					"iDisplayLength": 11,
					"bFilter": true,
					"bSort": true,
					"bInfo": false,
					"bAutoWidth": false,
					"bRetrive": true,
					"bDestroy": true,
					"sDom": 'lftip',
					"aaSorting": [[ 9, "desc" ],[ 7, "desc" ]]
				});
				$("tr",deviceList).click(function(event) {
					var aData = theDataTable.fnGetData( event.target.parentNode );
					if(!aData) aData = theDataTable.fnGetData( event.target.parentNode.parentNode );
					var fieldDeviceDetail = ref.screen.views["10018"];
					fieldDeviceDetail.load(aData);
					fieldDeviceDetail.paint();
					ref.screen.changeView("10018",false);
				});
				$("tr input:not([disabled='disabled'])",deviceList).click(function(event){
					event.preventDefault();
					return false;
				});
				
				$("tr input",deviceList).change(function(event){
					var aData = theDataTable.fnGetData( event.target.parentNode.parentNode );
					aData.set($(this).attr("fieldname"),$(this).val());
					return false;
				});
				deviceList.forceRedraw(true);
			}
		}
	});
	
	return deviceSection;
}

UserDetail.prototype.refresh = function(){
	this.info = this.paint();
}
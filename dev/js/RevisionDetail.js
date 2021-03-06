RevisionDetail.prototype = new View();
function RevisionDetail(view,screen)
{
	View.apply(this, arguments);
}

RevisionDetail.prototype.load = function(user){
	this.user = new Data(user);
	this.user.dataType = "User";
}

RevisionDetail.prototype.paintInfo = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div class='label'>").html("First Name"),$("<div class='value'>").html(ref.user.FirstName),
		$("<div class='label'>").html("Last Name"),$("<div class='value'>").html(ref.user.LastName),
		
		$("<div class='label'>").html("Phone Number"),$("<div class='value'>").html(ref.user.Phone),
		$("<div class='label'>").html("Email"),$("<div class='value'>").html(ref.user.Email)
	);
	
	return this.info;
}

RevisionDetail.prototype.paintAddDevice = function(){
	var ref = this;
	var reset = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Add New Device'>").click(function(){
			var data = {};
			data["userID"] = ref.user.ID;	
			
			$.ajax({
				url: APP_PATH + 'app.asmx/addFieldDevice',
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

RevisionDetail.prototype.paintAddQuery = function(){
	var ref = this;
	return $("<input type='submit' value='Add Database Update Query'>").click(function(){
		var viewID = "10027";
		var CreateRevision = ref.screen.views[viewID];
		//CreateRevision.load(aData);
		CreateRevision.paint();
		ref.screen.changeView(viewID,false);
	});
}

RevisionDetail.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		"Hello World!",
		this.paintList(),
		this.paintAddQuery()
	);
	this.content.forceRedraw(true);
}

RevisionDetail.prototype.paintList = function(view){	
	var ref = this;
	var data = {};
	data["userID"] = "100007";
	
	var deviceList = $("<table>").append("<thead>","<tbody>");
	var deviceSection = $("<div style='clear:both;'>").append(
		deviceList
	);
	
	$.ajax({
		url: APP_PATH + 'app.asmx/getDeviceList',
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
				
				ref.makeTable(deviceList,ref.devices.array,columns,function(aData){ alert("oh hi"); });
				deviceList.forceRedraw(true);
			}
		}
	});
	
	return deviceSection;
}

RevisionDetail.prototype.refresh = function(){
	this.info = this.paint();
}


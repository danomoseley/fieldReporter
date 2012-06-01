FieldDeviceDetail.prototype = new View();
function FieldDeviceDetail(managedUser)
{
	View.apply(this, arguments);
}

FieldDeviceDetail.prototype.load = function(fieldDevice){
	this.fieldDevice = new Data(fieldDevice);
	this.fieldDevice.dataType = "FieldDevice";
}

FieldDeviceDetail.prototype.paintInfo = function(){
	var ref = this;	
	
	var info = $("<div class='info'>").append(
		$("<div class='label'>").html("ID"),$("<div class='value'>").html(ref.fieldDevice.ID),
		$("<div class='label'>").html("Name"),$("<div class='value'>").append(ref.fieldDevice.NameEdit),
		$("<div class='label'>").html("Active"),$("<div class='value'>").html(ref.fieldDevice.ActiveType),
		$("<div class='label'>").html("Input Date"),$("<div class='value'>").html(ref.fieldDevice.Inputdate),
		$("<div class='label'>").html("Billing ID"),$("<div class='value'>").html(ref.fieldDevice.BillingID),
		$("<div class='label'>").html("User Agent"),$("<div class='value'>").html(ref.fieldDevice.UserAgent),
		$("<div class='label'>").html("Last Activity"),$("<div class='value'>").html(ref.fieldDevice.LastActivity)
	);
	
	$("input",info).change(function(event){
		ref.fieldDevice.set($(this).attr("fieldname"),$(this).val());
	});
	
	return info;
}

FieldDeviceDetail.prototype.paintReset = function(){
	var ref = this;
	var reset = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Reset Device'>").click(function(){
			if(confirm("Are you sure?")){
				var data = {};
				data["deviceID"] = ref.fieldDevice.ID;	
				
				$.ajax({
					url: APP_PATH + 'FieldDevice.asmx/resetDevice',
					type: 'POST',
					cache: false,
					data: $.extend(data,ref.defaultAjaxParameters()),
					dataType: "json",
					traditional: true,
					success: function (data) {
						if(data.success == "true"){
							alert("Device Reset");
						}
					}
				});
			}
		})
	);
	
	return reset;
}

FieldDeviceDetail.prototype.paintPromote = function(){
	var ref = this;
	var promote = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Promote'>").click(function(){
			var data = {};
			data["deviceID"] = ref.fieldDevice.ID;	
			$.ajax({
				url: APP_PATH + 'FieldDevice.asmx/resetDevice',
				type: 'POST',
				cache: false,
				data: $.extend(data,ref.defaultAjaxParameters()),
				dataType: "json",
				traditional: true,
				success: function (data) {
					if(data.success == "true"){
						IDS.promote(data.json.response.collection[0].SessionID);
					}
				}
			});
		})
	);
	
	return promote;
}


FieldDeviceDetail.prototype.paintDelete = function(){
	var ref = this;
	var reset = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Remove Device'>").click(function(){
			if(confirm("Are you sure?")){
				var data = {};
				data["deviceID"] = ref.fieldDevice.ID;	
				
				$.ajax({
					url: APP_PATH + 'FieldDevice.asmx/removeDevice',
					type: 'POST',
					cache: false,
					data: $.extend(data,ref.defaultAjaxParameters()),
					dataType: "json",
					traditional: true,
					success: function (data) {
						if(data.success == "true"){
							ref.goBack();
						}
					}
				});
			}
		})
	);
	
	return reset;
}

FieldDeviceDetail.prototype.paintActivityLog = function(){	
	var ref = this;
	var data = {};
	data["sessionID"] = IDS.getSession();
	data["deviceID"] = this.fieldDevice.ID;	
	
	var activityLog = $("<table>").append("<thead>","<tbody>");
	
	$("tbody",activityLog).append(
		$("<tr>").addClass("wait").html("Please Wait Activity Log Loading...")
	);
	
	$.ajax({
		url: APP_PATH + 'FieldDevice.asmx/getActivityLog',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				ref.activity = new collection(data.json.activity.collection);
				var columns = [
					{"sTitle": "Action", "mDataProp": "Action"},
					{"sTitle": "Action Date", "mDataProp": "ActionDate"}
				];
				
				ref.makeTable(activityLog,ref.activity.array,columns);				
			}
		}
	});
	
	return activityLog;
}

FieldDeviceDetail.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintInfo(),
		this.paintReset(),
		this.paintDelete(),
		this.paintPromote(),
		this.paintActivityLog()
	);
	this.content.forceRedraw(true);
}

FieldDeviceDetail.prototype.map2 = function(){
	var ref = this;
	this.screen.changeView("10021");
	this.screen.views["10021"].content.html(
		this.writeDataMap(ref.activity.data)
	);
}

FieldDeviceDetail.prototype.refresh = function(){
	this.info = this.paint();
}
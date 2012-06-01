AppRevisions.prototype = new View();
function AppRevisions(view,screen)
{
	View.apply(this, arguments);
	this.refresh();
}

AppRevisions.prototype.load = function(user){
	this.user = new Data(user);
	this.user.dataType = "User";
}

AppRevisions.prototype.paintInfo = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div class='label'>").html("First Name"),$("<div class='value'>").html(ref.user.FirstName),
		$("<div class='label'>").html("Last Name"),$("<div class='value'>").html(ref.user.LastName),
		
		$("<div class='label'>").html("Phone Number"),$("<div class='value'>").html(ref.user.Phone),
		$("<div class='label'>").html("Email"),$("<div class='value'>").html(ref.user.Email)
	);
	
	return this.info;
}

AppRevisions.prototype.paintAddDevice = function(){
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

AppRevisions.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintList(),
		this.paintCreateRevision()
	);
	this.content.forceRedraw(true);
}

AppRevisions.prototype.paintCreateRevision = function(){
	var ref = this;
	return $("<input type='submit' value='Create Revision'>").click(function(){
		var viewID = "10025";
		var CreateRevision = ref.screen.views[viewID];
		//CreateRevision.load(aData);
		CreateRevision.paint();
		ref.screen.changeView(viewID,false);
	});
}

AppRevisions.prototype.getRevisionDetail = function(revison){
	var viewID = "10026";
	var CreateRevision = this.screen.views[viewID];
	//CreateRevision.load(aData);
	CreateRevision.paint();
	this.screen.changeView(viewID,false);
}

AppRevisions.prototype.paintList = function(view){	
	var ref = this;
	var data = {};
	data["appID"] = this.screen.window.wall.app.ID;
	
	var deviceList = $("<table>").append("<thead>","<tbody>");
	var deviceSection = $("<div style='clear:both;'>").append(
		deviceList
	);
	
	$.ajax({
		url: APP_PATH + 'app.asmx/getAppRevisions',
		type: 'POST',
		cache: false,
		data: $.extend(data,ref.defaultAjaxParameters()),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){				
				ref.devices = new collection(data.json.revision.collection,"Revision");
				var columns = [
					{"sTitle": "Revision Number", "mDataProp": "revisionNumber"},
					{"sTitle": "Detail", "mDataProp": "Detail"}					
				];
				
				ref.makeTable(deviceList,ref.devices.array,columns,[[ 0, "desc" ]],function(){ ref.getRevisionDetail(); });
				deviceList.forceRedraw(true);
			}
		}
	});
	
	return deviceSection;
}

AppRevisions.prototype.refresh = function(){
	this.info = this.paint();
}
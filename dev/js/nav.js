function Nav(obj){
	this.obj = obj;
	var ref = this;
	this.notificationTray = $("<div>").attr("class","notificationTray");
	$(this.obj).append(
		this.notificationTray
	);
}

Nav.prototype.toast = function(message){
	$(this.notificationTray).append(
		$("<div>").addClass("toast").html(message.title + message.body)
	);
}
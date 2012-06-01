// NEED TO TRANSFORM THIS INTO A WEB WORKER TO INCREASE PERFORMANCE

function masterSync()
{
	this.queue = {};
	var ref = this;
	this.job = setInterval(function(){ ref.sync(true) },10000);
	this.syncRequired = false;
}

masterSync.prototype.add = function(type,ID,field,syncRequest){
	if(!this.queue[type]) this.queue[type] = {};
	if(!this.queue[type][ID]) this.queue[type][ID] = {};
	if(!this.queue[type][ID][field]) this.queue[type][ID][field] = new Array();
	this.queue[type][ID][field].push(syncRequest);
	this.syncRequired = true;
}

masterSync.prototype.sync = function(scheduled){
	var ref = this;
	if(this.syncRequired){
		var data = {};
		data["sync"] = JSON.stringify(this.queue)
		
		if(scheduled) var dataLength = lengthInUtf8Bytes(data["sync"]);
		
		$.ajax({
			url: APP_PATH + 'app.asmx/sync',
			type: 'POST',
			cache: false,
			data: data,
			dataType: "json",
			traditional: true,
			success: function (data) {
				if(data.success == "true"){
					ref.syncRequired = false;
					ref.queue = {};
					if(scheduled){
						IDS.toast("Sync Success",dataLength + " bytes synced");
					}
				}
			}
		});
	}
}
function Data(json)
{
	$.extend(this,json);
}

Data.prototype.set = function(key,val){
	if(key in this){
		if(this.dataType != undefined){
			var syncRequest = {};
			syncRequest.oldVal = this[key];
			syncRequest.newVal = val;		
			masterQueue.add(this.dataType,this.ID,key,syncRequest);
			masterQueue.sync();
			this[key] = val;
		}
	}else{
		console.log("Invalid key " + key);
	}
}

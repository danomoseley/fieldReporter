function collection(jsonCollection,dataType)
{
	this.data = {};
	this.array = new Array();
	var ref = this;
	$.each(jsonCollection,function(i,val){
		var theData = new Data(val);
		theData.dataType = dataType;
		ref.data[i] = theData;
		ref.array.push(theData);
	});
}
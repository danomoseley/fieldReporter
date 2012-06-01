connectionDetail.prototype = new View();
function connectionDetail(view,screen)
{
	View.apply(this, arguments);
}
connectionDetail.prototype.load = function(connection){
	this.connection = new Data(connection);
	this.connection.dataType = "Company_Host";
}

connectionDetail.prototype.paintInfo = function(){
	var ref = this;	
	
	this.info = $("<div class='info'>").append(
		$("<div class='label'>").html("Company"),$("<div class='value'>").html(ref.connection.Company)
	);
	
	return this.info;
}

connectionDetail.prototype.paintReplyForm = function(){
	var ref = this;	
	
	var data = {};
	data["connectionID"] = this.connection.ID;
	
	this.info = $("<div style='clear:both;'>").append(
		$("<input type='submit' value='Accept'>").click(function(){
			$.ajax({
				url: APP_PATH + 'app.asmx/acceptConnection',
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
		})
	);
	
	return this.info;
}

connectionDetail.prototype.paintReply = function(){
	this.content.html("");
	this.content.append(
		this.paintInfo(),
		this.paintReplyForm()
	);
	this.content.forceRedraw(true);
}

connectionDetail.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintInfo()
	);
	this.content.forceRedraw(true);
}

connectionDetail.prototype.refresh = function(){
	this.info = this.paint();
}
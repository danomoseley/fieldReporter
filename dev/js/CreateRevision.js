CreateRevision.prototype = new View();
function CreateRevision(view,screen)
{
	View.apply(this, arguments);
}

CreateRevision.prototype.paintForm = function(){
	var ref = this;
	var form = $("<form style='clear:both;'>").append(
		$("<textarea>"),
		$("<input type='submit' value='Add Revision'>").click(function(){
			var data = {};
			data["appID"] = ref.screen.window.wall.app.ID;
			data["detail"] = $("textarea",$(this).parent()).val();
			
			$.ajax({
				url: APP_PATH + 'app.asmx/addRevision',
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
			
			return false;
		})
	);
	
	return form;
}

CreateRevision.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintForm()
	);
	this.content.forceRedraw(true);
}

CreateRevision.prototype.refresh = function(){
	this.info = this.paint();
}
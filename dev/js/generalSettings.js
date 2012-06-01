generalSettings.prototype = new View();
function generalSettings(view,screen)
{
	// CALL PARENT CONSTRUCTOR !Important
	View.apply(this, arguments);
	
	this.content.append(
		$("<span>").html("Extra Wide"),
		$("<input type='checkbox' checked='checked'>").click(function(){
			$(".viewContainer").toggleClass("wide");
		})
	);
}
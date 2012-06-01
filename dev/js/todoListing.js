todoListing.prototype = new tableView();
function todoListing(view,screen)
{
	// CALL PARENT CONSTRUCTOR !Important
	tableView.apply(this, arguments);
	this.paint();
	this.refresh();
}

todoListing.prototype.loadDetail = function(todo){
	var todoDetail = this.screen.views['10010'];
	todoDetail.load(todo);
	todoDetail.paint();
	this.screen.changeView('10010');
}

todoListing.prototype.map = function(){
	var ref = this;
	this.screen.changeView("10012");
	this.screen.views["10012"].content.html(
		this.writeDataMap(appData["todo"].data,function(markerData){
			ref.loadDetail(markerData);
		})
	);
}

todoListing.prototype.paint = function(){
	var ref = this;
	this.content.append(
		$("<form>").append(
			$("<textarea>").css("width","100%"),
			$("<input>").attr("type","submit").css("float","right").attr("value","Save").click(function(e){
				e.preventDefault();
				var data = {};
				data["detail"] = $("textarea",$(this).parent()).val();
				var form = $(this).parent();
				$.ajax({
					url: APP_PATH + 'todo.asmx/addToDo',
					type: 'POST',
					cache: false,
					data: $.extend(data,ref.defaultAjaxParameters()),
					dataType: "json",
					traditional: true,
					success: function (data) {
						if(data.success == "true"){
							$("textarea",form).val("");
							ref.refresh();
						}
					}
				});
			})
		)
	);
}

todoListing.prototype.refresh = function(){
	
	var ref = this;
	ref.loading();
	
	$.ajax({
		url: APP_PATH + 'todo.asmx/getToDoListing',
		type: 'POST',
		cache: false,
		data: this.ajaxParameters(),
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				appData["todo"] = new collection(data.json.todo.collection);
				var columns = [
					{"sTitle": "ID", "mDataProp": "ID", "asSorting": [ "desc" ]},
					{"sTitle": "Author First Name", "mDataProp": "FirstName"},
					{"sTitle": "Author Last Name", "mDataProp": "LastName"},
					{"sTitle": "Detail", "mDataProp": "detail"},
					{"sTitle": "Input", "mDataProp": "inputDate"}
				];
				ref.theDataTable = ref.createTable(ref.table,appData["todo"].array,columns,ref.theDataTable);
				ref.resize();
				$("tr",ref.table).click( function() {
					//$(this).remove();
				} );
				ref.complete();
			}
		}
	});
}
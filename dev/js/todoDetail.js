todoDetail.prototype = new View();
function todoDetail(view,screen)
{
	View.apply(this, arguments);
}

todoDetail.prototype.load = function(todo){
	this.todo = new Data(todo);
	this.todo.dataType = "ToDo";
}

todoDetail.prototype.paintThread = function(){
	var ref = this;
	var data = {};
	data["sessionID"] = IDS.getSession();
	data["todoID"] = this.todo.ID;
	
	if(!this.threadHTML) this.threadHTML = $("<ul style='overflow:hidden;width:100%;'>").addClass("thread");

	$.ajax({
		url: APP_PATH + 'todo.asmx/getToDoThreads',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				ref.thread = new collection(data.json.todoThread.collection);
				ref.threadHTML.html("");
				$.each(ref.thread.data,function(k,v){
					ref.threadHTML.append(
						$("<li style='overflow:hidden;'>").html(v.detail + " - " + v.FirstName + " " + v.LastName + " @ " + v.inputDate).click(function(){
							if(v.edit.toLowerCase() == "true"){
								var item = this;
								var data = {};
								data["sessionID"] = IDS.getSession();
								data["threadID"] = v.ID;
								$(this).append(
									$("<span>").html("delete").click(function(){
										$.ajax({
											url: APP_PATH + 'app.asmx/deleteToDoThread',
											type: 'POST',
											cache: false,
											data: data,
											dataType: "json",
											traditional: true,
											success: function (data) {
												if(data.success == "true"){
													$(item).fadeOut();
												}
											}
										});
										return false;
									})
								);
								$(this).forceRedraw(true);
							}
						})
					);
				});
			}
		}
	});
	return this.threadHTML
}

todoDetail.prototype.paintReply = function(){
	var todo = this;
	var reply = $("<textarea>");
	return $("<div style='clear:both;overflow:hidden;'>").append(
		reply,
		$("<input type='submit' value='Reply'>").click(function(){
			var data = {};
			data["sessionID"] = IDS.getSession();
			data["todoID"] = todo.ID;
			data["detail"] = reply.val();
			
			$.ajax({
				url: APP_PATH + 'todo.asmx/addToDoThread',
				type: 'POST',
				cache: false,
				data: data,
				dataType: "json",
				traditional: true,
				success: function (data) {
					if(data.success == "true"){
						reply.val("");
						todo.paintThread();
					}
				}
			});
		}),
		$("<div style='clear:both;'>")
	);
}

todoDetail.prototype.paintInfo = function(){
	var todo = this.todo;	
	
	return $("<div>").append(
		$("<div>").html("<h2>" + todo.inputDate + " " + todo.FirstName + " " + todo.LastName + " suggested</h2>"),
		$("<div style='padding-left:15px;'>").addClass("data").append(
			$("<div>").addClass("viewMode").html(todo.detail).click(function(){
				$(this).parent().toggleClass("edit");
			}),
			$("<div>").addClass("editMode").append(
				$("<textarea>").val(todo.detail).change(function(){
					todo.set("detail",$(this).val());
				})
			)
		)
	);
}

todoDetail.prototype.paint = function(){
	this.content.html("");
	this.content.append(
		this.paintInfo(),
		this.paintThread(),
		this.paintReply()
	);
}
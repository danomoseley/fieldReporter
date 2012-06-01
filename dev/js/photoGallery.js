
function photoGallery(linkType,linkID,quality,newObject){
	this.closeEnabled = false;
	this.db = openDatabase("main", "", "First Database", 500000);
	
    this.db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS photos (Seqnum INTEGER PRIMARY KEY AUTOINCREMENT, linkType TEXT, linkID TEXT, data TEXT, comment TEXT)');
    });
	var id = (new Date()).getTime();
	var p_Gallery = this;
	this.html = $("<div>").append(
		$("<div>").addClass("photoCount small-shadow").append($("<div>").append($("<div>").addClass("number").html("0"),$("<div>").addClass("countLabel").html("photos"))).hide(),
		$("<div>").addClass("slider small-shadow").append(
			$("<div>").addClass("gallery").append(
				$("<div>").addClass("emptyGallery").append($("<div>").addClass("empty").html("No photos yet!"),$("<div>").addClass("loading").html("Please wait, the gallery is loading...")),				
				$("<div>").addClass("cleaner")
			),
			$("<div>").addClass("more")
		),
		this.closeEnabled ? $("<div>").addClass("closer small-shadow").html("Close").click(function(){ p_Gallery.remove(); }) : "",
		$("<div>").addClass("cleaner")
	).data("gallery",this).attr("id","gallery_"+id).addClass("photoGallery");
	
	if($("#general_settings #photoGallery").val() == "FilmStrip"){
		this.html.addClass("film");
	}
	
	if(quality == undefined){
		quality = 50;
	}
	
	if(IDS.cameraSupported){
		$(".slider",this.html).css("min-height","150px");
		this.html.prepend($("<div>").addClass("newPhoto").addClass(IDS.phoneGapReady ? "" : "disabled").click(function(){
			if(!$(this).hasClass("disabled")){
				navigator.camera.getPicture(function(imageData) {
					p_Gallery.addImage(imageData,true,false);
				}, function(message){}, { quality: quality });
			}else{
				alert("Camera not yet initialized, please try again in a few seconds");
			}
		}));
		$(".emptyGallery",this.html).append("  Touch the camera icon to the left to associate photos now.");
		$(".photoCount",this.html).css("margin-top","2px");
	}
	this.quality = quality;
	this.linkType = linkType;
	this.linkID = linkID;
	this.id = "gallery_"+id;
	this.addImage = addImage;
	this.removeImage = removeImage;
	this.remove = removeGallery;
	this.images = {};
	this.numImages = 0;
	this.totalWidth = 0;
	this.sync = saveGallery;
	this.saveImage = saveImage;
	this.syncImage = syncImage;
	this.load = loadGallery;
	this.newObject = newObject;
	
	var ref = this;
	this.test = function(){
		ref.addImage("R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==",true)
	}
	
	if(newObject == undefined) this.newObject = false;
	
	if(this.newObject == false){
		this.load();
	}
	this.containerDelete = $("<div>");
	this.externalCount = undefined;	
	//this.syncTask = setInterval(p_Gallery.sync(p_Gallery), 10000);
	return this;
}

function removeGallery(){
	window.clearInterval(this.syncTask);
	this.html.remove();
	this.containerDelete.remove();
	delete this;
}

function loadGallery(){
	var data = {};
	data["linkType"] = this.linkType;
	data["linkID"] = this.linkID;
	var p_gallery = this;
	$(".photoCount,.emptyGallery",this.html).addClass("saving").show();
	
	this.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM photos WHERE linkType=? AND linkID=?', [p_gallery.linkType,p_gallery.linkID], function (tx, results) {
			for (i = 0; i < results.rows.length; i++) {
				var v = results.rows.item(i);
				p_gallery.addImage(v.data,false,false,0,v.comment);
			}
		}, null);
	});	
	
	$.ajax({
		url: APP_PATH + 'photo.asmx/loadPhotos',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){				
				$.each(data.photos, function (k, v) {
					p_gallery.addImage(null,false,true,v.docID,v.comment);
				});
				if(p_gallery.numImages == 0 && p_gallery.externalCount != undefined){
					p_gallery.externalCount.addClass("imageCountZero");
				}
			}
			$(".photoCount,.emptyGallery",p_gallery.html).removeClass("saving");
		}
	});
}

function saveGallery(gallery){
	for(imageID in gallery.images){
		if(!gallery.images[imageID]["sync"]){
			gallery.syncImage(imageID);
		}
	}
}

function removeImage(id){
	if(this.images[id].sync){
		var data = {};
		data["imageID"] = this.images[id].docID;
		data["linkType"] = this.linkType;
		data["linkID"] = this.linkID;
		var p_Gallery = this;
		$(".photoCount,.emptyGallery",p_Gallery.html).addClass("saving");
		
		$.ajax({
			url: APP_PATH + 'photo.asmx/deletePhoto',
			type: 'POST',
			cache: false,
			data: data,
			dataType: "json",
			traditional: true,
			success: function (data) {
				if(data.success == "true"){
					$(".photoCount,.emptyGallery",p_Gallery.html).removeClass("saving");
				}else{
					alert("There has been an error deleting your image, please try again later");
				}
			}
		});
	}
	
	this.numImages--;
	$(".gallery",this.html).css("width",this.totalWidth);
	$(".photoCount div .number",this.html).html(this.numImages);
	if(this.externalCount != undefined){
		this.externalCount.html(this.numImages);
	}
	
	if(this.numImages == 0){
		//$(".photoCount",this.html).hide();
		$(".emptyGallery",this.html).show();
		$(".gallery",this.html).css("width","100%");
		if(this.externalCount != undefined){
			this.externalCount.addClass("imageCountZero");
		}
	}
	delete this.images[id];
	return this;
}

function saveImage(id){	
	var p_Gallery = this;
	
	this.db.transaction(function (tx) {
		tx.executeSql("INSERT INTO photos (linkType,linkID,data,comment) VALUES (?,?,?,?)", [p_Gallery.linkType, p_Gallery.linkID, p_Gallery.images[id]["data"], p_Gallery.images[id]["comment"]], function (tx, results) {			
			p_Gallery.images[id]["dbID"] = results.insertId;
			p_Gallery.sync(p_Gallery);
		}, errorHandler);
	});	
}

function syncImage(id){
	var data = {};
	data["imageData"] = this.images[id]["data"];
	data["linkType"] = this.linkType;
	data["linkID"] = this.linkID;
	data["comment"] = this.images[id]["comment"];
	data["sessionID"] = IDS.getSession();
	var p_Gallery = this;
	$.ajax({
		url: APP_PATH + 'photo.asmx/savePhoto',
		type: 'POST',
		cache: false,
		data: data,
		dataType: "json",
		traditional: true,
		success: function (data) {
			if(data.success == "true"){
				p_Gallery.db.transaction(function (tx) {
					tx.executeSql("DELETE FROM photos WHERE seqnum=?", [p_Gallery.images[id]["dbID"]],null,null);
				});
				
				p_Gallery.images[id]["sync"] = true;
				p_Gallery.images[id]["docID"] = data.id;
			}
		}
	});
}

function errorHandler(transaction, error)
{
    // error.message is a human-readable string.
    // error.code is a numeric error code
    alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
 
    // Handle errors here
    var we_think_this_error_is_fatal = true;
    if (we_think_this_error_is_fatal) return true;
    return false;
}

function addImage(imageData,newImage,url,docID,comment){
	
	$(".emptyGallery",this.html).hide();
	
	this.numImages++;
	$(".photoCount div .number",this.html).html(this.numImages);
	if(this.externalCount != undefined){
		this.externalCount.html(this.numImages);
		this.externalCount.removeClass("imageCountZero");
	}
	
	var id = (new Date()).getTime();
	this.images[id] = {};
	if(id != undefined){
		this.images[id]["docID"] = docID;
	}	
	this.images[id]["data"] = imageData;
	this.images[id]["location"] = currentLocation;
	this.images[id]["sync"] = !newImage;
	this.images[id]["dbID"] = undefined;
	
	if(comment != undefined){
		this.images[id]["comment"] = comment;
	}else{
		this.images[id]["comment"] = "";
	}
	
	if(newImage){
		this.images[id]["comment"] = prompt("Comment for this photo:");
		if(!this.newObject) this.saveImage(id);
	}
	
	var imagePath;
	var thumbPath;
	if(url){
		this.images[id]["photoURL"] = APP_PATH + 'photo.asmx/get?id='+docID,
		this.images[id]["thumbURL"] = APP_PATH + 'photo.asmx/thumb?id='+docID,
		imagePath = this.images[id]["photoURL"] + "&.jpg";
		thumbPath = this.images[id]["thumbURL"];
	}else{
		imagePath = "data:image/jpeg;base64,"+imageData;
		thumbPath = "data:image/jpeg;base64,"+imageData;
	}
	var p_Gallery = this;
	
	var image = $("<div>").addClass("photoHolder").append(
		$("<a>").addClass("userImage").attr("href",imagePath).attr("rel",this.id).attr("title",this.images[id]["comment"]).append(
			$("<img>").addClass("userPicture").attr("src",thumbPath).load(function(){
				p_Gallery.totalWidth += $(this).parent().parent().outerWidth(true);
				$(".gallery",p_Gallery.html).css("width",p_Gallery.totalWidth);
				$(this).parent().parent().show();
			})
		).fancybox(),
		$("<span>").addClass("delete-icon").append(
			$("<img>").attr("src",IDS.remoteURL+"img/delete-icon.png").attr("alt","Delete")
		).attr("id",id).click(function(){
			if(confirm("Are you sure you want to remove this image?")){
				var gallery = $(this).parent().parent().parent().parent().data("gallery");
				gallery.totalWidth -= $(this).parent().outerWidth(true);
				gallery.removeImage($(this).parent().data("id"));
				$(this).parent().remove();
			}
		}),
		$("<div>").addClass("comment").html(this.images[id]["comment"].substring(0,50))
	).data("id",id).hide();
	
	if(!url){
		$(".userPicture",image).css("width","200px");
		$(".photoHolder",image).css("width","200px");		
	}else{
		$(".userImage", image).fancybox()
	}
	
	$("a[href^='data:image']",image).each(function(){
		$(this).fancybox({
			content: $("<img/>").attr("src", this.href),
			'transitionIn'		: 'none',
			'transitionOut'		: 'none',
			'autoScale'			: false,
			'changeSpeed'		: 0,
			'cyclic'			: true,
			'onStart'			: function(){
				$("#fancybox-wrap").hide();
			},
			'onComplete'		: function(){
				var viewportwidth = getViewportWidth();
				var viewportheight = getViewportHeight();
				
				if(viewportwidth > viewportheight){
					var width = $("#fancybox-content img").width();
					var height = $("#fancybox-content img").height();
					var newHeight = viewportheight-100;
					var newWidth = (width*newHeight)/height;
					
					$("#fancybox-content img").width(newWidth);
					$("#fancybox-content img").height(newHeight);
					$("#fancybox-content").width(newWidth);
					$("#fancybox-wrap").width(newWidth+20);
				}else{
					var width = $("#fancybox-content img").width();
					var height = $("#fancybox-content img").height();
					var newWidth = viewportwidth-100;
					var newHeight = (height*newWidth)/width;
					
					
										
					$("#fancybox-content img").width(newWidth);
					$("#fancybox-content img").height(newHeight);
					$("#fancybox-content").width(newWidth);
					$("#fancybox-wrap").width(newWidth+20);
				}
				
				$.fancybox.resize();
				$("#fancybox-wrap").show();
			}
		});
	});
	
	$(".gallery",this.html).prepend(image);
	return this;
}

function placeGallery(dest,type,Seqnum){
	var gallery = new photoGallery(type,Seqnum);
	$(".slider",gallery.html).css("width",dest.width()-124);
	
	var gal = $("<tr>").append($("<td colspan=99>").append(gallery.html))
	gallery.containerDelete = gal;
	dest.after(gal);
	
	return gallery;
}

function createGallery(destination,type,id){
	var gallery = new photoGallery(type,id);
	$(destination).append(gallery.html);
	return gallery;
}


function testGallery(num){
	var gallery = new photoGallery("test","0");
	$("#inspectionWindow #listing .topBar").append(gallery.html);
	for(i=0;i<num;i++){
		gallery.addImage("R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==",false)
	}
}
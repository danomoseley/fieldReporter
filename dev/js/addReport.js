addReport.prototype = new View();
function addReport(view,screen)
{
	View.apply(this, arguments);
	var ref = this;
	this.fields = {};
	this.Clients = [];
	this.FieldHosts = [];
	this.FieldHost = $("<input type='text' style='width:95%;' class='formEntry manual required' memberID='hostID'>");
	this.Client = $("<input type='text' style='width:95%;' class='formEntry manual required' memberID='clientID'>");
	
	var after = function(){
		if(appData["Client"]){
			$.each(appData["Client"],function(k,v){
				ref.Clients.push(v.Company);
				appData["Client"][v.Company] = v;
			});	
			ref.Client.autocomplete({    
				source: ref.Clients,
				select: function(event, ui) {
					ref.fields.clientID = appData["Client"][ui.item.value].ID;
				}
			});
		}
		if(appData["FieldHost"]){
			$.each(appData["FieldHost"],function(k,v){
				ref.FieldHosts.push(v.Company);
				appData["FieldHost"][v.Company] = v;
			});
			ref.FieldHost.autocomplete({
				source: ref.FieldHosts,
				select: function(event, ui) {
					ref.fields.hostID = appData["FieldHost"][ui.item.value].ID;
				}
			});
		}
		
		
	};
	
	if(appData.ready){
		after();
	}else{
		afterLoad.push(after);
	}

	this.drawForm();
	
	$(".formEntry:not(.manual)",this.html).change(function(){	
		ref.fields[$(this).attr("memberID")] = $(this).val();
	});
	
	this.fields.severity = "";
	this.fields.type = "";
	this.fields.details = "";
	
	$(".formEntry:not(.manual)").change(function(){	
		ref.fields[$(this).attr("memberID")] = $(this).val();
	});
}

addReport.prototype.save = function(){
	var ref = this;
	if(ref.validate()){
		ref.screen.currentView.loading();	
		$.ajax({
			url: APP_PATH + 'report.asmx/addReport',
			type: 'POST',
			cache: false,
			data: $.extend(ref.fields,ref.defaultAjaxParameters()),
			dataType: "json",
			traditional: true,
			success: function (data) {
				if(data.success == "true"){
				
					ref.screen.currentView.complete();
					ref.screen.window.screens[10002].changeView("10003");
					ref.screen.window.screens[10002].views[10003].refresh();
					ref.screen.window.changeScreenByID(10002);
					
					var reportID = 0;
					$.each(data.json.report.collection,function(k,v){
						reportID = v.ID;
					});
					ref.photoGallery.linkType = "report";
					ref.photoGallery.linkID = reportID;
					ref.photoGallery.sync(ref.photoGallery);
					ref.reset();
				}
			}
		});
	}
}

addReport.prototype.validate = function(){
	var valid = true;
	var ref = this;
	$(".formEntry.required:not([disabled='disabled'])",this.html).each(function(k,input){
		if(ref.fields[$(input).attr("memberID")]==undefined || ref.fields[$(input).attr("memberID")]=="" ){
			if($(input).is(".inner")){
				$(input).parent().addClass("review");
			}else{
				$(input).addClass("review");
			}			
			valid = false;
		}else{
			if($(input).is(".inner")){
				$(input).parent().removeClass("review");
			}else{
				$(input).removeClass("review");
			}	
		}
	});
	return valid;
}

addReport.prototype.reset = function(){
	this.fields = {};
	this.fields.sessionID = IDS.getSession();
	this.fields.hostID = "";
	this.fields.clientID = "";
	this.fields.severity = "";
	this.fields.type = "";
	this.fields.details = "";
	
	$(".formEntry",this.html).each(function(k,input){
		if($(input).is(".inner")){
			$(input).parent().removeClass("review");
		}else{
			$(input).removeClass("review");
		}	
	});
	
	$('input.formEntry[type="text"],textarea.formEntry',this.html).val("");
	$('input.formEntry[type="radio":checked]',this.html).removeAttr("checked");
	
	this.photoGallery = new photoGallery('test',0,undefined,true);
	$(".photoGallery",this.html).replaceWith(this.photoGallery.html);
}

addReport.prototype.drawForm = function(){
	var ref = this;
	ref.photoGallery = new photoGallery('test',0,undefined,true);
	this.content.append(
		$("<div style='font-size:20px;'>").append(
			$("<div style='float:left;width:49%;'>").append(
				$("<table>").append(
					$("<tr>").append(
						$("<td>").html("Host"),
						$("<td>").html(
							this.FieldHost.change(function(){
								if(!ref.FieldHosts[$(this).val()]){
									$(this).val("");
								}
							})
						)
					),
					$("<tr>").append(
						$("<td>").html("Client"),
						$("<td>").html(
							this.Client.change(function(){
								if(!ref.Clients[$(this).val()]){
									$(this).val("");
								}
							})
						)
					),
					$("<tr>").append(
						$("<td>").html("Location"),
						$("<td>").html($("<input style='width:95%;' type='text' class='formEntry required' memberID='loc'>"))
					),
					$("<tr>").append(
						$("<td>").html("Severity"),
						$("<td>").append(
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='severity' value='Low' class='formEntry inner' memberID='severity'/>"),"Low").click(function(){ $("input[type='radio']",$(this)).attr('checked', true); }),
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='severity' value='Medium' class='formEntry inner' memberID='severity'/>"),"Medium").click(function(){ $("input[type='radio']",$(this)).attr('checked', true); }),
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='severity' value='High' class='formEntry inner' memberID='severity'/>"),"High").click(function(){ $("input[type='radio']",$(this)).attr('checked', true); })
						)
					),
					$("<tr>").append(
						$("<td>").html("Report Type"),
						$("<td>").append(
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='type' value='Quote' class='formEntry inner' memberID='type'/>"),"Quote").click(function(){ 
								$("input[type='radio']",$(this)).attr('checked', true);
								$(".monitorDate",$(this).parent().parent().parent().parent()).attr("disabled","disabled");
								$(".quoteNTE",$(this).parent().parent().parent().parent()).removeAttr("disabled"); 
								$(".monitorDate",$(this).parent().parent().parent().parent()).removeClass("review");
								$("button",$(this).parent().parent().parent().parent()).attr("disabled","disabled");
							}),
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='type' value='Monitor' class='formEntry inner' memberID='type'/>"),"Monitor").click(function(){ 
								$("input[type='radio']",$(this)).attr('checked', true);
								$(".monitorDate",$(this).parent().parent().parent().parent()).removeAttr("disabled"); 
								$(".quoteNTE",$(this).parent().parent().parent().parent()).attr("disabled","disabled"); 
								$(".quoteNTE",$(this).parent().parent().parent().parent()).removeClass("review");
								$("button",$(this).parent().parent().parent().parent()).removeAttr("disabled");
							}),
							$("<div style='float:left;width:33%;'>").append($("<input type='radio' name='type' value='Report' class='formEntry inner' memberID='type'/>"),"Report").click(function(){
								$("input[type='radio']",$(this)).attr('checked', true);
								$(".quoteNTE",$(this).parent().parent().parent().parent()).attr("disabled","disabled");
								$(".monitorDate",$(this).parent().parent().parent().parent()).attr("disabled","disabled");
								$("button",$(this).parent().parent().parent().parent()).attr("disabled","disabled");
								$(".quoteNTE",$(this).parent().parent().parent().parent()).removeClass("review");
								$(".monitorDate",$(this).parent().parent().parent().parent()).removeClass("review");
							})
						)
					),
					$("<tr>").append(
						$("<td>").append(
							$("<span>").addClass("monitorDate").html("Date")
						),
						$("<td>").append(
							$("<input style='width:75%;' type='text' class='formEntry required monitorDate datepicker' disabled='disabled' memberID='monitorDate'>")
						)
					),
					$("<tr>").append(
						$("<td>").append(
							$("<span>").addClass("quoteNTE").html("NTE")
						),
						$("<td>").append(
							$("<input style='width:95%;' type='text' class='formEntry required quoteNTE' disabled='disabled' memberID='quoteNTE'>")
						)
					)
				)
			),			
			$("<div style='float:left;width:50%;height:120px;'>").append(
				$("<textarea style='font-size:20px;width:100%;height:86%;' class='formEntry' memberID='details' placeholder='Details'></textarea>")				
			),
			$("<div style='clear:both'>"),
			ref.photoGallery.html
		),
		$("<div style='clear:both;padding-top:20px;position:absolute;bottom:0;left:0;width:100%;'>").append(
			$("<input type='submit' value='Save' style='width:50%;font-size:14pt;'>").click(function(){ ref.save() }),
			$("<input type='submit' value='Cancel' style='width:50%;font-size:14pt;'>").click(function(){ ref.reset() })
		)
	);
	
	$(".datepicker",this.content).datepicker({
		showOn: "button",
		onClose: function(dateText, inst) { $(this).attr("disabled", false); },
		beforeShow: function(dateText, inst) { $(this).attr("disabled", true); },
		buttonImage: IDS.remoteURL + "img/calendar.gif",
		showButtonPanel: true,
		numberOfMonths: 3
	});
	$("button",this.content).attr("disabled","disabled");
}



				
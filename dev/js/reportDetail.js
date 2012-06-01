reportDetail.prototype = new View();
function reportDetail(view,screen)
{
	View.apply(this, arguments);
}

reportDetail.prototype.load = function(report){
	this.report = new Data(report);
	this.report.dataType = "Report";
}

reportDetail.prototype.paint = function(){
	var report = this.report;
	
	this.content.html("");
	this.content.append(
		$("<div>").addClass("infoSection").append(
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("WO#"),
				$("<div style='float:left;'>").html(report.ID)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Field Host"),
				$("<div style='float:left;'>").html(report.FieldHostID)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Client"),
				$("<div style='float:left;'>").html(report.ClientID)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Store #"),
				$("<div style='float:left;'>").html(report.Storenum)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Category"),
				$("<div style='float:left;'>").html(report.Category)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Created"),
				$("<div style='float:left;'>").html(report.Inputdate)
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Severity"),
				$("<div style='float:left;'>").html(report.Severity).click(function(){
					$(this).replaceWith(
						$("<input type='text'>").val(report.Severity).change(function(){
							report.set("Severity",$(this).val());
						})
					)
				})
			),
			$("<div style='clear:both;'>").append(
				$("<div style='float:left;' class='label'>").html("Comment"),
				$("<div style='float:left;'>").html(report.CommentEdit)
			),			
			$("<a style='clear:both;' target='_blank' href='"+APP_PATH+"reports/pdfReport.aspx?report=WorkOrder'>Open PDF in new window</a>")		
		),
		$("<div style='clear:both;'>"),
		(new photoGallery('report',report.ID)).html
	);
	
	$(".infoSection textarea,input",this.content).change(function(event){
		//alert($(this).attr("fieldname") + "=" + $(this).val());
		report.set($(this).attr("fieldname"),$(this).val());
	});
}
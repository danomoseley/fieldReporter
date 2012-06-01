tableView.prototype = new View();
function tableView(view,screen)
{
	// CALL PARENT CONSTRUCTOR !Important
	View.apply(this, arguments);
	
	this.defaultFilters = {};	
	this.defaultFilters["latitude"] = "";
	this.defaultFilters["longitude"] = "";
	this.defaultFilters["sessionID"] = IDS.getSession();
	this.filterValues = {};
		
	this.filterBar = $("<ul>").addClass("filters");
	this.table = $("<table>").append("<thead>","<tbody>");
	
	var ref = this;
	
	this.content.append(
		this.filterBar,
		this.table
	);	
}

tableView.prototype.setFilters = function(filters){
	var ref = this;
	$.each(filters,function(filterTitle,filter){
		ref.filterValues[filter.ID] = "";
		var filterElement = $("<div>");
		if(filter.type=="text"){
			filterElement = $("<input type='text'>");
		}else if(filter.type=="select"){
			filterElement = $("<select>");
			$.each(filter.options,function(k,v){
				filterElement.append(
					$("<option>").attr("value",v.value).html(v.text)
				)
			});
		}
		ref.filterBar.append(
			$("<li>").append(
				$("<div>").addClass("label").html(filterTitle),
				$("<div>").addClass("input").append(
					filterElement.change(function(){
						ref.filterValues[filter.ID] = $(this).val();
						ref.refresh();
					})
				)
			)
		)
	});
}

tableView.prototype.ajaxParameters = function(){
	var ajaxParameters = {};
	$.extend(ajaxParameters,this.defaultAjaxParameters());
	$.extend(ajaxParameters,this.filterValues);
	return ajaxParameters;
}


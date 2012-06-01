$(document).ready(function(){
	$.fn.forceRedraw = function(brutal) {
		$(this).addClass('forceRedraw').removeClass('forceRedraw');
		if(brutal) {
			var paddingLeft = $(this).css('padding-left');
			var parsedPaddingLeft = parseInt(paddingLeft, 10);
			$(this).css('padding-left', ++parsedPaddingLeft);
			window.setTimeout($.proxy(function() {
				$(this).css('padding-left', paddingLeft);
			}, this), 1);		
		}
		return this;		
	}
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function lengthInUtf8Bytes(str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

function getDateTime() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    curr_month++;
    var curr_year = d.getFullYear();
    
    var a_p = "";

    var curr_hour = d.getHours();

    if (curr_hour < 12) {
        a_p = "AM";
    }
    else {
        a_p = "PM";
    }
    if (curr_hour == 0) {
        curr_hour = 12;
    }
    if (curr_hour > 12) {
        curr_hour = curr_hour - 12;
    }

    var curr_min = d.getMinutes();
    if (curr_min < 10) {
        curr_min = '0' + curr_min;
    }

    var curr_seconds = d.getSeconds();
    if (curr_seconds < 10) {
        curr_seconds = '0' + curr_seconds;
    }

    return curr_month + "/" + curr_date + "/" + curr_year + ' ' + curr_hour + ":" + curr_min + ":" + curr_seconds + " " + a_p
}

function getViewportWidth(){
	var viewportwidth;
	
	if (typeof window.innerWidth != 'undefined')
	{
		viewportwidth = window.innerWidth;
	}
	else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0)
	{
	   viewportwidth = document.documentElement.clientWidth;
	}
	else
	{
	   viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
	}
	
	return viewportwidth;
}

function getViewportHeight(){
	var viewportheight;
	
	if (typeof window.innerWidth != 'undefined')
	{
		viewportheight = window.innerHeight;
	}
	else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0)
	{
	   viewportheight = document.documentElement.clientHeight;
	}
	else
	{
	   viewportheight = document.getElementsByTagName('body')[0].clientHeight;
	}
	
	return viewportheight;
}

function message(){

}

function toast(message){
	
}

function pickList(){
	
}

function options(){

}

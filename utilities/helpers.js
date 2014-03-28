//return the value of a selected option from a <select> element
function selected(selectID){
    var select = document.getElementById(selectID),
        value = select.options[select.selectedIndex].value;

    return value;
}

//base 10 log
Math.log10 = function(x){
	return Math.log(x) / Math.log(10);
}

//returns a if it isn't undefined or null, returns b otherwise
function canHas(a, b){

	if(a === undefined || a === null) return b;

	return a;
}


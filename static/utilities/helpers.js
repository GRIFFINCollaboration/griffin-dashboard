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

//return a KineticJS object in the shape of an arrow
function kineticArrow(fromx, fromy, tox, toy){
    var headlen = 20;   // how long you want the head of the arrow to be, you could calculate this as a fraction of the distance between the points as well.
    var angle = Math.atan2(toy-fromy,tox-fromx);

    line = new Kinetic.Line({
        points: [tox,toy, tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6), tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6), tox,toy, fromx,fromy],
        stroke: '#999999',
        fill: '#999999',
        closed: true
    });

    return line;
}

//find the length of longest word in a string
function longestWord(phrase){
    var words = phrase.split(' '),
        i;

    for(i=0; i<words.length; i++){
        words[i] = words[i].length;
    }

    words.sort(function(a, b){
        return b - a;
    });

    return words[0];

}
function griffin(){
	//boilerplate
	layer['griffin'] = new paper.Layer();
	layer['griffin'].visible = false;
	path['GRG06BN00A'] = new paper.Path();
	path['GRG06BN00A'].closed = true;

	path['GRG06BN00A'].add(new paper.Point(100,100), new paper.Point(150, 100), new paper.Point(150, 150), new paper.Point(100,150));
	path['GRG06BN00A'].fillColor = dataBus['GRG06BN00A'].oldColor;
	path['GRG06BN00A'].channel = 'GRIFFIN';
	layer['griffin'].addChild(path['GRG06BN00A']);
}
function descant(){
	//boilerplate
	layer['descant'] = new paper.Layer();
	layer['descant'].visible = false;
	path['DSC01XN00X'] = new paper.Path();
	path['DSC01XN00X'].closed = true;

	path['DSC01XN00X'].add(new paper.Point(200,200), new paper.Point(250, 200), new paper.Point(250, 250), new paper.Point(200,250));
	path['DSC01XN00X'].fillColor = dataBus['DSC01XN00X'].oldColor;
	path['DSC01XN00X'].channel = 'DESCANT'
	layer['descant'].addChild(path['DSC01XN00X']);
}
function dante(){
	//boilerplate
	layer['dante'] = new paper.Layer();
	layer['dante'].visible = false;
	path['DAL01XN00X'] = new paper.Path();
	path['DAL01XN00X'].closed = true;

	path['DAL01XN00X'].add(new paper.Point(300,300), new paper.Point(350, 300), new paper.Point(350, 350), new paper.Point(300,350));
	path['DAL01XN00X'].fillColor = dataBus['DAL01XN00X'].oldColor;
	path['DAL01XN00X'].channel = 'DANTE'
	layer['dante'].addChild(path['DAL01XN00X']);
}

//for a key in dataBus that has children oldColor, currentColor and color, increment currentColor 1/60 towards color and away from oldColor.
function interpolateColor(key){
	var oldColor = dataBus[key].oldColor,
		currentColor = dataBus[key].currentColor,
		color = dataBus[key].color,
		nSteps = 60,
		redStep = Math.ceil((color[0] - oldColor[0])/nSteps),
		greenStep = Math.ceil((color[1] - oldColor[1])/nSteps),
		blueStep = Math.ceil((color[2] - oldColor[2])/nSteps);

	currentColor[0] += redStep;
	currentColor[1] += greenStep;
	currentColor[2] += blueStep;

	if(Math.abs(currentColor[0] - color[0]) <= 1) currentColor[0] = color[0];
	if(Math.abs(currentColor[1] - color[1]) <= 1) currentColor[1] = color[1];
	if(Math.abs(currentColor[2] - color[2]) <= 1) currentColor[2] = color[2];

	dataBus[key].currentColor = currentColor;

}

//transform string '#123456' into int array [0x12, 0x34, 0x56]
function parseColorString(string){
	var parsed = [];

	parsed[0] = parseInt(string.slice(1,3), 16);
	parsed[1] = parseInt(string.slice(3,5), 16);
	parsed[2] = parseInt(string.slice(5,7), 16);

	return parsed;
}

//invert parseColorString
function buildColorString(parsed){
	var str = '#';

	str += (parsed[0].toString(16).length==1) ? '0'+parsed[0].toString(16) : parsed[0].toString(16);
	str += (parsed[1].toString(16).length==1) ? '0'+parsed[1].toString(16) : parsed[1].toString(16);
	str += (parsed[2].toString(16).length==1) ? '0'+parsed[2].toString(16) : parsed[2].toString(16);

	return str
}
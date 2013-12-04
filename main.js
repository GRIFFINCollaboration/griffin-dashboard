//animation///////////////////////////////////////////////////////////////////
//for a key in dataBus that has children oldColor, currentColor and color, increment currentColor 1/60 towards color and away from oldColor.
function incrementColor(key){
	var i,
		oldColor = [],
		currentColor = [],
		color = [],
		nSteps = 30,
		redStep, greenStep, blueStep;

	for(i=0; i<3; i++){
		oldColor[i] = dataBus[key].oldColor[i];
		currentColor[i] = dataBus[key].currentColor[i];
		color[i] = dataBus[key].color[i];
	}
	redStep = (color[0] - oldColor[0])/nSteps,
	greenStep = (color[1] - oldColor[1])/nSteps,
	blueStep = (color[2] - oldColor[2])/nSteps;

	//step towards the target color, but jump to the goal when less than one step away; prevents incrementing runaway
	if(Math.abs(currentColor[0] - color[0]) <= Math.abs(redStep) ) currentColor[0] = color[0];
	else currentColor[0] += redStep;
	if(Math.abs(currentColor[1] - color[1]) <= Math.abs(greenStep) ) currentColor[1] = color[1];
	else currentColor[1] += greenStep;
	if(Math.abs(currentColor[2] - color[2]) <= Math.abs(blueStep) ) currentColor[2] = color[2];
	else currentColor[2] += blueStep;

	dataBus[key].currentColor[0] = currentColor[0];
	dataBus[key].currentColor[1] = currentColor[1];
	dataBus[key].currentColor[2] = currentColor[2];
}

//analagous to incrementColor, but steps the width of a bar on a horizonatal bar graph
function incrementWidth(key){
	var oldWidth = dataBus[key].oldWidth,
		currentWidth = dataBus[key].currentWidth,
		width = dataBus[key].width,
		nSteps = 60,
		stepSize = Math.ceil((width - oldWidth) / nSteps);

	//increment by a step
	currentWidth += stepSize;

	//jump to the goal when less than one step away, prevents incrementing runaway
	if(Math.abs(currentWidth - width) <= stepSize ) currentWidth = width;

	dataBus[key].currentWidth = currentWidth;
}

//same as incrementWidth, but now for height
function incrementHeight(key){
	var oldHeight = dataBus[key].oldHeight,
		currentHeight = dataBus[key].currentHeight,
		height = dataBus[key].height,
		nSteps = 60,
		stepSize = Math.ceil((height - oldHeight) / nSteps);

	//increment by a step
	currentHeight += stepSize;

	//jump to the goal when less than one step away, prevents incrementing runaway
	if(Math.abs(currentHeight - height) <= stepSize ) currentHeight = height;

	dataBus[key].currentHeight = currentHeight;
}

//tooltip///////////////////////////////////////////////////////////////////////
function summonTooltip(x, y){
	var tt = document.getElementById('tooltip');
	tt.style.display = 'block';
	tt.style.left = x+'px';
	tt.style.top = y+'px';
}

function dismissTooltip(){
	var tt = document.getElementById('tooltip');
	tt.style.display = 'none';			
}

//utilities//////////////////////////////////////////////////////////////////////
function injectDOM(element, id, wrapperID, properties){
    var key, elt,
        newElement = document.createElement(element);
    //explicit ID
    newElement.setAttribute('id', id);
    //append to document:
    if(wrapperID == 'body')
        document.body.appendChild(newElement)
    else
        document.getElementById(wrapperID).appendChild(newElement);
    elt = document.getElementById(id);

    //some things need to be set specially:
    if(properties['innerHTML'] || properties['innerHTML'] === 0){
        elt.innerHTML = properties['innerHTML'];
        delete properties['innerHTML'];
    }
    if(properties['onclick']){
        elt.onclick = properties['onclick'];
        delete properties['onclick'];
    }
    //send in the clowns:
    for(key in properties){
        elt.setAttribute(key, properties[key]);
    }

}

//navigate to the appropriate view; first 3 indices are for the corresponding x-decks, layerName
//is for the corresponding paper.js canvas layer
function navigate(subNavbarIndex, sidebarIndex, visualizationIndex, layerName){
	var key;

	sidebar.shuffleTo(sidebarIndex);
	subNav.shuffleTo(subNavbarIndex);
	visualization.shuffleTo(visualizationIndex);

	for(key in layer) layer[key].visible = false;

	layer[layerName].visible = true;
	instaUpdate(layerName);
	layer[layerName].activate();
	paper.view.draw();
}

//update the colors on layer layerName immediately, with no intermediate states.
function instaUpdate(layerName){
	var i,j;

	for(j=0; j<layer[layerName].children.length; j++){
		key = layer[layerName].children[j].tag;
		if(!key) continue;

		path[key].fillColor.red = dataBus[key].color[0]/255;
		path[key].fillColor.blue = dataBus[key].color[1]/255;
		path[key].fillColor.green = dataBus[key].color[2]/255;
		for(i=0; i<3; i++){
			dataBus[key].oldColor[i] = dataBus[key].color[i];
			dataBus[key].currentColor[i] = dataBus[key].color[i]; 
		}
	}
}

//main sections//////////////////////////////////////////////////////////////////
function renderDashboard(){
	layer['dashboard'] = new paper.Layer();
	layer['dashboard'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'Dashboard';
};
function renderHV(){
	layer['HV'] = new paper.Layer();
	layer['HV'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'hv';
};

function renderDAQ(){
	layer['DAQ'] = new paper.Layer();
	layer['DAQ'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'DAQ';
};
function renderClock(){
	layer['clock'] = new paper.Layer();
	layer['clock'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'Clock';
};
function renderFilter(){
	layer['filter'] = new paper.Layer();
	layer['filter'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'Filter';
};
function renderVME(){
	layer['VME'] = new paper.Layer();
	layer['VME'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'VME';
};
function renderCycle(){
	layer['cycle'] = new paper.Layer();
	layer['cycle'].visible = false;

	var text = new paper.PointText(new paper.Point(200, 50));
	text.justification = 'center';
	text.fillColor = 'white';
	text.content = 'Cycle';
};

function renderDESCANT(){
	layer['DESCANT'] = new paper.Layer();
	layer['DESCANT'].visible = false;

	injectDOM('button', 'DESCANTButton', 'subsystemNavCard', {
		'innerHTML' : 'DESCANT',
		'class' : 'navButton'
	});

	injectDOM('x-card', 'DESCANTSidebar', 'sidebar', {
		'innerHTML' : 'DESCANT right sidebar'
	});

	document.getElementById('DESCANTButton').addEventListener('click', navigate.bind(null, 2, document.getElementById('sidebar').children.length-1, 0, 'DESCANT'));
}

function renderSPICE(){
	layer['SPICE'] = new paper.Layer();
	layer['SPICE'].visible = false;

	injectDOM('button', 'SPICEButton', 'subsystemNavCard', {
		'innerHTML' : 'SPICE',
		'class' : 'navButton'
	});

	injectDOM('x-card', 'SPICESidebar', 'sidebar', {
		'innerHTML' : 'SPICE right sidebar'
	});

	document.getElementById('SPICEButton').addEventListener('click', navigate.bind(null, 2, document.getElementById('sidebar').children.length-1, 0, 'SPICE'));
}

//abyss////////////////////////////////////////////////////////////////////////////
/*
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
*/

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
function renderHPGe(){
	var i,
		canvas, viewWidth, viewHeight, 
		summarySize, summaryCoords = [], summaryRowY = [], summaryColX=[],
		beamLabel;

	//summary view
	layer['HPGe'] = new paper.Layer();
	layer['HPGe'].visible = false;

	injectDOM('button', 'HPGeButton', 'subsystemNavCard', {
		'innerHTML' : 'HPGe',
		'class' : 'navButton'
	});

	document.getElementById('HPGeButton').addEventListener('click', navigate.bind(null, 2, 2, 0, 'HPGe'));

	//canvas dimensions:
	canvas = document.getElementById('mainCanvas');
	viewWidth = canvas.offsetWidth;
	viewHeight = canvas.offsetHeight;

	summarySize = Math.min(viewHeight*0.15, 0.85*viewWidth/(8*1.2));		//size of square summary node
	topGutter = 0.02*viewHeight;											//top gutter width
	leftGutter = 0.05*viewWidth;											//left gutter width
	centerGutter = 0.1*viewWidth;											//center gutter width
	nodeSpacing = 1.2*summarySize;											//space between centers of summary nodes, minimum = summarySize
	//build lattice on which to display HPGE summaries:
	for(i=0; i<3; i++){
		summaryRowY[i] = topGutter + summarySize/2 + i*nodeSpacing;
	}
	for(i=0; i<8; i++){
		summaryColX[i] = leftGutter + summarySize/2 + i*nodeSpacing + Math.floor(i/4)*centerGutter;
	}
	//summaryCoords indices correspond to HPGe number
	summaryCoords[1]  = [summaryColX[2], summaryRowY[0]];
	summaryCoords[2]  = [summaryColX[4], summaryRowY[0]];
	summaryCoords[3]  = [summaryColX[6], summaryRowY[0]];
	summaryCoords[4]  = [summaryColX[0], summaryRowY[0]];
	summaryCoords[5]  = [summaryColX[2], summaryRowY[1]];
	summaryCoords[6]  = [summaryColX[3], summaryRowY[1]];
	summaryCoords[7]  = [summaryColX[4], summaryRowY[1]];
	summaryCoords[8]  = [summaryColX[5], summaryRowY[1]];
	summaryCoords[9]  = [summaryColX[6], summaryRowY[1]];
	summaryCoords[10] = [summaryColX[7], summaryRowY[1]];
	summaryCoords[11] = [summaryColX[0], summaryRowY[1]];
	summaryCoords[12] = [summaryColX[1], summaryRowY[1]];
	summaryCoords[13] = [summaryColX[2], summaryRowY[2]];
	summaryCoords[14] = [summaryColX[4], summaryRowY[2]];
	summaryCoords[15] = [summaryColX[6], summaryRowY[2]];
	summaryCoords[16] = [summaryColX[0], summaryRowY[2]];

	//summary view:
	layer['HPGe'].activate();
	for(i=1; i<17; i++){
		drawHPGeSummary(i, 'HPGe', summaryCoords[i][0],summaryCoords[i][1], summarySize);
	}

	//draw beam direction harpoon:
	path['HPGeSummaryBeamHarpoon'] = new paper.Path();
	path['HPGeSummaryBeamHarpoon'].strokeColor = '#999999';
	path['HPGeSummaryBeamHarpoon'].add(	new paper.Point(leftGutter + 4*nodeSpacing + centerGutter/2, topGutter+3*nodeSpacing+0.5*summarySize),
										new paper.Point(leftGutter + 4*nodeSpacing + centerGutter/2, 0),
										new paper.Point(leftGutter + 4*nodeSpacing + centerGutter/2 - summarySize/8, summarySize/8)
									  );
	layer['HPGe'].addChild(path['HPGeSummaryBeamHarpoon']);
	beamLabel = new paper.PointText(new paper.Point(leftGutter + 4*nodeSpacing, topGutter+3*nodeSpacing+0.25*summarySize));
	beamLabel.justification = 'left';
	beamLabel.fontSize = summarySize/4;
	beamLabel.fillColor = '#999999';
	beamLabel.content = 'Beam';
	beamLabel.rotate(-90)
}

//imprint the Paths for a single clover + BGO in summary view on the given layer, centered at x0, y0
function drawHPGeSummary(HPGeNo, layerID, x0, y0, size){

	var crystalSide = size/6,  //side length of crystal summary
		i, tag,
		colorQuad = ['G', 'B', 'W', 'R'];

	for(i=0; i<4; i++){
		//crystal summary
		tag = 'HPGe'+HPGeNo+colorQuad[i] 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0,y0), 
						new paper.Point(x0,y0-crystalSide), 
						new paper.Point(x0-crystalSide, y0-crystalSide), 
						new paper.Point(x0-crystalSide,y0)
					);
		path[tag].channel = 'GRG' + ((HPGeNo>10)?HPGeNo:'0'+HPGeNo) + colorQuad[i];
		path[tag].tag = 'HPGe'+HPGeNo+colorQuad[i];
		path[tag].fillColor = [0,0,0];
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0,y0]);
		path[tag].onClick = navigateDetailLayer.bind(null, HPGeNo);
		dataBusInit(tag);

		//BGO summary
		tag = 'BGO'+HPGeNo+colorQuad[i];
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0-3*crystalSide,y0), 
						new paper.Point(x0-3*crystalSide,y0-3*crystalSide), 
						new paper.Point(x0, y0-3*crystalSide), 
						new paper.Point(x0,y0-2*crystalSide),
						new paper.Point(x0-2*crystalSide,y0-2*crystalSide),
						new paper.Point(x0-2*crystalSide,y0)
					);
		path[tag].channel = 'GRS' + ((HPGeNo>10)?HPGeNo:'0'+HPGeNo) + colorQuad[i];
		path[tag].tag = tag
		path[tag].fillColor = [0,0,0];
		layer[layerID].addChild(path['BGO'+HPGeNo+ colorQuad[i]]);
		path[tag].rotate(i*90, [x0,y0]);
		path[tag].onClick = navigateDetailLayer.bind(null, HPGeNo);
		dataBusInit(tag);
	}
}

//imprint the paths for a rate-segmented GRIFFIN HPGe+BGO detail viewWidth
function drawHPGeDetail(HPGeNo, layerID){

	var canvas = document.getElementById('mainCanvas'),
		size = 0.4*canvas.offsetHeight,
		crystalSide = 0.4*size,		//side length of one HPGe cloverleaf
		HPGeGutter = 0.2*size,		//width of gutter between HPGe and BGO
		BGOwidth = 0.08*size,		//width of BGOs
		BGOgutter = 0.08*size,		//width of gutter between BGO layers		
		x0 = canvas.offsetWidth/2,
		y0 = canvas.offsetHeight*0.4+1,
		colors = ['G', 'B', 'W', 'R'],
		tag;

	for(i=0; i<4; i++){
		//HPGe crystal B-side, closest to center
		tag = 'HPGe'+HPGeNo+colors[i]+'B'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0-crystalSide, y0),
						new paper.Point(x0, y0),
						new paper.Point(x0, y0-crystalSide)
					);
		path[tag].channel = 'GRG'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N00B';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0,y0]);
		dataBusInit(tag);

		//HPGe crystal A-side
		tag = 'HPGe'+HPGeNo+colors[i]+'A'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0-crystalSide, y0),
						new paper.Point(x0-crystalSide, y0-crystalSide),
						new paper.Point(x0, y0-crystalSide)
					);
		path[tag].channel = 'GRG'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N00A';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0,y0]);
		dataBusInit(tag);

		//BGO back
		tag = 'BGO'+HPGeNo+colors[i]+'-back'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0 - crystalSide - HPGeGutter, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth, y0 - crystalSide - HPGeGutter - BGOwidth),
						new paper.Point(x0, y0 - crystalSide - HPGeGutter - BGOwidth),
						new paper.Point(x0, y0 - crystalSide - HPGeGutter),
						new paper.Point(x0 - crystalSide - HPGeGutter, y0 - crystalSide - HPGeGutter)
					);
		path[tag].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N05X';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0, y0]);
		dataBusInit(tag);

		//BGO side segment 4
		tag = 'BGO'+HPGeNo+colors[i]+'-side1'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter)	
					);
		path[tag].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N04X';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0, y0]);
		dataBusInit(tag);

		//BGO side segment 3
		tag = 'BGO'+HPGeNo+colors[i]+'-side2'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter),
						new paper.Point(x0, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter)
					);
		path[tag].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N03X';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0, y0]);
		dataBusInit(tag);

		//BGO front segment 2
		tag = 'BGO'+HPGeNo+colors[i]+'-front1'; 
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter, y0),
						new paper.Point(x0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter)	
					);
		path[tag].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N02X';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0, y0]);
		dataBusInit(tag);

		//BGO front segment 1
		tag = 'BGO'+HPGeNo+colors[i]+'-front2';
		path[tag] = new paper.Path();
		path[tag].closed = true;
		path[tag].strokeColor = '#999999';
		path[tag].add(	new paper.Point(x0, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
						new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter),
						new paper.Point(x0, y0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter)
					);
		path[tag].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N01X';
		path[tag].tag = tag
		path[tag].fillColor = '#000000';
		layer[layerID].addChild(path[tag]);
		path[tag].rotate(i*90, [x0, y0]);
		dataBusInit(tag);

	}
}

//handle creating each HPGe detail layer as it is required, and navigating to it afterwards
function navigateDetailLayer(HPGeNo){
	if(layer['HPGeDetail'+HPGeNo])
		navigate(2, 2, 0, 'HPGeDetail'+HPGeNo);
	else{
		layer['HPGeDetail'+HPGeNo] = new paper.Layer();
		layer['HPGeDetail'+HPGeNo].visible = false;
		drawHPGeDetail(HPGeNo, 'HPGeDetail'+HPGeNo);
		navigate(2, 2, 0, 'HPGeDetail'+HPGeNo);
	}
}
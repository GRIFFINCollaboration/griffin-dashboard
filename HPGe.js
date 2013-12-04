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
		i,
		colorQuad = ['G', 'B', 'W', 'R'];

	for(i=0; i<4; i++){
		//crystal summary
		path['HPGe'+HPGeNo+colorQuad[i]] = new paper.Path();
		path['HPGe'+HPGeNo+colorQuad[i]].closed = true;
		path['HPGe'+HPGeNo+colorQuad[i]].strokeColor = '#999999';
		path['HPGe'+HPGeNo+colorQuad[i]].add(	new paper.Point(x0,y0), 
												new paper.Point(x0,y0-crystalSide), 
												new paper.Point(x0-crystalSide, y0-crystalSide), 
												new paper.Point(x0-crystalSide,y0)
											);
		path['HPGe'+HPGeNo+colorQuad[i]].channel = 'GRG' + ((HPGeNo>10)?HPGeNo:'0'+HPGeNo) + colorQuad[i];
		path['HPGe'+HPGeNo+colorQuad[i]].tag = 'HPGe'+HPGeNo+colorQuad[i];
		path['HPGe'+HPGeNo+colorQuad[i]].fillColor = [0,0,0];
		layer[layerID].addChild(path['HPGe'+HPGeNo+colorQuad[i]]);
		path['HPGe'+HPGeNo+colorQuad[i]].rotate(i*90, [x0,y0]);
		path['HPGe'+HPGeNo+colorQuad[i]].onClick = navigateDetailLayer.bind(null, HPGeNo);

		//BGO summary
		path['BGO'+HPGeNo+colorQuad[i]] = new paper.Path();
		path['BGO'+HPGeNo+colorQuad[i]].closed = true;
		path['BGO'+HPGeNo+colorQuad[i]].strokeColor = '#999999';
		path['BGO'+HPGeNo+colorQuad[i]].add(new paper.Point(x0-3*crystalSide,y0), 
										new paper.Point(x0-3*crystalSide,y0-3*crystalSide), 
										new paper.Point(x0, y0-3*crystalSide), 
										new paper.Point(x0,y0-2*crystalSide),
										new paper.Point(x0-2*crystalSide,y0-2*crystalSide),
										new paper.Point(x0-2*crystalSide,y0)
									);
		path['BGO'+HPGeNo+colorQuad[i]].channel = 'GRS' + ((HPGeNo>10)?HPGeNo:'0'+HPGeNo) + colorQuad[i];
		path['BGO'+HPGeNo+colorQuad[i]].tag = 'BGO'+HPGeNo+colorQuad[i];
		path['BGO'+HPGeNo+colorQuad[i]].fillColor = [0,0,0];
		layer[layerID].addChild(path['BGO'+HPGeNo+ colorQuad[i]]);
		path['BGO'+HPGeNo+colorQuad[i]].rotate(i*90, [x0,y0]);
		path['BGO'+HPGeNo+colorQuad[i]].onClick = navigateDetailLayer.bind(null, HPGeNo);

		//initialize the dataBus for each path:
		dataBus['HPGe'+HPGeNo+colorQuad[i]] = {};
		dataBus['HPGe'+HPGeNo+colorQuad[i]].oldColor = [0,0,0];
		dataBus['HPGe'+HPGeNo+colorQuad[i]].currentColor = [0,0,0];
		dataBus['HPGe'+HPGeNo+colorQuad[i]].color = [0,0,0];

		dataBus['BGO'+HPGeNo+colorQuad[i]] = {};
		dataBus['BGO'+HPGeNo+colorQuad[i]].oldColor = [0,0,0];
		dataBus['BGO'+HPGeNo+colorQuad[i]].currentColor = [0,0,0];
		dataBus['BGO'+HPGeNo+colorQuad[i]].color = [0,0,0];		
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
		colors = ['G', 'B', 'W', 'R'];

	for(i=0; i<4; i++){
		//HPGe crystal B-side, closest to center
		path['HPGe'+HPGeNo+colors[i]+'B'] = new paper.Path();
		path['HPGe'+HPGeNo+colors[i]+'B'].closed = true;
		path['HPGe'+HPGeNo+colors[i]+'B'].strokeColor = '#999999';
		path['HPGe'+HPGeNo+colors[i]+'B'].add(	new paper.Point(x0-crystalSide, y0),
												new paper.Point(x0, y0),
												new paper.Point(x0, y0-crystalSide)
											);
		path['HPGe'+HPGeNo+colors[i]+'B'].channel = 'GRG'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N00B';
		path['HPGe'+HPGeNo+colors[i]+'B'].tag = 'HPGe'+HPGeNo+colors[i]+'B'
		path['HPGe'+HPGeNo+colors[i]+'B'].fillColor = '#000000';
		layer[layerID].addChild(path['HPGe'+HPGeNo+colors[i]+'B']);
		path['HPGe'+HPGeNo+colors[i]+'B'].rotate(i*90, [x0,y0]);

		//HPGe crystal A-side
		path['HPGe'+HPGeNo+colors[i]+'A'] = new paper.Path();
		path['HPGe'+HPGeNo+colors[i]+'A'].closed = true;
		path['HPGe'+HPGeNo+colors[i]+'A'].strokeColor = '#999999';
		path['HPGe'+HPGeNo+colors[i]+'A'].add(	new paper.Point(x0-crystalSide, y0),
												new paper.Point(x0-crystalSide, y0-crystalSide),
												new paper.Point(x0, y0-crystalSide)
											);
		path['HPGe'+HPGeNo+colors[i]+'A'].channel = 'GRG'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N00A';
		path['HPGe'+HPGeNo+colors[i]+'A'].tag = 'HPGe'+HPGeNo+colors[i]+'A'
		path['HPGe'+HPGeNo+colors[i]+'A'].fillColor = '#000000';
		layer[layerID].addChild(path['HPGe'+HPGeNo+colors[i]+'A']);
		path['HPGe'+HPGeNo+colors[i]+'A'].rotate(i*90, [x0,y0]);

		//BGO back
		path['BGO'+HPGeNo+colors[i]+'-back'] = new paper.Path();
		path['BGO'+HPGeNo+colors[i]+'-back'].closed = true;
		path['BGO'+HPGeNo+colors[i]+'-back'].strokeColor = '#999999';
		path['BGO'+HPGeNo+colors[i]+'-back'].add(	new paper.Point(x0 - crystalSide - HPGeGutter, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth, y0 - crystalSide - HPGeGutter - BGOwidth),
													new paper.Point(x0, y0 - crystalSide - HPGeGutter - BGOwidth),
													new paper.Point(x0, y0 - crystalSide - HPGeGutter),
													new paper.Point(x0 - crystalSide - HPGeGutter, y0 - crystalSide - HPGeGutter)
										)
		path['BGO'+HPGeNo+colors[i]+'-back'].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N05X';
		path['BGO'+HPGeNo+colors[i]+'-back'].tag = 'BGO'+HPGeNo+colors[i]+'-back'
		path['BGO'+HPGeNo+colors[i]+'-back'].fillColor = '#000000';
		layer[layerID].addChild(path['BGO'+HPGeNo+colors[i]+'-back']);
		path['BGO'+HPGeNo+colors[i]+'-back'].rotate(i*90, [x0, y0]);

		//BGO side segment 4
		path['BGO'+HPGeNo+colors[i]+'-side1'] = new paper.Path();
		path['BGO'+HPGeNo+colors[i]+'-side1'].closed = true;
		path['BGO'+HPGeNo+colors[i]+'-side1'].strokeColor = '#999999';
		path['BGO'+HPGeNo+colors[i]+'-side1'].add(	new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter)	
												);
		path['BGO'+HPGeNo+colors[i]+'-side1'].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N04X';
		path['BGO'+HPGeNo+colors[i]+'-side1'].tag = 'BGO'+HPGeNo+colors[i]+'-side1'
		path['BGO'+HPGeNo+colors[i]+'-side1'].fillColor = '#000000';
		layer[layerID].addChild(path['BGO'+HPGeNo+colors[i]+'-side1']);
		path['BGO'+HPGeNo+colors[i]+'-side1'].rotate(i*90, [x0, y0]);

		//BGO side segment 3
		path['BGO'+HPGeNo+colors[i]+'-side2'] = new paper.Path();
		path['BGO'+HPGeNo+colors[i]+'-side2'].closed = true;
		path['BGO'+HPGeNo+colors[i]+'-side2'].strokeColor = '#999999';
		path['BGO'+HPGeNo+colors[i]+'-side2'].add(	new paper.Point(x0, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - BGOwidth - BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter),
													new paper.Point(x0, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter)
												);
		path['BGO'+HPGeNo+colors[i]+'-side2'].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N03X';
		path['BGO'+HPGeNo+colors[i]+'-side2'].tag = 'BGO'+HPGeNo+colors[i]+'-side2'
		path['BGO'+HPGeNo+colors[i]+'-side2'].fillColor = '#000000';
		layer[layerID].addChild(path['BGO'+HPGeNo+colors[i]+'-side2']);
		path['BGO'+HPGeNo+colors[i]+'-side2'].rotate(i*90, [x0, y0]);

		//BGO front segment 2
		path['BGO'+HPGeNo+colors[i]+'-front1'] = new paper.Path();
		path['BGO'+HPGeNo+colors[i]+'-front1'].closed = true;
		path['BGO'+HPGeNo+colors[i]+'-front1'].strokeColor = '#999999';
		path['BGO'+HPGeNo+colors[i]+'-front1'].add(	new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter, y0),
													new paper.Point(x0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter)	
												);
		path['BGO'+HPGeNo+colors[i]+'-front1'].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N02X';
		path['BGO'+HPGeNo+colors[i]+'-front1'].tag = 'BGO'+HPGeNo+colors[i]+'-front1'
		path['BGO'+HPGeNo+colors[i]+'-front1'].fillColor = '#000000';
		layer[layerID].addChild(path['BGO'+HPGeNo+colors[i]+'-front1']);
		path['BGO'+HPGeNo+colors[i]+'-front1'].rotate(i*90, [x0, y0]);

		//BGO front segment 1
		path['BGO'+HPGeNo+colors[i]+'-front2'] = new paper.Path();
		path['BGO'+HPGeNo+colors[i]+'-front2'].closed = true;
		path['BGO'+HPGeNo+colors[i]+'-front2'].strokeColor = '#999999';
		path['BGO'+HPGeNo+colors[i]+'-front2'].add(	new paper.Point(x0, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - BGOgutter, y0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter),
													new paper.Point(x0 - crystalSide - HPGeGutter - 2*BGOwidth - 2*BGOgutter, y0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter),
													new paper.Point(x0, y0 - crystalSide - HPGeGutter - 3*BGOwidth - 2*BGOgutter)
												);
		path['BGO'+HPGeNo+colors[i]+'-front2'].channel = 'GRS'+((HPGeNo>10)?HPGeNo:'0'+HPGeNo)+colors[i]+'N01X';
		path['BGO'+HPGeNo+colors[i]+'-front2'].tag = 'BGO'+HPGeNo+colors[i]+'-front2'
		path['BGO'+HPGeNo+colors[i]+'-front2'].fillColor = '#000000';
		layer[layerID].addChild(path['BGO'+HPGeNo+colors[i]+'-front2']);
		path['BGO'+HPGeNo+colors[i]+'-front2'].rotate(i*90, [x0, y0]);		

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
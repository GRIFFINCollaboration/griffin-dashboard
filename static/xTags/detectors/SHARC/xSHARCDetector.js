
(function(){  

    xtag.register('detector-SHARC', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i,j;

                //deploy the standard stuff
                this.viewNames = ['SHARC', 'SHQ01', 'SHQ02', 'SHQ03', 'SHQ04', 'SHB05', 'SHB06', 'SHB07', 'SHB08', 'SHB09', 'SHB10', 'SHB11', 'SHB12', 'SHQ13', 'SHQ14', 'SHQ15', 'SHQ16'];

                this.channelNames = [   'SHQ01DN', 'SHQ02DN', 'SHQ03DN', 'SHQ04DN', 'SHQ13DN', 'SHQ14DN', 'SHQ15DN', 'SHQ16DN',
                                        'SHQ01DP', 'SHQ02DP', 'SHQ03DP', 'SHQ04DP', 'SHQ13DP', 'SHQ14DP', 'SHQ15DP', 'SHQ16DP',
                                        'SHB05DP', 'SHB06DP', 'SHB07DP', 'SHB08DP', 'SHB05DN', 'SHB06DN', 'SHB07DN', 'SHB08DN',
                                        'SHB09DP', 'SHB10DP', 'SHB11DP', 'SHB12DP', 'SHB09DN', 'SHB10DN', 'SHB11DN', 'SHB12DN'
                                    ];
                //generate individual channel names from summary names explicity stated
                for(i=0; i<32; i++){
                    //SHQ back
                    if(this.channelNames[i].indexOf('Q') != -1 && this.channelNames[i].indexOf('N') != -1 ){
                        for(j=0; j<24; j++)
                            this.channelNames.push(this.channelNames[i] + ((j<10)?'0'+j:j) + 'X' )
                    //SHQ front
                    } else if(this.channelNames[i].indexOf('Q') != -1 && this.channelNames[i].indexOf('P') != -1 ){
                        for(j=0; j<16; j++)
                            this.channelNames.push(this.channelNames[i] + ((j<10)?'0'+j:j) + 'X' )
                    //SHB back
                    } else if(this.channelNames[i].indexOf('B') != -1 && this.channelNames[i].indexOf('N') != -1 ){
                        for(j=0; j<48; j++)
                            this.channelNames.push(this.channelNames[i] + ((j<10)?'0'+j:j) + 'X' )
                    //SHB front
                    } else if(this.channelNames[i].indexOf('B') != -1 && this.channelNames[i].indexOf('P') != -1 ){
                        for(j=0; j<24; j++)
                            this.channelNames.push(this.channelNames[i] + ((j<10)?'0'+j:j) + 'X' )
                    }
                }

                initializeDetector.bind(this, 'SHARC', 'SHARC', URLs)();
                this.summaryDepth = 7;

                //////////////////////////////////////
                //SHARC specific drawing parameters
                //////////////////////////////////////
                //summary view
                this.theta = Math.atan(0.8*this.height / this.width * 2) //angle with horizontal that beam axis will make
                this.diag = 0.8*this.height / Math.sin(this.theta) //length of beam axis on a half-diagram
                this.grid = Math.min(this.width/2/7, this.diag/9); //grid separation of layers, make sure it fits
                this.long = 1.8*this.grid*Math.sin(this.theta);  //long parallelogram side
                this.short = this.long/2; //short parallelogram side
                this.rad = this.grid/2;   //SHQ radius
                //detail views
                this.boxWidth = 0.4*this.width;
                this.boxHeight = 0.7*this.height;
                this.quadCenterLeftX = 0.45*this.width;
                this.quadCenterLeftY = 0.7*this.height;
                this.quadCenterRightX = 0.95*this.width;
                this.quadCenterRightY = 0.7*this.height;
                this.quadRad = 0.4*this.width;

                /////////////////////////////
                //Initialize visualization
                /////////////////////////////
                //initialize all the cells:
                this.instantiateCells();
                //generate the color scale
                this.generateColorScale();
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'MIDAS':{
                attribute: {} //this just needs to be declared
            },
            'rateServer':{
                attribute: {} //this just needs to be declared
            },
            'thresholdServer':{
                attribute: {}
            },
            'auxiliary':{
                attribute: {}
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, upstreamLabel, downstreamLabel, frontLabel, backLabel,
                    cardIndex, isBox, isFront, cellIndex,
                    cellCoords = {},
                    parallelogramCoords = {},
                    downstreamBoxCenterX = -0.7*this.width,
                    downstreamBoxCenterY = -0.8*this.height + 0.2*this.width*Math.tan(this.theta) + this.long/2,
                    downstreamSHQfrontCenterX = -downstreamBoxCenterX + 2*this.grid,
                    downstreamSHQfrontCenterY = -downstreamBoxCenterY - 2*this.grid*Math.tan(this.theta),
                    downstreamSHQbackCenterX = -downstreamBoxCenterX + 3*this.grid,
                    downstreamSHQbackCenterY = -downstreamBoxCenterY - 3*this.grid*Math.tan(this.theta),
                    upstreamBoxCenterX = -0.3*this.width,
                    upstreamBoxCenterY = -0.2*this.width*Math.tan(this.theta) - this.long/2,
                    upstreamSHQfrontCenterX = -upstreamBoxCenterX - 2*this.grid,
                    upstreamSHQfrontCenterY = -upstreamBoxCenterY +2*this.grid*Math.tan(this.theta),
                    upstreamSHQbackCenterX = -upstreamBoxCenterX - 3*this.grid,
                    upstreamSHQbackCenterY = -upstreamBoxCenterY +3*this.grid*Math.tan(this.theta);

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                //summary layout
                //cell coords packed as: 
                //SHQ***: [center X, center Y, rotation]
                //SHB***: [{offsetX, offsetY}, orientation] - note Kinetic offsets 'move the viewport'; ie -100 offset in x moves the shape 100px *right* 
                cellCoords['SHQ01DN'] = [downstreamSHQbackCenterX, downstreamSHQbackCenterY, 180];
                cellCoords['SHQ02DN'] = [downstreamSHQbackCenterX, downstreamSHQbackCenterY, -90];
                cellCoords['SHQ03DN'] = [downstreamSHQbackCenterX, downstreamSHQbackCenterY, 0];
                cellCoords['SHQ04DN'] = [downstreamSHQbackCenterX, downstreamSHQbackCenterY, 90];
                cellCoords['SHQ13DN'] = [upstreamSHQbackCenterX, upstreamSHQbackCenterY, 180];
                cellCoords['SHQ14DN'] = [upstreamSHQbackCenterX, upstreamSHQbackCenterY, -90];
                cellCoords['SHQ15DN'] = [upstreamSHQbackCenterX, upstreamSHQbackCenterY, 0];
                cellCoords['SHQ16DN'] = [upstreamSHQbackCenterX, upstreamSHQbackCenterY, 90];

                cellCoords['SHQ01DP'] = [downstreamSHQfrontCenterX, downstreamSHQfrontCenterY, 180];
                cellCoords['SHQ02DP'] = [downstreamSHQfrontCenterX, downstreamSHQfrontCenterY, -90];
                cellCoords['SHQ03DP'] = [downstreamSHQfrontCenterX, downstreamSHQfrontCenterY, 0];
                cellCoords['SHQ04DP'] = [downstreamSHQfrontCenterX, downstreamSHQfrontCenterY, 90];
                cellCoords['SHQ13DP'] = [upstreamSHQfrontCenterX, upstreamSHQfrontCenterY, 180];
                cellCoords['SHQ14DP'] = [upstreamSHQfrontCenterX, upstreamSHQfrontCenterY, -90];
                cellCoords['SHQ15DP'] = [upstreamSHQfrontCenterX, upstreamSHQfrontCenterY, 0];
                cellCoords['SHQ16DP'] = [upstreamSHQfrontCenterX, upstreamSHQfrontCenterY, 90];

                cellCoords['SHB05DP'] = [{x: downstreamBoxCenterX + this.grid, y: downstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB06DP'] = [{x: downstreamBoxCenterX, y: downstreamBoxCenterY + this.grid + this.short/2}, 'long'];
                cellCoords['SHB07DP'] = [{x: downstreamBoxCenterX - this.grid, y: downstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB08DP'] = [{x: downstreamBoxCenterX, y: downstreamBoxCenterY - this.grid + this.short/2}, 'long'];
                cellCoords['SHB05DN'] = [{x: downstreamBoxCenterX + 2*this.grid, y: downstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB06DN'] = [{x: downstreamBoxCenterX, y: downstreamBoxCenterY + 2*this.grid + this.short/2}, 'long'];
                cellCoords['SHB07DN'] = [{x: downstreamBoxCenterX - 2*this.grid, y: downstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB08DN'] = [{x: downstreamBoxCenterX, y: downstreamBoxCenterY - 2*this.grid + this.short/2}, 'long'];

                cellCoords['SHB09DP'] = [{x: upstreamBoxCenterX + this.grid, y: upstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB10DP'] = [{x: upstreamBoxCenterX, y: upstreamBoxCenterY + this.grid + this.short/2}, 'long'];
                cellCoords['SHB11DP'] = [{x: upstreamBoxCenterX - this.grid, y: upstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB12DP'] = [{x: upstreamBoxCenterX, y: upstreamBoxCenterY - this.grid + this.short/2}, 'long'];
                cellCoords['SHB09DN'] = [{x: upstreamBoxCenterX + 2*this.grid, y: upstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB10DN'] = [{x: upstreamBoxCenterX, y: upstreamBoxCenterY + 2*this.grid + this.short/2}, 'long'];
                cellCoords['SHB11DN'] = [{x: upstreamBoxCenterX - 2*this.grid, y: upstreamBoxCenterY + this.long/2}, 'tall'];
                cellCoords['SHB12DN'] = [{x: upstreamBoxCenterX, y: upstreamBoxCenterY - 2*this.grid + this.short/2}, 'long'];

                //upright and sideways parallelogram coords for SHB summaries
                parallelogramCoords['tall'] = [0,this.short*Math.tan(this.theta), 0,this.long, this.short,this.long - this.short/Math.tan(this.theta), this.short,0];
                parallelogramCoords['long'] = [0,this.short, this.short*Math.tan(this.theta),0, this.long,0, this.long - this.short/Math.tan(this.theta),this.short];

                for(i=0; i<this.channelNames.length; i++){
                    //determine which view this cell belongs to
                    if(this.channelNames[i].length == 7)
                        cardIndex = 0;
                    else
                        cardIndex = parseInt(this.channelNames[i].slice(3,5), 10);

                    //SHQ summaries
                    if(i<16){
                        this.cells[this.channelNames[i]] = new Kinetic.Wedge({
                            x: cellCoords[this.channelNames[i]][0],
                            y: cellCoords[this.channelNames[i]][1],
                            rotation: cellCoords[this.channelNames[i]][2],
                            radius: this.rad,
                            angle: 90,
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true             
                        })
                    //SHB summaries
                    } else if(i<32){
                        this.cells[this.channelNames[i]] = new Kinetic.Line({
                            points: parallelogramCoords[cellCoords[this.channelNames[i]][1]],
                            offset: cellCoords[this.channelNames[i]][0],
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true                          
                        })
                    //detail channels
                    } else{
                        isBox = (this.channelNames[i].indexOf('B') == 2);
                        isFront = (this.channelNames[i].indexOf('P') == 6);
                        cellIndex = parseInt(this.channelNames[i].slice(7,9),10);

                        if(isBox && isFront){
                            this.cells[this.channelNames[i]] = new Kinetic.Rect({
                                x: (this.width/2 - this.boxWidth)/2,
                                y: (0.8*this.height - this.boxHeight)/2 + cellIndex*this.boxHeight/24,
                                width: this.boxWidth,
                                height: this.boxHeight / 24,
                                fill: '#000000',
                                fillPatternImage: this.errorPattern,
                                fillPatternOffsetX: 100*Math.random(),
                                fillPatternOffsetY: 100*Math.random(),
                                stroke: this.frameColor,
                                strokeWidth: this.frameLineWidth,
                                closed: true,
                                listening: true                                 
                            });
                        } else if(isBox && !isFront){
                            this.cells[this.channelNames[i]] = new Kinetic.Rect({
                                x: (this.width/2 - this.boxWidth)/2 + this.width/2 + cellIndex*this.boxWidth/48,
                                y: (0.8*this.height - this.boxHeight)/2,
                                width: this.boxWidth/48,
                                height: this.boxHeight,
                                fill: '#000000',
                                fillPatternImage: this.errorPattern,
                                fillPatternOffsetX: 100*Math.random(),
                                fillPatternOffsetY: 100*Math.random(),
                                stroke: this.frameColor,
                                strokeWidth: this.frameLineWidth,
                                closed: true,
                                listening: true                                
                            });
                        } else if(!isBox && isFront){
                            this.cells[this.channelNames[i]] = new Kinetic.Arc({
                                x: this.quadCenterLeftX,
                                y: this.quadCenterLeftY,
                                innerRadius: cellIndex*this.quadRad/16,
                                outerRadius: (cellIndex+1)*this.quadRad/16,
                                angle: 90,
                                rotationDeg: 180,
                                fill: '#000000',
                                fillPatternImage: this.errorPattern,
                                fillPatternOffsetX: 100*Math.random(),
                                fillPatternOffsetY: 100*Math.random(),
                                stroke: this.frameColor,
                                strokeWidth: this.frameLineWidth,
                                closed: true,
                                listening: true                                
                            });
                        } else if(!isBox && !isFront){
                            this.cells[this.channelNames[i]] = new Kinetic.Wedge({
                                x: this.quadCenterRightX,
                                y: this.quadCenterRightY,
                                radius: this.quadRad,
                                angle: 90 / 24,
                                rotation: 180 + cellIndex*90/24,
                                fill: '#000000',
                                fillPatternImage: this.errorPattern,
                                fillPatternOffsetX: 100*Math.random(),
                                fillPatternOffsetY: 100*Math.random(),
                                stroke: this.frameColor,
                                strokeWidth: this.frameLineWidth,
                                closed: true,
                                listening: true                                
                            });
                        }
                    }

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);
                }

                //beam arrow
                this.mainLayer[0].add(kineticArrow(0.35*this.width, 0.4*this.height + Math.tan(this.theta)*0.2*this.width, 0.75*this.width, 0.4*this.height - Math.tan(this.theta)*0.2*this.width ));

                //label upstream / downstream halves
                upstreamLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'Upstream',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(upstreamLabel);
                //center label nicely
                upstreamLabel.setAttr('x', -upstreamBoxCenterX - upstreamLabel.getTextWidth()/2);
                upstreamLabel.setAttr('y', 0.8*this.height - upstreamLabel.getTextHeight());

                downstreamLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'Downstream',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(downstreamLabel);
                //center label nicely
                downstreamLabel.setAttr('x', -downstreamBoxCenterX - downstreamLabel.getTextWidth()/2);
                downstreamLabel.setAttr('y', 0.8*this.height - downstreamLabel.getTextHeight());  

                //labels for detail views:
                for(i=1; i<16; i++){
                    frontLabel = new Kinetic.Text({
                        x: 0,
                        y: 0,
                        text: 'Front',
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    });
                    this.mainLayer[i].add(frontLabel);
                    //center label nicely
                    frontLabel.setAttr('x', 0.25*this.width - frontLabel.getTextWidth()/2);
                    frontLabel.setAttr('y', 0.8*this.height - frontLabel.getTextHeight());

                    backLabel = new Kinetic.Text({
                        x: 0,
                        y: 0,
                        text: 'Back',
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    });
                    this.mainLayer[i].add(backLabel);
                    //center label nicely
                    backLabel.setAttr('x', 0.75*this.width - backLabel.getTextWidth()/2);
                    backLabel.setAttr('y', 0.8*this.height - backLabel.getTextHeight());
                }

                //add the layers to the stage
                for(i=0; i<this.viewNames.length; i++){
                    this.stage[i].add(this.mainLayer[i]);
                    this.stage[i].add(this.tooltipLayer[i]);
                }

            },

            //usual behavior for detail cells, click through to detail from summary view
            'clickCell' : function(cellName){
                var evt, 
                    viewVal = parseInt(cellName.slice(3,5),10),
                    viewSelect = document.getElementById(this.id+'viewSelect'),
                    SV = document.getElementById('spectrumViewer'),
                    plotControlForm = document.getElementById(this.id+'PlotControl');

                //summary -> details
                if(cellName.length == 7){
                    viewSelect.value = viewVal;
                    viewSelect.onchange();
                    plotControlForm.onchange();
                }

                //send the clicked channel to the spectrum viewer:
                if(SV){
                    evt = new CustomEvent('changeChannel', {'detail': {'channel' : cellName} });
                    SV.dispatchEvent(evt);
                }
            }
        }
    });

})();

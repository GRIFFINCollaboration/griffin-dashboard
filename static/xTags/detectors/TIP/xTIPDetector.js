(function(){  

    xtag.register('detector-TIPWall', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                //channels start at top left hand corner and walk across in rows
                this.channelNames = [   'TPW011P00X', 'TPW012P00X', 'TPW013P00X', 'TPW014P00X', 'TPW015P00X',
                                        'TPW010P00X', 'TPW002P00X', 'TPW003P00X', 'TPW004P00X', 'TPW016P00X',
                                        'TPW009P00X', 'TPW001P00X', 'TPW005P00X', 'TPW017P00X',
                                        'TPW024P00X', 'TPW008P00X', 'TPW007P00X', 'TPW006P00X', 'TPW018P00X',
                                        'TPW023P00X', 'TPW022P00X', 'TPW021P00X', 'TPW020P00X', 'TPW019P00X'
                                    ]
                initializeDetector.bind(this, 'TIP', 'TIP Wall')();

                //////////////////////////////////////
                //TIP Wall specific drawing parameters
                //////////////////////////////////////
                this.cellSide = this.height*0.8/5;              //length of cell side
                this.x0 = this.width/2 - 2.5*this.cellSide;     //x coordinate of upper left corner of TIP image
                this.y0 = 0;                                    //y ''

                /////////////////////////////
                //Initialize visualization
                /////////////////////////////
                //generate the color scale
                this.generateColorScale();
                //initialize all the cells:
                this.instantiateCells();
                this.populate();

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
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, iOffset, X, Y, cardIndex;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    //determine which card this cell belongs to:
                    cardIndex = 0; //simple, only one card

                    iOffset = i;
                    if(i>11) iOffset++; //skip the middle square in the grid

                    //coords of top left corner of this cell
                    X = this.x0 + this.cellSide*(iOffset%5);    
                    Y = this.y0 + this.cellSide*Math.floor(iOffset/5);

                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: [X,Y, X+this.cellSide,Y, X+this.cellSide,Y+this.cellSide, X,Y+this.cellSide],
                        fill: '#000000',
                        fillPatternOffsetX: 100*Math.random(),
                        fillPatternOffsetY: 100*Math.random(),
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
            }
        }
    });

})();


(function(){  

    xtag.register('detector-TIPBall', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                //channels start at top left hand corner and walk across in rows
                this.channelNames = [];
                for(i=1; i<129; i++){
                    this.channelNames.push('TPC' + ((i<10)? '00'+i : ((i<100)? '0'+i : i) ) + 'P00X');
                }
                initializeDetector.bind(this, 'TIP', 'TIP Ball', URLs)();

                //////////////////////////////////////
                //TIP Ball specific drawing parameters
                //////////////////////////////////////
                this.cellSide = Math.min(this.width/25, 0.8*this.height/15);
                this.gutter = this.cellSide/3;
                this.rowLenghts = [4, 6, 12, 16, 20, 18, 18, 14, 12, 8];
                this.theta = ['8.0', '17.5', '33.0', '48.5', '64.0', '79.5', '95.0', '111.9', '130.2', '148.5'];

                /////////////////////////////
                //Initialize visualization
                /////////////////////////////
                //generate the color scale
                this.generateColorScale();
                //initialize all the cells:
                this.instantiateCells();
                this.populate();
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
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, cardIndex, thetaLabel, ringLabel,
                    rowIndex = 0,
                    X = this.width/2 - this.rowLenghts[0]/2*this.cellSide,
                    Y = this.gutter + this.cellSide;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    //determine which card this cell belongs to:
                    cardIndex = 0; //simple, only one card

                    this.cells[this.channelNames[i]] = new Kinetic.Rect({
                        x: X,
                        y: Y,
                        width: this.cellSide,
                        height: this.cellSide,
                        fill: '#000000',
                        fillPatternOffsetX: 100*Math.random(),
                        fillPatternOffsetY: 100*Math.random(),
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //move along to the next cell position:
                    if(X < this.width/2 + (this.rowLenghts[rowIndex]/2 - 1)*this.cellSide)
                        X += this.cellSide;
                    else{
                        rowIndex++;
                        X = this.width/2 - this.rowLenghts[rowIndex]/2*this.cellSide,
                        Y += this.cellSide + this.gutter;
                        if(rowIndex==1)
                            Y += this.gutter; //extra gutter after top ring, user request
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

                //add some labels
                //add some labels
                thetaLabel = new Kinetic.Text({
                    x: 0,
                    y: this.cellSide/2 - 14,
                    text: 'Mean Theta',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                ringLabel = new Kinetic.Text({
                    x: 0,
                    y: this.cellSide/2 - 14,
                    text: 'Ring Number',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(thetaLabel);
                this.mainLayer[0].add(ringLabel);
                ringLabel.setAttr('x', this.width - ringLabel.getTextWidth());

                Y = this.gutter + 2*this.cellSide;
                for(i=0; i<10; i++){
                    thetaLabel = new Kinetic.Text({
                        x: 0,
                        y: Y - this.cellSide/2 - 14,
                        text: this.theta[i] + '\u00B0',
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    });
                    ringLabel = new Kinetic.Text({
                        x: 0,
                        y: Y - this.cellSide/2 - 14,
                        text: i,
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    });
                    this.mainLayer[0].add(thetaLabel);
                    this.mainLayer[0].add(ringLabel);
                    ringLabel.setAttr('x', this.width - ringLabel.getTextWidth());
                    Y += this.cellSide + this.gutter;
                    if(i==0)
                        Y+= this.gutter;
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
            }
        }
    });

})();


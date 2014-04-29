(function(){  

    xtag.register('detector-DANTE', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+window.location.host+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                this.channelNames = [   'DAL01XN00X', 'DAL02XN00X', 'DAL03XN00X', 'DAL04XN00X',
                                        'DAL05XN00X', 'DAL06XN00X', 'DAL07XN00X', 'DAL08XN00X',
                                        'DAS01XN00X', 'DAS02XN00X', 'DAS03XN00X', 'DAS04XN00X',
                                        'DAS05XN00X', 'DAS06XN00X', 'DAS07XN00X', 'DAS08XN00X'
                                    ]
                //DANTE has special views, define them by hand first
                this.views = ['HV', 'Threshold', 'Rate', 'TAC-Threshold', 'TAC-Rate'];
                this.units = ['V', 'ADC Units', 'Hz', 'ADC Units', 'Hz'];
                initializeDetector.bind(this, 'DANTE', 'DANTE', URLs)();

                //////////////////////////////////////
                //DANTE specific drawing parameters
                //////////////////////////////////////
                this.outerBGORad = 0.1*0.8*this.height;
                this.innerBGOrad = 0.09*0.8*this.height;
                this.LaBrRad = 0.06*0.8*this.height;
                this.ringRad = Math.min(0.3*this.height, 0.5*0.45*this.width - this.outerBGORad);
                this.westCenterX = this.ringRad+this.outerBGORad;
                this.westCenterY = 0.4*this.height;
                this.eastCenterX = this.width - this.ringRad - this.outerBGORad;
                this.eastCenterY = 0.4*this.height;
                this.detCenterX = [ this.westCenterX + this.ringRad, this.westCenterX, this.westCenterX - this.ringRad, this.westCenterX,
                                    this.eastCenterX + this.ringRad, this.eastCenterX, this.eastCenterX - this.ringRad, this.eastCenterX];
                this.detCenterY = [ this.westCenterY, this.westCenterY - this.ringRad, this.westCenterY, this.westCenterY + this.ringRad,
                                    this.eastCenterY, this.eastCenterY - this.ringRad, this.eastCenterY, this.eastCenterY + this.ringRad]

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
            'rateServer':{
                attribute: {} //this just needs to be declared
            },
            'thresholdServer':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, cardIndex, X, Y, mask;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<8; i++){
                    //determine which card this cell belongs to:
                    cardIndex = 0; //simple, only one card

                    X = this.detCenterX[i];
                    Y = this.detCenterY[i];

                    //BGO
                    this.cells['DAS0'+(i+1)+'XN00X'] = new Kinetic.Circle({
                        radius: this.outerBGORad,
                        x: X,
                        y: Y,
                        fill: '#000000',
                        fillPatternImage: this.errorPattern,
                        fillPatternOffsetX: 100*Math.random(),
                        fillPatternOffsetY: 100*Math.random(),
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //center mask (so BGO appears as annulus)
                    mask = new Kinetic.Circle({
                        radius: this.innerBGORad,
                        x: X,
                        y: Y,
                        fill: '#222222',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: false
                    });

                    //LaBr
                    this.cells['DAL0'+(i+1)+'XN00X'] = new Kinetic.Circle({
                        radius: this.LaBrRad,
                        x: X,
                        y: Y,
                        fill: '#000000',
                        fillPatternImage: this.errorPattern,
                        fillPatternOffsetX: 100*Math.random(),
                        fillPatternOffsetY: 100*Math.random(),
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells['DAS0'+(i+1)+'XN00X'].on('mouseover', this.writeTooltip.bind(this, 8+i) );
                    this.cells['DAL0'+(i+1)+'XN00X'].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells['DAS0'+(i+1)+'XN00X'].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells['DAL0'+(i+1)+'XN00X'].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells['DAS0'+(i+1)+'XN00X'].on('mouseout', this.writeTooltip.bind(this, -1));
                    this.cells['DAL0'+(i+1)+'XN00X'].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );
                    this.cells[this.channelNames[8+i]].on('click', this.clickCell.bind(this, this.channelNames[8+i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[8+i]]);
                    this.mainLayer[cardIndex].add(mask);
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);
                    
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
            }
        }
    });

})();

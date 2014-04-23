
(function(){  

    xtag.register('detector-SHARC', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+window.location.host+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i,j,chan=0;

                //deploy the standard stuff
                this.viewNames = ['SHARC', 'aux'];
                /*
                this.channelNames = [   'SHQ01b', 'SHQ02b', 'SHQ03b', 'SHQ04b', 'SHB05b', 'SHB06b', 'SHB07b', 'SHB08b',
                                        'SHB09b', 'SHB10b', 'SHB11b', 'SHB12b', 'SHQ13b', 'SHQ14b', 'SHQ15b', 'SHQ16b',
                                        'SHQ01f', 'SHQ02f', 'SHQ03f', 'SHQ04f', 'SHB05f', 'SHB06f', 'SHB07f', 'SHB08f',
                                        'SHB09f', 'SHB10f', 'SHB11f', 'SHB12f', 'SHQ13f', 'SHQ14f', 'SHQ15f', 'SHQ16f'
                                    ];
                */
                this.channelNames = [   'SHQ01b', 'SHQ02b', 'SHQ03b', 'SHQ04b', 'SHB05b', 'SHB06b', 'SHB07b', 'SHB08b'
                                    ];

                initializeDetector.bind(this, 'SHARC', 'SHARC', URLs)();

                //////////////////////////////////////
                //SHARC specific drawing parameters
                //////////////////////////////////////
                this.theta = Math.atan(0.8*this.height / this.width * 2) //angle with horizontal that beam axis will make
                this.diag = 0.8*this.height / Math.sin(this.theta) //length of beam axis on a half-diagram
                this.grid = Math.min(this.width/2/6, this.diag/8); //grid separation of layers, make sure it fits
                this.long = 1.8*this.grid*Math.sin(this.theta);  //long parallelogram side
                this.short = 0.9*this.grid; //short parallelogram side
                this.rad = this.long / 2;   //SHQ radius

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
                attribute: {}
            },
            'auxiliary':{
                attribute: {}
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, 
                    cellCoords = {};

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                //summary layout
                //cell coords packed as: 
                //SHQ***: [center X, center Y, rotation]
                //SHB***: []
                cellCoords['SHQ01b'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ02b'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ03b'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ04b'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 90];
                cellCoords['SHQ13b'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ14b'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ15b'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ16b'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 90];

                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Wedge({
                        x: cellCoords[this.channelNames[i]][0],
                        y: cellCoords[this.channelNames[i]][1],
                        rotation: cellCoords[this.channelNames[i]][2],
                        radius: this.rad,
                        angle: 90,
                        fill: '#000000',
                        fillPatternImage: this.errorPattern,
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true               
                    })

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[0].add(this.cells[this.channelNames[i]]);
                }



                /*
                for(i=0; i<10; i++){ //10 rings
                    for(j=0; j<12; j++){ //12 phi sectors

                        this.cells[this.channelNames[chan]] = new Kinetic.Arc({
                            innerRadius: this.innerRad + i*this.radStep,
                            outerRadius: this.innerRad + (i+1)*this.radStep,
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            angle: 30,
                            clockwise: false,
                            rotationDeg: -30*(j+1),
                            x: this.x0,
                            y: this.y0,
                            closed: true,
                            listening: true
                        });

                        //set up the tooltip listeners:
                        this.cells[this.channelNames[chan]].on('mouseover', this.writeTooltip.bind(this, chan) );
                        this.cells[this.channelNames[chan]].on('mousemove', this.moveTooltip.bind(this) );
                        this.cells[this.channelNames[chan]].on('mouseout', this.writeTooltip.bind(this, -1));

                        //set up onclick listeners:
                        this.cells[this.channelNames[chan]].on('click', this.clickCell.bind(this, this.channelNames[chan]) );

                        //add the cell to the main layer
                        this.mainLayer[0].add(this.cells[this.channelNames[chan]]);

                        chan++;
                    }

                }
                */
                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
                
            }
        }
    });

})();

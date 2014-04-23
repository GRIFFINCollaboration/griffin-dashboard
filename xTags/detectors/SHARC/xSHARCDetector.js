
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
                this.channelNames = [   'SHQ01DN', 'SHQ02DN', 'SHQ03DN', 'SHQ04DN', 'SHQ13DN', 'SHQ14DN', 'SHQ15DN', 'SHQ16DN',
                                        'SHQ01DP', 'SHQ02DP', 'SHQ03DP', 'SHQ04DP', 'SHQ13DP', 'SHQ14DP', 'SHQ15DP', 'SHQ16DP',
                                        'SHB05DP'/*, 'SHB06DP', 'SHB07DP', 'SHB08DP', 'SHB05DN', 'SHB06DN', 'SHB07DN', 'SHB08DN'*/
                                    ];

                initializeDetector.bind(this, 'SHARC', 'SHARC', URLs)();

                //////////////////////////////////////
                //SHARC specific drawing parameters
                //////////////////////////////////////
                this.theta = Math.atan(0.8*this.height / this.width * 2) //angle with horizontal that beam axis will make
                this.diag = 0.8*this.height / Math.sin(this.theta) //length of beam axis on a half-diagram
                this.grid = Math.min(this.width/2/6, this.diag/8); //grid separation of layers, make sure it fits
                this.long = 1.8*this.grid*Math.sin(this.theta);  //long parallelogram side
                this.short = this.long/2; //short parallelogram side
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
                cellCoords['SHQ01DN'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ02DN'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ03DN'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ04DN'] = [0.75*this.width + 4*this.grid*Math.cos(this.theta), 0.4*this.height - 4*this.grid*Math.sin(this.theta), 90];
                cellCoords['SHQ13DN'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ14DN'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ15DN'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ16DN'] = [0.25*this.width - 4*this.grid*Math.cos(this.theta), 0.4*this.height + 4*this.grid*Math.sin(this.theta), 90];

                cellCoords['SHQ01DP'] = [0.75*this.width + 3*this.grid*Math.cos(this.theta), 0.4*this.height - 3*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ02DP'] = [0.75*this.width + 3*this.grid*Math.cos(this.theta), 0.4*this.height - 3*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ03DP'] = [0.75*this.width + 3*this.grid*Math.cos(this.theta), 0.4*this.height - 3*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ04DP'] = [0.75*this.width + 3*this.grid*Math.cos(this.theta), 0.4*this.height - 3*this.grid*Math.sin(this.theta), 90];
                cellCoords['SHQ13DP'] = [0.25*this.width - 3*this.grid*Math.cos(this.theta), 0.4*this.height + 3*this.grid*Math.sin(this.theta), 180];
                cellCoords['SHQ14DP'] = [0.25*this.width - 3*this.grid*Math.cos(this.theta), 0.4*this.height + 3*this.grid*Math.sin(this.theta), -90];
                cellCoords['SHQ15DP'] = [0.25*this.width - 3*this.grid*Math.cos(this.theta), 0.4*this.height + 3*this.grid*Math.sin(this.theta), 0];
                cellCoords['SHQ16DP'] = [0.25*this.width - 3*this.grid*Math.cos(this.theta), 0.4*this.height + 3*this.grid*Math.sin(this.theta), 90];

                for(i=0; i<this.channelNames.length; i++){
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
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true               
                        })
                    //SHB summaries
                    } else if(i<32){
                        this.cells[this.channelNames[i]] = new Kinetic.Line({
                            points: [0,this.short, this.short*Math.cos(this.theta),0, this.long, 0, this.long - this.short*Math.cos(this.theta), this.short],
                            offset: {x: 100, y: 100},
                            rotation: 0,
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true                            
                        })
                    }

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[0].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
                
            }
        }
    });

})();

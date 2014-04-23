
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

                this.channelNames = [   'SHQ01DN', 'SHQ02DN', 'SHQ03DN', 'SHQ04DN', 'SHQ13DN', 'SHQ14DN', 'SHQ15DN', 'SHQ16DN',
                                        'SHQ01DP', 'SHQ02DP', 'SHQ03DP', 'SHQ04DP', 'SHQ13DP', 'SHQ14DP', 'SHQ15DP', 'SHQ16DP',
                                        'SHB05DP', 'SHB06DP', 'SHB07DP', 'SHB08DP', 'SHB05DN', 'SHB06DN', 'SHB07DN', 'SHB08DN'
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
                    cellCoords = {},
                    parallelogramCoords = {},
                    downstreamBoxCenterX = -0.625*this.width,
                    downstreamBoxCenterY = -0.8*this.height + this.width/8*Math.tan(this.theta) + this.long/2,
                    downstreamSHQfrontCenterX = 0.625*this.width + 2*this.grid,
                    downstreamSHQfrontCenterY = 0.8*this.height - (downstreamSHQfrontCenterX - 0.5*this.width)*Math.sin(this.theta),
                    downstreamSHQbackCenterX = 0.625*this.width + 3*this.grid,
                    downstreamSHQbackCenterY = 0.8*this.height - (downstreamSHQbackCenterX - 0.5*this.width)*Math.sin(this.theta),
                    upstreamSHQfrontCenterX = 0.25*this.width - 3*this.grid*Math.cos(this.theta),
                    upstreamSHQfrontCenterY = 0.4*this.height + 3*this.grid*Math.sin(this.theta),
                    upstreamSHQbackCenterX = 0.25*this.width - 4*this.grid*Math.cos(this.theta),
                    upstreamSHQbackCenterY = 0.4*this.height + 4*this.grid*Math.sin(this.theta)

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

                //upright and sideways parallelogram coords for SHB summaries
                parallelogramCoords['tall'] = [0,this.short*Math.tan(this.theta), 0,this.long, this.short,this.long - this.short/Math.tan(this.theta), this.short,0];
                parallelogramCoords['long'] = [0,this.short, this.short*Math.tan(this.theta),0, this.long,0, this.long - this.short/Math.tan(this.theta),this.short];

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
                            points: parallelogramCoords[cellCoords[this.channelNames[i]][1]],
                            offset: cellCoords[this.channelNames[i]][0],
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

                var alignment = new Kinetic.Line({
                    points:[0,0.6*this.height, this.width,0.6*this.height],
                    stroke: '#FF0000'
                })
                this.mainLayer[0].add(alignment)

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
             

            }
        }
    });

})();

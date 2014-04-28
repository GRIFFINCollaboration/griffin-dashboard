(function(){  

    xtag.register('detector-DESCANT', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+window.location.host+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                //channels start at top left hand corner and walk across in rows
                this.channelNames = [];
                for(i=0; i<70; i++){
                    this.channelNames[i] = 'TESTCANT' + i;
                }
                initializeDetector.bind(this, 'DESCANT', 'DESCANT', URLs)();

                //////////////////////////////////////
                //DESCANT specific drawing parameters
                //////////////////////////////////////

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
                var i,
                    scale = 0.0004*this.height,
                    cellVertices = {
                        'white': [scale*41.5,scale*(71.9), scale*(-41.5),scale*(71.9), scale*(-93),0, scale*(-41.5),scale*(-79.6), scale*41.5,scale*(-79.6), scale*93,0],
                        'red': [scale*37.4,scale*(-87.1), scale*(-51.6),scale*(-83.3), scale*(-101.8),0, scale*(-51.6),scale*(83.3), scale*37.4,scale*(87.1), scale*73.1,0],
                        'blue': [scale*52.6,scale*(-79.4), scale*(-45.1),scale*(-79.4), scale*(-97.6),0, scale*(-45.1),scale*(79.4), scale*52.6,scale*(79.4), scale*99.2,0], 
                        'greenLeft': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-93),0, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*62.3,scale*47.6],
                        'greenRight': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-62.3),scale*47.6, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*93,0]
                    },
                    cellOrder = ['white', 'white', 'white', 'white', 'greenLeft', 'greenLeft', 'greenRight', 'greenRight', 'red', 'red', 'red', 'blue', 'blue', 'blue'],
                    internalRotation = [0,0,0,0, -75,-70,135,130, 130,125,140, 10,70,70];


                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: cellVertices[cellOrder[i%14]],
                        x: this.generateCoords(i)[0],
                        y: this.generateCoords(i)[1],
                        rotation: internalRotation[i%14] + 72*Math.floor(i/14),
                        fill: '#000000',
                        fillPatternImage: this.errorPattern,
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
                    this.mainLayer[0].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
            },

            //returns [x,y] for the center of the ith cell
            'generateCoords': function(i){
                var phi = Math.floor(i / 14),
                    grid = 0.07*this.height,
                    baseCoords = [  
                                [Math.sin(72*phi/180*Math.PI)*0.8*grid + this.width/2, -Math.cos(72*phi/180*Math.PI)*0.8*grid +  0.4*this.height],
                                [Math.sin(72*phi/180*Math.PI)*1.8*grid + this.width/2, -Math.cos(72*phi/180*Math.PI)*1.8*grid +  0.4*this.height],
                                [Math.sin(72*phi/180*Math.PI)*2.8*grid + this.width/2, -Math.cos(72*phi/180*Math.PI)*2.8*grid +  0.4*this.height],
                                [Math.sin(72*phi/180*Math.PI)*3.8*grid + this.width/2, -Math.cos(72*phi/180*Math.PI)*3.8*grid +  0.4*this.height],

                                [Math.sin((72*phi+10)/180*Math.PI)*4.7*grid + this.width/2, -Math.cos((72*phi+10)/180*Math.PI)*4.7*grid + 0.4*this.height],
                                [Math.sin((72*phi+23)/180*Math.PI)*4.6*grid + this.width/2, -Math.cos((72*phi+23)/180*Math.PI)*4.6*grid + 0.4*this.height],
                                [Math.sin((72*phi+52)/180*Math.PI)*4.7*grid + this.width/2, -Math.cos((72*phi+52)/180*Math.PI)*4.7*grid + 0.4*this.height],
                                [Math.sin((72*phi+39)/180*Math.PI)*4.6*grid + this.width/2, -Math.cos((72*phi+39)/180*Math.PI)*4.6*grid + 0.4*this.height],

                                [Math.sin((72*phi+36)/180*Math.PI)*1.5*grid + this.width/2, -Math.cos((72*phi+36)/180*Math.PI)*1.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+16)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+16)/180*Math.PI)*3.4*grid + 0.4*this.height],
                                [Math.sin((72*phi+56)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+56)/180*Math.PI)*3.4*grid + 0.4*this.height],

                                [Math.sin((72*phi+23)/180*Math.PI)*2.5*grid + this.width/2, -Math.cos((72*phi+23)/180*Math.PI)*2.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+50)/180*Math.PI)*2.5*grid + this.width/2, -Math.cos((72*phi+50)/180*Math.PI)*2.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+36)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+36)/180*Math.PI)*3.4*grid + 0.4*this.height]
                ]

                return baseCoords[i%14]
            }
        }
    });

})();

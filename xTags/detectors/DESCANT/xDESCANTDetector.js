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
                this.channelNames = ['test0', 'test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10', 'test11', 'test12']
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
                    grid = 0.07*this.height,
                    cellVertices = {
                        'white': [scale*41.5,scale*(71.9), scale*(-41.5),scale*(71.9), scale*(-93),0, scale*(-41.5),scale*(-79.6), scale*41.5,scale*(-79.6), scale*93,0],
                        'red': [scale*37.4,scale*(-87.1), scale*(-51.6),scale*(-83.3), scale*(-101.8),0, scale*(-51.6),scale*(83.3), scale*37.4,scale*(87.1), scale*73.1,0],
                        'blue': [scale*52.6,scale*(-79.4), scale*(-45.1),scale*(-79.4), scale*(-97.6),0, scale*(-45.1),scale*(79.4), scale*52.6,scale*(79.4), scale*99.2,0], 
                        'greenLeft': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-93),0, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*62.3,scale*47.6],
                        'greenRight': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-62.3),scale*47.6, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*93,0]
                    },
                    cellOrder = ['white', 'white', 'white', 'white', 'greenLeft', 'greenLeft', 'greenRight', 'greenRight', 'red', 'red', 'red', 'blue', 'blue', 'blue'],
                    baseCoords = [  [this.width/2, 0.4*this.height-grid],
                                    [this.width/2, 0.4*this.height-2*grid],
                                    [this.width/2, 0.4*this.height-3*grid],
                                    [this.width/2, 0.4*this.height-4*grid],

                                    [Math.sin(10/180*Math.PI)*4.8*grid + this.width/2, -Math.cos(10/180*Math.PI)*4.8*grid + 0.4*this.height],
                                    [Math.sin(22/180*Math.PI)*4.8*grid + this.width/2, -Math.cos(22/180*Math.PI)*4.8*grid + 0.4*this.height],
                                    [Math.sin(-10/180*Math.PI)*4.8*grid + this.width/2, -Math.cos(-10/180*Math.PI)*4.8*grid + 0.4*this.height],
                                    [Math.sin(-22/180*Math.PI)*4.8*grid + this.width/2, -Math.cos(-22/180*Math.PI)*4.8*grid + 0.4*this.height],

                                    [Math.sin(30/180*Math.PI)*1.7*grid + this.width/2, -Math.cos(30/180*Math.PI)*1.7*grid + 0.4*this.height],
                                    [Math.sin(60/180*Math.PI)*3.5*grid + this.width/2, -Math.cos(60/180*Math.PI)*3.5*grid + 0.4*this.height],
                                    [Math.sin(60/180*Math.PI)*3.5*grid + this.width/2, -Math.cos(60/180*Math.PI)*3.5*grid + 0.4*this.height],

                                    [Math.sin(20/180*Math.PI)*2.7*grid + this.width/2, -Math.cos(20/180*Math.PI)*2.7*grid + 0.4*this.height],
                                    [Math.sin(30/180*Math.PI)*2.7*grid + this.width/2, -Math.cos(30/180*Math.PI)*2.7*grid + 0.4*this.height]
                                ],
                    internalRotation = [0,0,0,0,-78,-72,78,72,120,130,130,0,0];


                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: cellVertices[cellOrder[i%14]],
                        x: baseCoords[i%14][0],
                        y: baseCoords[i%14][1],
                        rotation: internalRotation[i%14],
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
            }
        }
    });

})();

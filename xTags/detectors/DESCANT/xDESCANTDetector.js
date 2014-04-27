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
                this.channelNames = ['test0', 'test1', 'test2', 'test3']
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
                    scale = 0.28,
                    //side length of pentagon hole:
                    pentagonSide = 83*scale,
                    explode = 10,
                    //shortest distance from center of pentagon to side
                    pentagonNormal = pentagonSide / 2 / Math.tan(36/180 * Math.PI),
                    //longest distance from center of pentagon to side
                    pentagonVertex = pentagonSide / 2 / Math.sin(36/180 * Math.PI),
                    cellVertices = {
                        'white': [scale*41.5,scale*(71.9), scale*(-41.5),scale*(71.9), scale*(-93),0, scale*(-41.5),scale*(-79.6), scale*41.5,scale*(-79.6), scale*93,0],
                        'red': [scale*37.4,scale*(-87.1), scale*(-51.6),scale*(-83.3), scale*(-101.8),0, scale*(-51.6),scale*(83.3), scale*37.4,scale*(87.1), scale*73.1,0],
                        'blue': [scale*52.6,scale*(-79.4), scale*(-45.1),scale*(-79.4), scale*(-97.6),0, scale*(-45.1),scale*(79.4), scale*52.6,scale*(79.4), scale*99.2,0], 
                        'greenLeft': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-93),0, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*62.3,scale*47.6],
                        'greenRight': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-62.3),scale*47.6, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*93,0]
                    },
                    cellOrder = ['white', 'white', 'white', 'white', 'greenLeft', 'greenLeft', 'greenRight', 'greenRight', 'red', 'red', 'red', 'blue', 'blue', 'blue'],
                    baseCoords = [  {'x':-this.width/2, 'y':-0.4*this.height+pentagonNormal+71.9*scale},
                                    {'x':-this.width/2, 'y':-0.4*this.height+pentagonNormal+(223.4 + explode/0.4)*scale},
                                    {'x':-this.width/2, 'y':-0.4*this.height+pentagonNormal+(374.9 + 2*explode/0.4)*scale},
                                    {'x':-this.width/2, 'y':-0.4*this.height+pentagonNormal+(526.4 + 3*explode/0.4)*scale}
                                    ],
                    internalRotation = [0];


                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){

                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: cellVertices[cellOrder[i%14]],
                        offset: baseCoords[i%14],
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

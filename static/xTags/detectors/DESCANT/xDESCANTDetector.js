(function(){  

    xtag.register('detector-DESCANT', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                            i, index;
                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                //5-fold symmetry in DESCANT, build one fifth at a time, lowest numbers not necessarily in the first fifth :/
                this.channelNames = [];
                for(i=0; i<5; i++){
                    //white
                    this.channelNames[i*14]     = 'DSC0' + (1+i) + 'XN00X';
                    index = 7 + 2*i;
                    this.channelNames[i*14 + 1] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 17+ 3*i;
                    this.channelNames[i*14 + 2] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 33+ 4*i;
                    this.channelNames[i*14 + 3] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    //green left
                    index = 53+ 4*i;
                    this.channelNames[i*14 + 4] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 54+ 4*i;
                    this.channelNames[i*14 + 5] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    //green right
                    index = 56+ 4*i; if(index==72) index = 52;
                    this.channelNames[i*14 + 6] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 55+ 4*i; if(index==71) index = 51;
                    this.channelNames[i*14 + 7] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    //red
                    index = 8+ 2*i; if(index==16) index = 6;
                    this.channelNames[i*14 + 8] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 34+ 4*i; if(index==54) index = 34;
                    this.channelNames[i*14 + 9] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 36+ 4*i; if(index==52) index = 32;
                    this.channelNames[i*14 + 10] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    //blue
                    index = 18+ 3*i;
                    this.channelNames[i*14 + 11] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 19+ 3*i; if(index==31) index = 16;
                    this.channelNames[i*14 + 12] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                    index = 35+ 4*i; if(index==51) index = 31;
                    this.channelNames[i*14 + 13] = 'DSC' + ((index<10) ? '0'+index : index) + 'XN00X';
                }
                initializeDetector.bind(this, 'DESCANT', 'DESCANT')();

                //////////////////////////////////////
                //DESCANT specific drawing parameters
                //////////////////////////////////////

                /////////////////////////////
                //Initialize visualization
                /////////////////////////////
                //generate the color scale
                this.generateColorScale();
                //initialize all the cells:
                this.instantiateCells();
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
                var i,
                    scale = 1.2*0.0004*this.height,
                    cellVertices = {
                        'white': [scale*41.5,scale*(71.9), scale*(-41.5),scale*(71.9), scale*(-93),0, scale*(-41.5),scale*(-79.6), scale*41.5,scale*(-79.6), scale*93,0],
                        'red': [scale*37.4,scale*(-87.1), scale*(-51.6),scale*(-83.3), scale*(-101.8),0, scale*(-51.6),scale*(83.3), scale*37.4,scale*(87.1), scale*73.1,0],
                        'blue': [scale*52.6,scale*(-79.4), scale*(-45.1),scale*(-79.4), scale*(-97.6),0, scale*(-45.1),scale*(79.4), scale*52.6,scale*(79.4), scale*99.2,0], 
                        'greenLeft': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-93),0, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*62.3,scale*47.6],
                        'greenRight': [scale*41.5,scale*(-71.9), scale*(-41.5),scale*(-71.9), scale*(-62.3),scale*47.6, scale*(-41.5),scale*(79.6), scale*41.5,scale*(79.6), scale*93,0]
                    },
                    cellOrder = ['white', 'white', 'white', 'white', 'greenLeft', 'greenLeft', 'greenRight', 'greenRight', 'red', 'red', 'red', 'blue', 'blue', 'blue'],
                    internalRotation = [0,0,0,0, -70,-60,135,130, 130,125,130, 5,70,70];


                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: cellVertices[cellOrder[i%14]],
                        x: this.generateCoords(i)[0],
                        y: this.generateCoords(i)[1],
                        rotation: internalRotation[i%14] + 72*Math.floor(i/14) - 54,
                        fill: '#000000',
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
                    grid = 1.2*0.07*this.height,
                    phase = -54,
                    baseCoords = [  
                                [Math.sin((72*phi+phase)/180*Math.PI)*0.8*grid + this.width/2, -Math.cos((72*phi+phase)/180*Math.PI)*0.8*grid +  0.4*this.height],
                                [Math.sin((72*phi+phase)/180*Math.PI)*1.8*grid + this.width/2, -Math.cos((72*phi+phase)/180*Math.PI)*1.8*grid +  0.4*this.height],
                                [Math.sin((72*phi+phase)/180*Math.PI)*2.8*grid + this.width/2, -Math.cos((72*phi+phase)/180*Math.PI)*2.8*grid +  0.4*this.height],
                                [Math.sin((72*phi+phase)/180*Math.PI)*3.8*grid + this.width/2, -Math.cos((72*phi+phase)/180*Math.PI)*3.8*grid +  0.4*this.height],

                                [Math.sin((72*phi+12+phase)/180*Math.PI)*4.5*grid + this.width/2, -Math.cos((72*phi+12+phase)/180*Math.PI)*4.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+27+phase)/180*Math.PI)*4.3*grid + this.width/2, -Math.cos((72*phi+27+phase)/180*Math.PI)*4.3*grid + 0.4*this.height],
                                [Math.sin((72*phi+60+phase)/180*Math.PI)*4.5*grid + this.width/2, -Math.cos((72*phi+60+phase)/180*Math.PI)*4.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+45+phase)/180*Math.PI)*4.3*grid + this.width/2, -Math.cos((72*phi+45+phase)/180*Math.PI)*4.3*grid + 0.4*this.height],

                                [Math.sin((72*phi+36+phase)/180*Math.PI)*1.5*grid + this.width/2, -Math.cos((72*phi+36+phase)/180*Math.PI)*1.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+16+phase)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+16+phase)/180*Math.PI)*3.4*grid + 0.4*this.height],
                                [Math.sin((72*phi+56+phase)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+56+phase)/180*Math.PI)*3.4*grid + 0.4*this.height],

                                [Math.sin((72*phi+23+phase)/180*Math.PI)*2.5*grid + this.width/2, -Math.cos((72*phi+23+phase)/180*Math.PI)*2.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+50+phase)/180*Math.PI)*2.5*grid + this.width/2, -Math.cos((72*phi+50+phase)/180*Math.PI)*2.5*grid + 0.4*this.height],
                                [Math.sin((72*phi+36+phase)/180*Math.PI)*3.4*grid + this.width/2, -Math.cos((72*phi+36+phase)/180*Math.PI)*3.4*grid + 0.4*this.height]
                ]

                return baseCoords[i%14]
            }
        }
    });

})();

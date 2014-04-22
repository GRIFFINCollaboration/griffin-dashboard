(function(){  

    xtag.register('detector-SPICE', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+window.location.host+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i,j,chan=0;

                //deploy the standard stuff
                this.viewNames = ['SPICE', 'aux'];
                this.channelNames = [ ];
                for(i=0; i<10; i++){
                    for(j=0; j<12; j++){
                        this.channelNames.push('SPI00XN' + ((chan<100) ? ((chan<10) ? '00'+chan : '0'+chan ) : chan ) );
                        chan++;
                    }
                }
                initializeDetector.bind(this, 'SPICE', 'SPICE', URLs)();

                //////////////////////////////////////
                //SPICE specific drawing parameters
                //////////////////////////////////////
                this.outerRad = 0.4*this.height;
                this.innerRad = 0.02*this.height;
                this.radStep  = (this.outerRad - this.innerRad) / 10;
                this.x0 = this.width/2;
                this.y0 = 0.4*this.height;

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
                var i, j, chan=0;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
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

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
            }
        }
    });

})();

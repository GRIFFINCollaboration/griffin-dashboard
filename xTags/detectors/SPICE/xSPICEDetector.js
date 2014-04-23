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
                this.viewNames = ['SPICE'];
                if(this.auxiliary)
                    this.viewNames.push(this.auxiliary);
                this.channelNames = [ ];
                for(i=0; i<10; i++){
                    for(j=0; j<12; j++){
                        this.channelNames.push('SPI00XN' + ((chan<100) ? ((chan<10) ? '00'+chan : '0'+chan ) : chan ) );
                        chan++;
                    }
                }
                //append S2 or S3 names as necessary
                if(this.auxiliary == 'S2'){
                    for(i=0; i<24; i++)
                        this.channelNames.push('SPZ00DP' + ((i<10) ? '0'+i : i ) + 'X');
                    for(i=0; i<16; i++)
                        this.channelNames.push('SPZ00DN' + ((i<10) ? '0'+i : i ) + 'X');
                } else if(this.auxiliary == 'S3'){
                    for(i=0; i<24; i++)
                        this.channelNames.push('SPE00DP' + ((i<10) ? '0'+i : i ) + 'X');
                    for(i=0; i<32; i++)
                        this.channelNames.push('SPE00DN' + ((i<10) ? '0'+i : i ) + 'X');
                }

                initializeDetector.bind(this, 'SPICE', 'SPICE', URLs)();

                //////////////////////////////////////
                //SPICE specific drawing parameters
                //////////////////////////////////////
                //SPICE
                this.outerRad = 0.4*this.height;
                this.innerRad = 0.02*this.height;
                this.radStep  = (this.outerRad - this.innerRad) / 10;
                this.x0 = this.width/2;
                this.y0 = 0.4*this.height + this.frameLineWidth;
                //auxiliaries
                this.auxPhiSteps = ((this.auxiliary == 'S2') ? 16 : ((this.auxiliary == 'S3') ? 32 : 0))
                this.auxRad = Math.min(0.39*this.height, 0.23*this.width);
                this.innerAuxRad = 0.05*this.auxRad;
                this.auxRadStep = (this.auxRad - this.innerAuxRad) / 24;
                this.auxPhiStep = 360 / Math.max(1, this.auxPhiSteps);

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

                //SPICE cells
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

                        chan++;
                    }

                }

                //auxiliary cells as required
                if(this.auxPhiSteps){
                    for(i=0; i<24; i++){
                        this.cells[this.channelNames[chan]] = new Kinetic.Arc({
                            innerRadius: this.innerAuxRad + i*this.auxRadStep,
                            outerRadius: this.innerAuxRad + (i+1)*this.auxRadStep,
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            angle: 365,
                            x: 0.25*this.width,
                            y: this.height*0.4,
                            closed: true,
                            listening: true
                        });  

                        chan++;                      
                    }

                    for(i=0; i<this.auxPhiSteps; i++){
                        this.cells[this.channelNames[chan]] = new Kinetic.Wedge({
                            x: 0.75*this.width,
                            y: 0.4*this.height,
                            radius: this.auxRad,
                            angle: this.auxPhiStep,
                            rotation: -this.auxPhiStep*(i+1),
                            clockwise: false,
                            fill: '#000000',
                            fillPatternImage: this.errorPattern,
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true
                        }); 

                        chan++;                      
                    }                    
                }

                for(i=0; i<this.channelNames.length; i++){
                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[Math.floor(i/120)].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                this.stage[0].add(this.tooltipLayer[0]);
                if(this.auxPhiSteps){
                    this.stage[1].add(this.mainLayer[1]);
                    this.stage[1].add(this.tooltipLayer[1]);
                }
            }
        }
    });

})();

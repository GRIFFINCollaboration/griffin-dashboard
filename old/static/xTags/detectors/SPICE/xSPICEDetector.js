(function(){  

    xtag.register('detector-SPICE', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = ['http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
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
                    for(i=23; i>=0; i--)
                        this.channelNames.push('SPZ00DP' + ((i<10) ? '0'+i : i ) + 'X');
                    for(i=0; i<16; i++)
                        this.channelNames.push('SPZ00DN' + ((i<10) ? '0'+i : i ) + 'X');
                } else if(this.auxiliary == 'S3'){
                    for(i=23; i>=0; i--)
                        this.channelNames.push('SPE00DP' + ((i<10) ? '0'+i : i ) + 'X');
                    for(i=0; i<32; i++)
                        this.channelNames.push('SPE00DN' + ((i<10) ? '0'+i : i ) + 'X');
                }

                initializeDetector.bind(this, 'SPICE', 'SPICE')();

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
                //generate the color scale
                this.generateColorScale();
                //initialize all the cells:
                this.instantiateCells();
                this.populate();
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
            'auxiliary':{
                attribute: {}
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, j, chan=0, centerDot;

                //SPICE cells
                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<10; i++){ //10 rings
                    for(j=0; j<12; j++){ //12 phi sectors

                        this.cells[this.channelNames[chan]] = new Kinetic.Arc({
                            innerRadius: this.innerRad + i*this.radStep,
                            outerRadius: this.innerRad + (i+1)*this.radStep,
                            angle: 30,
                            clockwise: false,
                            rotationDeg: -30*(j+1),
                            x: this.x0,
                            y: this.y0,
                            fill: '#000000',
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true
                        });

                        chan++;
                    }

                }

                //auxiliary cells as required
                if(this.auxPhiSteps){
                    for(i=0; i<24; i++){
                        this.cells[this.channelNames[chan]] = new Kinetic.Circle({
                            radius: this.auxRad - i*this.auxRadStep,
                            x: 0.25*this.width,
                            y: this.height*0.4,
                            fill: '#000000',
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true
                        });  

                        chan++;                      
                    }

                    centerDot = new Kinetic.Circle({
                        radius: this.innerAuxRad,
                        fill: '#222222',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        x: 0.25*this.width,
                        y: this.height*0.4
                    });

                    for(i=0; i<this.auxPhiSteps; i++){
                        this.cells[this.channelNames[chan]] = new Kinetic.Wedge({
                            x: 0.75*this.width,
                            y: 0.4*this.height,
                            radius: this.auxRad,
                            angle: this.auxPhiStep,
                            rotation: -this.auxPhiStep*(i+1),
                            clockwise: false,
                            fill: '#000000',
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
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
                //black out center dot of auxiliary rings
                if(this.auxPhiSteps)
                    this.mainLayer[1].add(centerDot);

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
                if(this.auxPhiSteps){
                    this.stage[1].add(this.mainLayer[1]);
                }
            },

            //S2 and S2 radial bins shouldn't be reordered onclick
            'shuffleCell' : function(cellName){
                if( (cellName.slice(0,3) == 'SPE' || cellName.slice(0,3) == 'SPZ') && cellName.indexOf('DP')!=-1 )
                    return false;
                else
                    return true;
            }
        }
    });

})();
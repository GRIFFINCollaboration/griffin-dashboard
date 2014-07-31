(function(){  

    xtag.register('detector-DANTE', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = ['http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i, j;
                if(this.readout == 'Energy')
                    this.suffix = 'N00X';
                else
                    this.suffix = 'T00X'

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                this.channelNames = [   'DAL01X' + this.suffix, 'DAL02X' + this.suffix, 'DAL03X' + this.suffix, 'DAL04X' + this.suffix,
                                        'DAL05X' + this.suffix, 'DAL06X' + this.suffix, 'DAL07X' + this.suffix, 'DAL08X' + this.suffix
                                    ]
                //suppressor names
                for(i=0; i<8; i++){
                    for(j=0; j<3; j++){
                        this.channelNames.push('DAS0'+(i+1)+'XN0'+j+'X');
                    }
                }

                //DANTE has special views, define them by hand first
                this.views = ['HV', 'Threshold', 'reqRate', 'acptRate'];
                this.viewLabels = ['HV', 'Threshold', 'Trigger Request Rate', 'Trigger Accept Rate'];
                this.units = ['V', 'ADC Units', 'Hz', 'Hz']
                initializeDetector.bind(this, 'DANTE', 'DANTE-'+this.readout)();


                //////////////////////////////////////
                //DANTE specific drawing parameters
                //////////////////////////////////////
                this.outerBGORad = 0.1*0.8*this.height;
                this.innerBGOrad = 0.08*0.8*this.height;
                this.LaBrRad = 0.05*0.8*this.height;
                this.ringRad = Math.min(0.3*this.height, 0.5*0.45*this.width - this.outerBGORad);
                this.westCenterX = this.ringRad+this.outerBGORad;
                this.westCenterY = 0.4*this.height;
                this.eastCenterX = this.width - this.ringRad - this.outerBGORad;
                this.eastCenterY = 0.4*this.height;
                this.detCenterX = [ this.westCenterX + this.ringRad, this.westCenterX, this.westCenterX - this.ringRad, this.westCenterX,
                                    this.eastCenterX + this.ringRad, this.eastCenterX, this.eastCenterX - this.ringRad, this.eastCenterX];
                this.detCenterY = [ this.westCenterY, this.westCenterY - this.ringRad, this.westCenterY, this.westCenterY + this.ringRad,
                                    this.eastCenterY, this.eastCenterY - this.ringRad, this.eastCenterY, this.eastCenterY + this.ringRad]

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

            'readout':{
                attribute: {} //this just needs to be declared
            }

        }, 
        methods: {
            'instantiateCells': function(){
                var i, j, suppressorName, cardIndex, X, Y, mask = [], bkgRing, westLabel, eastLabel;

                //draw background rings:
                for(i=0; i<2; i++){
                    bkgRing = new Kinetic.Circle({
                        radius: this.ringRad,
                        x: (i==0) ? this.westCenterX : this.eastCenterX,
                        y: (i==0) ? this.westCenterY : this.eastCenterY,
                        stroke: '#999999',
                        strokeWidth: this.frameLineWidth
                    })
                    this.mainLayer[0].add(bkgRing);
                }

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<8; i++){
                    //determine which card this cell belongs to:
                    cardIndex = 0; //simple, only one card

                    X = this.detCenterX[i];
                    Y = this.detCenterY[i];

                    //suppressors
                    for(j=0; j<3; j++){
                        suppressorName = 'DAS0'+(i+1)+'XN0'+j+'X'

                        this.cells[suppressorName] = new Kinetic.Arc({
                            innerRadius: this.innerBGOrad,
                            outerRadius: this.outerBGORad,
                            x: X,
                            y: Y,
                            fill: '#000000',
                            angle: 120,
                            clockwise: false,
                            rotationDeg: -120*(j+1),
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true
                        });

                        //set up the tooltip listeners for suppressors:
                        this.cells[suppressorName].on('mouseover', this.writeTooltip.bind(this, 8+3*i+j) );
                        this.cells[suppressorName].on('mousemove', this.moveTooltip.bind(this) );
                        this.cells[suppressorName].on('mouseout', this.writeTooltip.bind(this, -1));

                        //set up onclick listeners:
                        this.cells[this.channelNames[8+3*i+j]].on('click', this.clickCell.bind(this, this.channelNames[8+3*i+j]) );

                        //add to main layer
                        this.mainLayer[cardIndex].add(this.cells[suppressorName]);
                    }

                    //center mask (so BGO appears as annulus)
                    mask[i] = new Kinetic.Circle({
                        radius: this.innerBGOrad,
                        x: X,
                        y: Y,
                        fill: '#222222',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth
                    });

                    //LaBr
                    this.cells['DAL0'+(i+1)+'X'+this.suffix] = new Kinetic.Circle({
                        radius: this.LaBrRad,
                        x: X,
                        y: Y,
                        fill: '#000000',
                        fillPatternOffsetX: 100*Math.random(),
                        fillPatternOffsetY: 100*Math.random(),
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells['DAL0'+(i+1)+'X'+this.suffix].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells['DAL0'+(i+1)+'X'+this.suffix].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells['DAL0'+(i+1)+'X'+this.suffix].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(mask[i]);
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);
                    
                }

                //labels
                westLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'West Ring',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(westLabel);
                //center label nicely
                westLabel.setAttr('x', this.westCenterX - westLabel.getTextWidth()/2);
                westLabel.setAttr('y', 0.8*this.height - westLabel.getTextHeight());

                eastLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'East Ring',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(eastLabel);
                //center label nicely
                eastLabel.setAttr('x', this.eastCenterX - eastLabel.getTextWidth()/2);
                eastLabel.setAttr('y', 0.8*this.height - eastLabel.getTextHeight());

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
            },

        }
    });

})();

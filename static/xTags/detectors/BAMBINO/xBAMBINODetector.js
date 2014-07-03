(function(){  

    xtag.register('detector-BAMBINO', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i, j, prefix;

                this.dets = JSON.parse(this.config);
                this.layerIndex = ['D', 'E', 'F'];

                //deploy a view for each disk, and construct channel names
                this.viewNames = [];
                this.channelNames = [];
                if(this.dets.upstream){
                    for(i=0; i<Math.min(this.dets.upstream.length, 3); i++){
                        if(this.dets.upstream[i]){
                            prefix = (this.dets.upstream[i] == 'S2') ? 'BAZ01' : 'BAE01';
                            this.viewNames.push(prefix + this.layerIndex[i]);
                            //front channel names
                            for(j=0; j<24; j++){
                                this.channelNames.push(prefix + this.layerIndex[i] + 'P' + ((j<10)? '0'+j : j) + 'X');
                            }
                            //back channel names
                            for(j=0; j<((this.dets.upstream[i]=='S2')?16:32); j++){
                                this.channelNames.push(prefix + this.layerIndex[i] + 'N' + ((j<10)? '0'+j : j) + 'X');   
                            }
                        }
                    }
                }
                if(this.dets.downstream){
                    for(i=0; i<Math.min(this.dets.downstream.length, 3); i++){
                        if(this.dets.downstream[i]){
                            prefix = (this.dets.downstream[i] == 'S2') ? 'BAZ02' : 'BAE02';
                            this.viewNames.push(prefix + this.layerIndex[i]);
                            //front channel names
                            for(j=0; j<24; j++){
                                this.channelNames.push(prefix + this.layerIndex[i] + 'P' + ((j<10)? '0'+j : j) + 'X');
                            }
                            //back channel names
                            for(j=0; j<((this.dets.downstream[i]=='S2')?16:32); j++){
                                this.channelNames.push(prefix + this.layerIndex[i] + 'N' + ((j<10)? '0'+j : j) + 'X');   
                            }
                        }
                    }
                }       

                initializeDetector.bind(this, 'BAMBINO', 'BAMBINO')();

                //////////////////////////////////////
                //BAMBINO specific drawing parameters
                //////////////////////////////////////
                this.rad = Math.min(0.39*this.height, 0.23*this.width);
                this.innerRad = 0.05*this.rad;
                this.radStep = (this.rad - this.innerRad) / 24;

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
            'rateServer':{
                attribute: {} //this just needs to be declared
            },
            'thresholdServer':{
                attribute: {}
            },
            'config':{
                attribute: {}
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, cardIndex, isFront, segment, phiSegments, centerDot;

                for(i=0; i<this.channelNames.length; i++){
                    //which slide is this on?
                    cardIndex = this.viewNames.indexOf(this.channelNames[i].slice(0,6));
                    //front or back?
                    isFront = this.channelNames[i].indexOf('N') == -1;
                    //which segment?
                    segment = parseInt(this.channelNames[i].slice(7,9),10);
                    //how many phi segments
                    phiSegments = ((this.channelNames[i].slice(0,3) == 'BAZ') ? 16 : 32);

                    if(isFront){
                        this.cells[this.channelNames[i]] = new Kinetic.Circle({
                            radius: this.rad - (23-segment)*this.radStep,
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
                    } else{
                        this.cells[this.channelNames[i]] = new Kinetic.Wedge({
                            x: 0.75*this.width,
                            y: 0.4*this.height,
                            radius: this.rad,
                            angle: 360 / phiSegments,
                            rotation: -360/phiSegments*(segment+1),
                            clockwise: false,
                            fill: '#000000',
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random(),
                            stroke: this.frameColor,
                            strokeWidth: this.frameLineWidth,
                            closed: true,
                            listening: true
                        });
                    }

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);

                    //reorder things in z as necessary
                    if(isFront)
                        this.cells[this.channelNames[i]].setZIndex(-segment);
                }

                //add the layers to the stage, and a mask to each front
                console.log(this.mainLayer)
                for(i=0; i<this.viewNames.length; i++){
                    centerDot = new Kinetic.Circle({
                        radius: this.innerRad,
                        fill: '#222222',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        x: 0.25*this.width,
                        y: this.height*0.4
                    });
                    this.mainLayer[i].add(centerDot);
                    centerDot.moveToTop();

                    this.stage[i].add(this.mainLayer[i]);
                }
            }
        }
    });

})();

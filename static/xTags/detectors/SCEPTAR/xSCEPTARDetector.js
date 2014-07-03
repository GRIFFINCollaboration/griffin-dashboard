(function(){  

    xtag.register('detector-SCEPTAR', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'],  //ODB Equipment tree
                    i;

                //deploy the standard stuff
                this.viewNames = ['SingleView'];
                //channels start at top left hand corner and walk across in rows
                this.channelNames = [];
                for(i=1; i<21; i++){
                    this.channelNames[i-1] = 'SEP' + ((i<10)?'0'+i : i) + 'XN00X';
                }
                   
                initializeDetector.bind(this, 'SCEPTAR', 'SCEPTAR')();

                //////////////////////////////////////
                //SCEPTAR specific drawing parameters
                //////////////////////////////////////
                this.upstreamCenterX = 0.25*this.width;
                this.upstreamCenterY = 0.4*this.height;
                this.downstreamCenterX = 0.75*this.width;
                this.downstreamCenterY = 0.4*this.height;
                this.spokeLength = 0.3*this.height;
                this.outerVertexX = [0, Math.sin(72/180*Math.PI)*this.spokeLength, Math.sin(144/180*Math.PI)*this.spokeLength, Math.sin(216/180*Math.PI)*this.spokeLength, Math.sin(288/180*Math.PI)*this.spokeLength];
                this.outerVertexY = [-this.spokeLength, -Math.cos(72/180*Math.PI)*this.spokeLength, -Math.cos(144/180*Math.PI)*this.spokeLength, -Math.cos(216/180*Math.PI)*this.spokeLength, -Math.cos(288/180*Math.PI)*this.spokeLength];
                this.innerVertexX = [0, Math.sin(72/180*Math.PI)*this.spokeLength/2, Math.sin(144/180*Math.PI)*this.spokeLength/2, Math.sin(216/180*Math.PI)*this.spokeLength/2, Math.sin(288/180*Math.PI)*this.spokeLength/2];
                this.innerVertexY = [-this.spokeLength/2, -Math.cos(72/180*Math.PI)*this.spokeLength/2, -Math.cos(144/180*Math.PI)*this.spokeLength/2, -Math.cos(216/180*Math.PI)*this.spokeLength/2, -Math.cos(288/180*Math.PI)*this.spokeLength/2];
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
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i, X, Y, cardIndex, points, upstreamLabel, downstreamLabel;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    if(i<10)
                        X = this.upstreamCenterX;
                    else
                        X = this.downstreamCenterX;
                    Y = this.upstreamCenterY;

                    if(i%10<5){
                        points = [this.outerVertexX[i%10],this.outerVertexY[i%10], this.outerVertexX[(i%10 + 1)%5],this.outerVertexY[(i%10 + 1)%5], this.innerVertexX[(i%10 + 1)%5],this.innerVertexY[(i%10 + 1)%5], this.innerVertexX[i%10],this.innerVertexY[i%10]];
                    } else{
                        points = [this.innerVertexX[i%10 - 5],this.innerVertexY[i%10 - 5], this.innerVertexX[(i%10 - 4)%5],this.innerVertexY[(i%10 - 4)%5], 0,0];
                    }

                    //determine which card this cell belongs to:
                    cardIndex = 0; //simple, only one card

                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: points,
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
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the main layer
                    this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]);
                }

                //labels
                upstreamLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'Upstream',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(upstreamLabel);
                //center label nicely
                upstreamLabel.setAttr('x', this.upstreamCenterX - upstreamLabel.getTextWidth()/2);
                upstreamLabel.setAttr('y', 0.8*this.height - upstreamLabel.getTextHeight());

                downstreamLabel = new Kinetic.Text({
                    x: 0,
                    y: 0,
                    text: 'Downstream',
                    fontSize: 28,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                this.mainLayer[0].add(downstreamLabel);
                //center label nicely
                downstreamLabel.setAttr('x', this.downstreamCenterX - downstreamLabel.getTextWidth()/2);
                downstreamLabel.setAttr('y', 0.8*this.height - downstreamLabel.getTextHeight());

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
            }
        }
    });

})();

(function(){  

    xtag.register('detector-ZDS', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['ZDS'];
                this.channelNames = ['ZDS01XN00X'];

                initializeDetector.bind(this, 'ZDS', 'ZDS')();
console.log(this.width)
                //////////////////////////////////////
                //ZDS specific drawing parameters
                //////////////////////////////////////
                this.x0 = this.width/2;
                this.y0 = 0.4*this.height + this.frameLineWidth;
                this.radius = 0.5*this.y0;

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
            }
        }, 
        methods: {
            'instantiateCells': function(){
                var i;

                //ZDS cells
                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Circle({
                        radius: this.radius,
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

                    this.mainLayer[0].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
            },

        }
    });

})();

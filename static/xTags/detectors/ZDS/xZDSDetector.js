(function(){  

    xtag.register('detector-ZDS', {
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                var URLs = ['http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //deploy the standard stuff
                this.viewNames = ['ZDS'];
                if(this.readout == 'Energy')
                    this.channelNames = ['ZDS01XN00X'];
                else if(this.readout == 'TAC')
                    this.channelNames = ['ZDS01XT00X'];

                initializeDetector.bind(this, 'ZDS', 'ZDS-'+this.readout)();

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
            },

            'readout':{
                attribute: {}
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

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add cell to main layer
                    this.mainLayer[0].add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage[0].add(this.mainLayer[0]);
            },

        }
    });

})();

//status bar
(function(){  

    xtag.register('detector-TIPWall', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                initializeSingleViewDetector.bind(this, 'TIP', ['TIPWCHAN00'], 'TIP Wall', null)();                
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {

        }, 
        methods: {
            'instantiateCells': function(){
                var i;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: [200,200,300,200,300,300,200,300,200,200],
                        fill: '#000000',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //add the cell to the main layer
                    this.mainLayer.add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage.add(this.mainLayer);
                this.stage.add(this.tooltipLayer);
            }
        }
    });

})();


//JSONP wrapper function def:
function fetchDetectorData(returnObj){
    if(!window.currentData.ODB)
        window.currentData.ODB = {};
    window.currentData.ODB.DEMO = returnObj;
}

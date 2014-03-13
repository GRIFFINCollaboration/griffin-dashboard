//status bar
(function(){  

    xtag.register('x-demoDetector', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var canvas = document.createElement('canvas')
                ,   width = 600
                ,   height = 400

                canvas.setAttribute('id', this.id+'Canvas');
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                this.appendChild(canvas);

                //declare the detector cell names for this detector:
                this.channelNames = ['DEMOCHAN00'];
                this.cells = {};

                //set up the easel canvas environment:
                this.stage = new createjs.Stage(this.id+'Canvas');
                this.wireLayer = new createjs.Container();      //layer for outline
                this.cellLayer = new createjs.Container();      //layer for detector cells
                this.stage.addChild(this.wireLayer);
                this.stage.addChild(this.cellLayer);

                //drawing parameters
                this.frameLineWidth = 2;
                this.frameColor = '#999999';
                this.width = width;
                this.height = height;

                //draw the wireframe:
                this.drawFrame();

                //initialize all the cells:
                this.instantiateCells();

                //prepare the stage to animate on tick
                createjs.Ticker.addEventListener("tick", this.stage);

                this.updateCells();

                //render the canvas:
                this.stage.update();










                //append data location information to list of URLs to fetch from:
                /*
                if(!window.fetchURL)
                    window.fetchURL = [];
                if(window.fetchURL.indexOf(URL) == -1){
                    window.fetchURL[window.fetchURL.length] = URL;
                }
                */
                /*
                //let repopulate know that the status bar would like to be updated every loop:
                if(!window.refreshTargets)
                    window.refreshTargets = [];
                window.refreshTargets[window.refreshTargets.length] = this;
                */
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

            'update': function(){
                
            },

            'drawFrame': function(){
                var frame;

                //declare frame and set it's linewidth and color:
                frame = new createjs.Shape();
                frame.graphics.ss(this.frameLineWidth).s(this.frameColor);

                //draw the frame:
                frame.graphics.mt(100, 100).lt(200,100).lt(200,200).lt(100,200).lt(100,100);
                this.wireLayer.addChild(frame);
            },

            'instantiateCells': function(){
                var cell, i;

                //each channel listed in this.channelNames gets an entry in this.cells as an easel object: 
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new createjs.Shape();

                    this.cells[this.channelNames[i]].graphics.beginFill('0x000000').mt(100, 100).lt(200,100).lt(200,200).lt(100,200).lt(100,100);
                    this.cellLayer.addChild(this.cells[this.channelNames[i]]);                
                }
            },

            'updateCells': function(){
                var i, tween;

                this.cellLayer.removeAllChildren();

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){
                    tween = new createjs.Tween.get(this.cells[this.channelNames[i]]).to({x:200,y:200}, 5000).call(function(){});
                    this.cellLayer.addChild(this.cells[this.channelNames[i]]); 
                }

            }
        }
    });

})();

/*
//JSONP wrapper function def:
function fetchDetectorData(returnObj){
    if(!window.currentData.detectorData)
        window.currentData.detectorData = {};
    window.currentData.detectorData = returnObj;
}
*/
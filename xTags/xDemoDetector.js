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
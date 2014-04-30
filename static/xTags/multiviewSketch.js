//status bar
(function(){  

    xtag.register('x-demoDetector', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h1')
                ,   viewTitles = ['HV', 'Threshold', 'Rate']
                ,   subdetectorNav = [document.createElement('button'), document.createElement('button'), document.createElement('button')]
                ,   deck = document.createElement('x-deck')
                ,   views = [document.createElement('x-card'), document.createElement('x-card'), document.createElement('x-card')]
                ,   canvases = [document.createElement('canvas'), document.createElement('canvas'), document.createElement('canvas')]
                //canvas has aspect ratio 3:2 and tries to be 80% of the window width, but not more than 80% of the window height
                ,   width = Math.min(window.innerWidth*0.8, 3*window.innerHeight*0.8/2)
                ,   height = 2*width/3
                ,   i;
                //easel.js vars, persist on this for use in drawing routines
                this.stage = []
                this.wireLayer = []
                this.cellLayer = []

                //top nav - title and state navigation buttons:
                title.setAttribute('id', this.id+'title');
                title.setAttribute('class', 'subdetectorTitle');
                this.appendChild(title);
                document.getElementById(this.id+'title').innerHTML = 'Demo Detector';

                for(i=0; i<subdetectorNav; i++){
                    subdetectorNav[i].setAttribute('id', this.id+'goto'+viewTitles[i]);
                    subdetectorNav[i].setAttribute('class', 'subdetectorStateNav');
                    this.appendChild(subdetectorNav[i]);
                    document.getElementById(this.id+'goto'+viewTitles[i]).innerHTML = viewTitles[i];                    
                }

                //x-deck manages the state views:
                deck.setAttribute('id', this.id+'deck');
                deck.setAttribute('class', 'subdetectorDeck');
                deck.setAttribute('selected-index', 0);
                this.appendChild(deck)

                for(i=0; i<views.length; i++){
                    views[i].setAttribute('id', this.id+viewTitles[i]+'Card');
                    views[i].setAttribute('class', 'subdetectorStateCard');
                    document.getElementById(this.id+'deck').appendChild(views[i]);
                    //each view gets a canvas
                    canvases[i].setAttribute('id', this.id+viewTitles[i]+'Canvas');
                    canvases[i].setAttribute('width', width);
                    canvases[i].setAttribute('height', height);
                    document.getElementById(this.id+viewTitles[i]+'Card').appendChild(canvases[i]);
                    //each canvas gets wrapped as an easel.js stage
                    this.stage[i] = new createjs.Stage(this.id+viewTitles[i]+'Canvas');
                    this.wireLayer[i] = new createjs.Container();
                    this.cellLayer[i] = new createjs.Container();
                    this.stage[i].addChild(this.wireLayer[i]);
                    this.stage[i].addChild(this.cellLayer[i]);
                }




                //declare the detector cell names for this detector:
                this.channelNames = ['DEMOCHAN00'];
                //each view gets its own object to contain its cells
                this.cells = [{},{},{}];

                //drawing parameters
                this.frameLineWidth = 2;
                this.frameColor = '#999999';
                this.width = width;
                this.height = height;

                //draw the wireframe:
                for(i=0; i<views.length; i++)
                    this.drawFrame(i);

                //initialize all the cells:
                this.instantiateCells();

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
                var i;

                //dump everything so children don't stack up
                this.cellLayer.removeAllChildren();

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){

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
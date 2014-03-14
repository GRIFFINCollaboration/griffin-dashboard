//status bar
(function(){  

    xtag.register('x-demoDetector', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var headWrapper = document.createElement('div')
                ,   title = document.createElement('h1')
                ,   viewTitles = ['HV', 'Threshold', 'Rate']
                ,   canvas = document.createElement('canvas')
                //canvas has aspect ratio 3:2 and tries to be 80% of the window width, but not more than 80% of the window height
                ,   width = Math.min(window.offsetWidth*0.8, 3*window.offsetHeight*0.8/2)
                ,   height = 2*width/3
                ,   i, subdetectorNav, subdetectorNavLabel;

                //////////////////////
                //Build DOM
                //////////////////////
                headWrapper.setAttribute('id', this.id+'titleWrapper');
                headWrapper.setAttribute('class', 'subdetectorHeadlineWrap')
                this.appendChild(headWrapper);
                //top nav title
                title.setAttribute('id', this.id+'title');
                title.setAttribute('class', 'subdetectorTitle');
                document.getElementById(this.id+'titleWrapper').appendChild(title);
                document.getElementById(this.id+'title').innerHTML = 'Demo Detector';
                //state nav radio
                for(i=0; i<viewTitles.length; i++){
                    subdetectorNav = document.createElement('input')
                    subdetectorNav.setAttribute('id', this.id+'goto'+viewTitles[i]);
                    subdetectorNav.setAttribute('class', 'subdetectorNavRadio');
                    subdetectorNav.setAttribute('type', 'radio');
                    subdetectorNav.setAttribute('name', this.id+'Nav');
                    if(i==2) subdetectorNav.setAttribute('selected', true); //default to rate view
                    document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNav);
                    subdetectorNavLabel = document.createElement('label');
                    subdetectorNavLabel.setAttribute('id', this.id+'goto'+viewTitles[i]+'Label');
                    subdetectorNavLabel.setAttribute('class', 'subdetectorNavLabel');
                    subdetectorNavLabel.setAttribute('for', this.id+'goto'+viewTitles[i]);
                    document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNavLabel);
                    document.getElementById(this.id+'goto'+viewTitles[i]+'Label').innerHTML = viewTitles[i];
                }

                //canvas to paint detector in
                canvas.setAttribute('id', this.id+'Canvas');
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                this.appendChild(canvas);

                ////////////////////////////
                //Define Channels
                ////////////////////////////
                //declare the detector cell names for this detector:
                this.channelNames = ['DEMOCHAN00'];
                this.cells = {};

                ////////////////////////////
                //Drawing parameters
                ////////////////////////////
                this.frameLineWidth = 2;
                this.frameColor = '#999999';
                this.width = width;
                this.height = height;

                ////////////////////////////
                //Easel.js setup
                ////////////////////////////
                //set up the easel canvas environment:
                this.stage = new createjs.Stage(this.id+'Canvas');
                this.wireLayer = new createjs.Container();      //layer for outline
                this.cellLayer = new createjs.Container();      //layer for detector cells
                this.stage.addChild(this.wireLayer);
                this.stage.addChild(this.cellLayer);

                //draw the wireframe:
                this.drawFrame();

                //initialize all the cells:
                this.instantiateCells();

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
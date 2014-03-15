//status bar
(function(){  

    xtag.register('detector-demo', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var headWrapper = document.createElement('div')
                ,   title = document.createElement('h1')
                ,   viewTitles = ['HV', 'Threshold', 'Rate']
                ,   drawTarget = document.createElement('div')
                //image has aspect ratio 3:2 and tries to be 80% of the window width, but not more than 80% of the window height
                ,   width = this.offsetWidth
                ,   height = 2*width/3
                ,   i, subdetectorNav, subdetectorNavLabel

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
                    subdetectorNav.setAttribute('value', viewTitles[i]);
                    subdetectorNav.onchange = this.trackView.bind(this);
                    if(i==2) subdetectorNav.setAttribute('checked', true); //default to rate view
                    document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNav);
                    subdetectorNavLabel = document.createElement('label');
                    subdetectorNavLabel.setAttribute('id', this.id+'goto'+viewTitles[i]+'Label');
                    subdetectorNavLabel.setAttribute('class', 'subdetectorNavLabel');
                    subdetectorNavLabel.setAttribute('for', this.id+'goto'+viewTitles[i]);
                    document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNavLabel);
                    document.getElementById(this.id+'goto'+viewTitles[i]+'Label').innerHTML = viewTitles[i];
                }
                this.currentView = 'Rate';

                //div to paint detector in
                drawTarget.setAttribute('id', this.id+'Draw');
                this.appendChild(drawTarget);

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
                //Kinetic.js setup
                ////////////////////////////
                //point kinetic at the div and set up the staging and layers:
                this.stage = new Kinetic.Stage({
                    container: this.id+'Draw',
                    width: width,
                    height: height
                });
                this.mainLayer = new Kinetic.Layer();       //main rendering layer
                this.tooltipLayer = new Kinetic.Layer();    //layer for tooltip info

                //tooltip text:
                this.text = new Kinetic.Text({
                    x: 70,
                    y: 10,
                    fontFamily: 'Arial',
                    fontSize: 14,
                    text: '',
                    fill: '#999999'
                });

                //initialize all the cells:
                this.instantiateCells();








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

            'instantiateCells': function(){
                var i;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: [100,100,200,100,200,200,100,200,100,100],
                        fill: '#000000',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', function(this.writeTooltip(i)) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //add the cell to the main layer
                    this.mainLayer.add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage.add(this.mainLayer);
                this.stage.add(this.tooltipLayer);
            },

            'updateCells': function(){
                var i, color;

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){
                    //determine the color of the cell as a function of the view state:
                    if(this.currentView == 'HV'){
                        color = '#FF0000';
                    } else if (this.currentView == 'Threshold'){
                        color = '#00FF00';
                    } else if (this.currentView == 'Rate'){
                        color = '#0000FF';
                    }

                    //recolor the cell:
                    this.cells[this.channelNames[i]].fill(color);
                }

                this.mainLayer.draw();
            },

            'trackView': function(){
                //keep track of what state the view state radio is in in a convenient variable right on the detector-demo object
                //intended for binding to the onchange of the radio.
                this.currentView = document.querySelector('input[name="'+this.id+'Nav"]:checked').value;

                this.updateCells();
            },

            'writeTooltip': function(i){
                //formulate the tooltip text for cell i and write it on the tooltip layer.
                var text; 
                if(i!=-1){
                    text = this.channelNames[i];    
                } else {
                    text = '';
                }
                this.text.setText(text);
                this.tooltipLayer.draw();

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
function initializeDetector(name, headline){
    var headWrapper = document.createElement('div')
    ,   title = document.createElement('h1')
    ,   drawTarget = document.createElement('div')
    ,   plotControlWrap = document.createElement('form')
    ,   plotControlTitle = document.createElement('h3')
    ,   plotControlMinLabel = document.createElement('label')
    ,   plotControlMaxLabel = document.createElement('label')
    ,   plotControlMin = document.createElement('input')
    ,   plotControlMax = document.createElement('input')
    ,   plotScale = document.createElement('select')
    ,   plotScaleLin = document.createElement('option')
    ,   plotScaleLog = document.createElement('option')
    ,   deckWrap = document.createElement('div')
    ,   plotDeck
    ,   plotCard
    ,   xString
    ,   deckNavigator, deckOption
    //image has aspect ratio 3:2 and tries to be 80% of the window width, but not more than 80% of the window height
    ,   width = this.offsetWidth
    ,   height = 2*width/3
    ,   i, subdetectorNav, subdetectorNavLabel

    this.name = name;
    //declare default views and units if none pre-defined
    if(!this.views)
        this.views = ['HV', 'Threshold', 'Rate'];
    if(!this.units)
        this.units = ['V', 'ADC Units', 'Hz'];

    //set up data store for detectors
    if(!window.currentData)
        window.currentData = {};
    for(i=0; i<this.views.length; i++){
        window.currentData[this.views[i]] = {};
    }

    //////////////////////
    //Build DOM
    //////////////////////
    //the DOM layout for a detector view is roughly:

    //-----------------------------------
    // h1 Title
    //-----------------------------------
    // input[radio] HV / Thresh / Rate
    //-----------------------------------
    // x-deck for detector views; each
    // card contains a Kinetic drawing
    // context
    //
    //-----------------------------------
    // x-deck navigation if required
    //-----------------------------------
    // form plot control widget
    //-----------------------------------


    headWrapper.setAttribute('id', this.id+'titleWrapper');
    headWrapper.setAttribute('class', 'subdetectorHeadlineWrap')
    this.appendChild(headWrapper);
    //top nav title
    title.setAttribute('id', this.id+'title');
    title.setAttribute('class', 'subdetectorTitle');
    document.getElementById(this.id+'titleWrapper').appendChild(title);
    document.getElementById(this.id+'title').innerHTML = headline;
    //state nav radio
    for(i=0; i<this.views.length; i++){
        subdetectorNav = document.createElement('input')
        subdetectorNav.setAttribute('id', this.id+'goto'+this.views[i]);
        subdetectorNav.setAttribute('class', 'subdetectorNavRadio');
        subdetectorNav.setAttribute('type', 'radio');
        subdetectorNav.setAttribute('name', this.id+'Nav');
        subdetectorNav.setAttribute('value', this.views[i]);
        subdetectorNav.onchange = this.trackView.bind(this);
        if(i==2) subdetectorNav.setAttribute('checked', true); //default to rate view
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNav);
        subdetectorNavLabel = document.createElement('label');
        subdetectorNavLabel.setAttribute('id', this.id+'goto'+this.views[i]+'Label');
        subdetectorNavLabel.setAttribute('class', 'subdetectorNavLabel');
        subdetectorNavLabel.setAttribute('for', this.id+'goto'+this.views[i]);
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNavLabel);
        document.getElementById(this.id+'goto'+this.views[i]+'Label').innerHTML = this.views[i];
    }
    //plot deck wrapper:
    deckWrap.setAttribute('id', this.id+'DeckWrap');
    this.appendChild(deckWrap);

    //declaring x-tags from within other x-tags needs special treatment via innerHTML; must build HTML string and set it.
    xString = '<x-deck id="' + this.id + 'Deck" selected-index=0 style="height:'+height+'">';
    for(i=0; i<this.viewNames.length; i++){
        xString += '<x-card id="' + this.id+this.viewNames[i] + 'Card"></x-card>';
    }
    xString += '</x-deck>'
    deckWrap.innerHTML = xString;

    //plot buffers
    for(i=0; i<this.viewNames.length; i++){
        //divs to hold kinetic contexts
        drawTarget = document.createElement('div');
        drawTarget.setAttribute('id', this.id+this.viewNames[i]+'Draw');
        document.getElementById(this.id+this.viewNames[i] + 'Card').appendChild(drawTarget);
    }

    //plot control widget
    plotControlWrap.setAttribute('id', this.id+'PlotControl');
    plotControlWrap.setAttribute('class', 'plotControlWidget');
    this.appendChild(plotControlWrap);
    document.getElementById(this.id+'PlotControl').onchange = this.updatePlotParameters.bind(this);

    plotControlTitle.setAttribute('id', this.id+'PlotControlTitle');
    plotControlWrap.appendChild(plotControlTitle);
    document.getElementById(this.id + 'PlotControlTitle').innerHTML = 'Plot Control'

    //x-deck navigation
    if(this.viewNames.length > 1){
        deckNavigator = document.createElement('select');
        deckNavigator.id = this.id + 'viewSelect';
        for(i=0; i<this.viewNames.length; i++){
            deckOption = document.createElement('option');
            deckOption.innerHTML = this.viewNames[i];
            deckOption.value = i;
            deckNavigator.appendChild(deckOption);
        }
        deckNavigator.onchange = function(){
            var viewVal = selected(this.id+'viewSelect'); 

            document.getElementById(this.id+'Deck').shuffleTo(viewVal);
            this.displayIndex = viewVal;
            this.update();  //repaint right away
        }.bind(this)
        plotControlWrap.appendChild(deckNavigator);
    }

    plotControlMinLabel.setAttribute('id', this.id+'PlotControlMinLabel');
    plotControlWrap.appendChild(plotControlMinLabel)
    document.getElementById(this.id+'PlotControlMinLabel').innerHTML = 'Min: ';
    plotControlMin.setAttribute('id', this.id + 'PlotControlMin');
    plotControlMin.setAttribute('type', 'number');
    plotControlMin.setAttribute('step', 'any');
    plotControlWrap.appendChild(plotControlMin);

    plotControlMaxLabel.setAttribute('id', this.id+'PlotControlMaxLabel');
    plotControlWrap.appendChild(plotControlMaxLabel)    
    document.getElementById(this.id+'PlotControlMaxLabel').innerHTML = 'Max: ';
    plotControlMax.setAttribute('id', this.id + 'PlotControlMax');
    plotControlMax.setAttribute('type', 'number');
    plotControlMax.setAttribute('step', 'any');
    plotControlWrap.appendChild(plotControlMax);

    plotScale.setAttribute('id', this.id+'PlotControlScale');
    plotControlWrap.appendChild(plotScale);

    plotScaleLin.setAttribute('id', this.id+'PlotScaleLin');
    plotScaleLin.setAttribute('value', 'lin');
    plotScale.appendChild(plotScaleLin);
    document.getElementById(this.id+'PlotScaleLin').innerHTML = 'Linear';

    plotScaleLog.setAttribute('id', this.id+'PlotScaleLog');
    plotScaleLog.setAttribute('value', 'log');
    plotScale.appendChild(plotScaleLog);
    document.getElementById(this.id+'PlotScaleLog').innerHTML = 'Log';

    ///////////////////////
    //State variables
    ///////////////////////
    this.currentView = 'Rate';
    this.currentUnit = 'Hz';
    this.displayIndex = 0;  //always start on the first card, guarnateed to exist.
    this.HVcrates = 0;
    detectHVcrates(this.MIDAS, this);
    //cells
    this.cells = {};
    this.summaryDepth = 0;

    ////////////////////////////
    //Drawing parameters
    ////////////////////////////
    this.frameLineWidth = 2;
    this.frameColor = '#000000';//'#999999';
    this.width = width;
    this.height = height;

    ///////////////////////////
    //Scale Parameters
    ///////////////////////////
    this.scale = 'ROOT Rainbow';
    this.min = {};
    this.max = {};
    this.scaleType = {};
    for(i=0; i<this.views.length; i++){
        this.min[this.views[i]] = canHas(localStorage.getItem(name+this.views[i]+'min'), 0);
        this.max[this.views[i]] = canHas(localStorage.getItem(name+this.views[i]+'max'), 3000);
        this.scaleType[this.views[i]] = canHas(localStorage.getItem(name+this.views[i]+'scaleType'), 'lin');
    }

    //if anything was in local storage, communicate this to the UI:
    plotControlMin.value = this.min[this.currentView];
    plotControlMax.value = this.max[this.currentView];
    plotScale.value = this.scaleType[this.currentView];

    ///////////////////////////
    //Tooltip state
    ///////////////////////////
    this.lastTTindex = -1;

    ////////////////////////////
    //Kinetic.js setup
    ////////////////////////////

    //indices for these arrays correspond to the x-card index on display
    this.stage = [];
    this.mainLayer = [];
    this.scaleLayer = [];
    this.tooltipLayer = [];
    this.TTbkg = [];
    this.text = [];

    for(i=0; i<this.viewNames.length; i++){

        //point kinetic at the div and set up the staging and layers:
        this.stage[i] = new Kinetic.Stage({
            container: this.id+this.viewNames[i]+'Draw',
            width: width,
            height: height
        });
        this.mainLayer[i] = new Kinetic.Layer();       //main rendering layer
        this.scaleLayer[i] = new Kinetic.Layer();      //layer for scales / legends
        this.tooltipLayer[i] = new Kinetic.Layer();    //layer for tooltip info

        //tooltip background:
        this.TTbkg[i] = new Kinetic.Rect({
            x:-1000,
            y:-1000,
            width:100,
            height:100,
            fill:'rgba(0,0,0,0.8)',
            stroke: 'rgba(0,0,0,0)',
            listening: false
        });
        this.tooltipLayer[i].add(this.TTbkg[i]);

        //tooltip text:
        this.text[i] = new Kinetic.Text({
            x: -1000,
            y: -1000,
            fontFamily: 'Arial',
            fontSize: 16,
            text: '',
            lineHeight: 1.2,
            fill: '#EEEEEE',
            listening: false
        });
        this.tooltipLayer[i].add(this.text[i]);
    }

    this.errorPattern = new Image();
    this.errorPattern.onload = function(){
        var key;

        for(key in this.cells){
            this.cells[key].setAttr('fillPatternImage', this.errorPattern);
        }

        this.mainLayer[this.displayIndex].draw();
    }.bind(this)
    this.errorPattern.src = 'static/img/static.gif'
    
    //let repopulate know that the detector would like to be updated every loop:
    if(!window.refreshTargets)
        window.refreshTargets = [];
    window.refreshTargets[window.refreshTargets.length] = this;

}

//stick the ODB equipment directory into its local slot:
function fetchODBEquipment(returnObj){
    if(!window.currentData.ODB)
        window.currentData.ODB = {};
    window.currentData.ODB.Equipment = returnObj;
}

//callback for fetching from the scalar service:
function parseRate(data){
    var key, subkey;

    if(!window.currentData.Rate)
        window.currentData.Rate = {};

    for(key in data){
        if (data.hasOwnProperty(key)) {
            for(subkey in data[key]){
                if(data[key].hasOwnProperty(subkey)){
                    window.currentData.Rate[subkey.toUpperCase().slice(0,10)] = data[key][subkey].TRIGREQ;
                }
            }
        }
    }
}

//similar function for the threshold service:
function parseThreshold(data){
    var key;
    if(!window.currentData.Threshold)
        window.currentData.Threshold = {};

    if(data['parameters']['thresholds']){
        for(key in data['parameters']['thresholds']){
            window.currentData.Threshold[key.toUpperCase().slice(0,10)] = data['parameters']['thresholds'][key];
        }        
    }    
}

//function to make a reasonable decision on how many decimal places to show, whether to to use 
//sci. notation on an axis tick mark, where <min> and <max> are the axis minimum and maximum,
//<nTicks> is the number of tickmarks on the axis, and we are returning the label for the <n>th
//tick mark
function generateTickLabel(min, max, nTicks, n){
    var range = max - min,
        smallestPrecision = range / (nTicks-1),
        tickValue = min + (max-min)/(nTicks-1)*n;

    //tickmark needs to be labeled to enough precision to show the difference between subsequent ticks:
    smallestPrecision = Math.floor(Math.log(smallestPrecision) / Math.log(10));


    if(smallestPrecision < 0)
        return tickValue.toFixed(-smallestPrecision)

    tickValue = Math.floor(tickValue/Math.pow(10, smallestPrecision)) * Math.pow(10, smallestPrecision);
    return tickValue+'';

}

//determine how many HV frontends are in the ODB.  Frontends must be named HV-0, HV-1, HV-2....
function detectHVcrates(MIDAS, obj){
    var xmlhttp = new XMLHttpRequest();

    //once this is all dealt with, refresh the display immediately
    xmlhttp.onreadystatechange = function(target){
        var data, nCrates = 0;

        if (this.readyState != 4) return;

        data = JSON.parse(this.responseText.slice(this.responseText.indexOf('{'), this.responseText.lastIndexOf('}')+1 ) )
        
        while(data['HV-'+nCrates])
            nCrates++

        target.HVcrates = nCrates;
    }.bind(xmlhttp, obj)
    //fire async
    xmlhttp.open('GET', MIDAS + '/?cmd=jcopy&odb=/Equipment&encoding=json-nokeys');
    xmlhttp.send();
}
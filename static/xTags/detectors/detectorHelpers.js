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
    ,   sidebarWrap = document.createElement('div')
    ,   plotDeck
    ,   plotCard
    ,   xString
    ,   deckNavigator, deckOption
    ,   width = 0.70*this.offsetWidth
    ,   height = 2*width/3
    ,   i, subdetectorNav, subdetectorNavLabel

    this.name = name;
    //declare default views and units if none pre-defined
    if(!this.views){
        this.views = ['HV', 'Threshold', 'reqRate', 'acptRate'];
        this.viewLabels = ['HV', 'Threshold', 'Trigger Request Rate', 'Trigger Accept Rate'];
    }
    if(!this.units)
        this.units = ['V', 'ADC Units', 'Hz', 'Hz'];

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
        subdetectorNav.setAttribute('class', 'stdin');
        subdetectorNav.setAttribute('type', 'radio');
        subdetectorNav.setAttribute('name', this.id+'Nav');
        subdetectorNav.setAttribute('value', this.views[i]);
        subdetectorNav.onchange = this.trackView.bind(this);
        if(i==3) subdetectorNav.setAttribute('checked', true); //default to rate view
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNav);
        subdetectorNavLabel = document.createElement('label');
        subdetectorNavLabel.setAttribute('id', this.id+'goto'+this.views[i]+'Label');
        subdetectorNavLabel.setAttribute('for', this.id+'goto'+this.views[i]);
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNavLabel);
        document.getElementById(this.id+'goto'+this.views[i]+'Label').innerHTML = this.viewLabels[i];
    }

    //sidebar deck
    sidebarWrap.setAttribute('id', this.id+'sidebarWrap');
    sidebarWrap.setAttribute('class', 'sidebarWrap');
    this.appendChild(sidebarWrap);
    xString = '<x-deck id='+this.id+'SidebarDeck selected-index=1>'
    xString += '<x-card id='+this.id+'HVSideCard class="sidebarCard"><widget-HVcontrol id="HVcontrol" MIDAS='+this.MIDAS+' style="width:calc(100% - 2em)"></widget-HVcontrol></x-card>'
    xString += '<x-card id='+this.id+'RateSideCard class="sidebarCard"><widget-rateBar id="ratesAndThresholds" MIDAS='+this.MIDAS+'></widget-RateBar></x-card>'
    xString += '</x-deck>'
    sidebarWrap.innerHTML = xString;

    //plot deck wrapper:
    deckWrap.setAttribute('id', this.id+'DeckWrap');
    deckWrap.setAttribute('class', 'deckWrap')
    this.appendChild(deckWrap);

    //declaring x-tags from within other x-tags needs special treatment via innerHTML; must build HTML string and set it.
    xString = '<x-deck id="' + this.id + 'Deck" selected-index=0 style="height:'+height+'">';
    for(i=0; i<this.viewNames.length; i++){
        xString += '<x-card id="' + this.id+this.viewNames[i] + 'Card"></x-card>';
    }
    xString += '<x-card id="DAQhistoCard"><div id="DAQspectrum" class="DAQhisto"></div><div id="DAQpulse" class="DAQhisto"></div><div id="DAQtime" class="DAQhisto"></div><div id="DAQwaveform" class="DAQhisto"></div></x-card>'
    xString += '</x-deck>'
    deckWrap.innerHTML = xString;
    this.viewNames.push('Plots')

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
        deckNavigator.setAttribute('class', 'stdin viewSelect');
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
            this.updatePlotParameters(); //keep the scale up to date too
        }.bind(this)

        //plotControlWrap.appendChild(deckNavigator);
        document.getElementById(this.id+'titleWrapper').insertBefore(deckNavigator, document.getElementById(this.id+'title').nextSibling);
    }

    plotControlMinLabel.setAttribute('id', this.id+'PlotControlMinLabel');
    plotControlWrap.appendChild(plotControlMinLabel)
    document.getElementById(this.id+'PlotControlMinLabel').innerHTML = 'Min: ';
    plotControlMin.setAttribute('id', this.id + 'PlotControlMin');
    plotControlMin.setAttribute('type', 'number');
    plotControlMin.setAttribute('step', 'any');
    plotControlMin.setAttribute('class', 'stdin');
    plotControlWrap.appendChild(plotControlMin);

    plotControlMaxLabel.setAttribute('id', this.id+'PlotControlMaxLabel');
    plotControlWrap.appendChild(plotControlMaxLabel)    
    document.getElementById(this.id+'PlotControlMaxLabel').innerHTML = 'Max: ';
    plotControlMax.setAttribute('id', this.id + 'PlotControlMax');
    plotControlMax.setAttribute('type', 'number');
    plotControlMax.setAttribute('step', 'any');
    plotControlMax.setAttribute('class', 'stdin');
    plotControlWrap.appendChild(plotControlMax);

    plotScale.setAttribute('id', this.id+'PlotControlScale');
    plotScale.setAttribute('class', 'stdin');
    plotControlWrap.appendChild(plotScale);

    plotScaleLin.setAttribute('id', this.id+'PlotScaleLin');
    plotScaleLin.setAttribute('value', 'lin');
    plotScale.appendChild(plotScaleLin);
    document.getElementById(this.id+'PlotScaleLin').innerHTML = 'Linear';

    plotScaleLog.setAttribute('id', this.id+'PlotScaleLog');
    plotScaleLog.setAttribute('value', 'log');
    plotScale.appendChild(plotScaleLog);
    document.getElementById(this.id+'PlotScaleLog').innerHTML = 'Log';

    //tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.setAttribute('id', 'tooltip');
    this.appendChild(this.tooltip);

    ///////////////////////
    //State variables
    ///////////////////////
    this.currentView = this.views[this.views.length-1];
    this.currentUnit = this.units[this.units.length-1];
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
    //MSC table construction
    ////////////////////////////
    this.buildHostmap();

    ////////////////////////////
    //Kinetic.js setup
    ////////////////////////////

    //indices for these arrays correspond to the x-card index on display
    this.stage = [];
    this.mainLayer = [];
    this.scaleLayer = [];

    for(i=0; i<this.viewNames.length; i++){

        //point kinetic at the div and set up the staging and layers:
        this.stage[i] = new Kinetic.Stage({
            container: this.id+this.viewNames[i]+'Draw',
            width: width,
            height: height
        });
        this.mainLayer[i] = new Kinetic.Layer();       //main rendering layer
        this.scaleLayer[i] = new Kinetic.Layer();      //layer for scales / legends
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

//and again for HV:
function parseHV(data){
    var i, j, firstTimeFlag = false;

    if(!window.currentData.HV)
        window.currentData.HV = {};

    if(!window.ODBEquipment)
        window.ODBEquipment = {};    

    for(i=0; i<data.length; i++){
        window.ODBEquipment['HV-'+i] = data[i]; //keep the whole blob around for the benefit of the HV sidebar
        for(j=0; j<data[i].Settings.Names.length; j++){
            window.currentData.HV[data[i].Settings.Names[j].toUpperCase().slice(0,10)] = data[i].Variables.Measured[j];
        }
    }
}

//determine how many HV frontends are in the ODB.  Frontends must be named HV-0, HV-1, HV-2....
function detectHVcrates(MIDAS, obj){
    XHR('http://' + MIDAS + '/?cmd=jcopy&odb=/Equipment&encoding=json-nokeys',
        function(target, response){
            var data, nCrates = 0;

            data = JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}')+1 ) )
            
            while(data['HV-'+nCrates])
                nCrates++

            target.HVcrates = nCrates;
            target.acquireHV()
        }.bind(null, obj) );
}
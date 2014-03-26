#Detector Elements

##Inheritance Structure
Each detector subsystem supported by MarkII has its own custom element for one-line deployment on a dashboard page.  
All detectors inherit most of their functionality from the `<detector-template>` object, and only detector-specific functionality is declared on the detector classes themselves; as such, this document focuses on the patterns established in `<detector-template>`, the `initializeSingleViewDetector()` setup function, and the peripheral data these objects expect to have available when building a detector component.

##Web Component Creation - `lifecycle.created`
All custom web components execute a callback upon creation, found in `lifecycle.created` for each detector; this function declares a lot of detector-specific information, so it is left empty in the `<detector-template>` object, to be defined individually for each detector; nevertheless, `lifecycle.created` typically follows a standard pattern which we describe here:

 - Declare `channels[]`, an array of strings corresponding to the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) names of each detector channel to be rendered, **in the order that they will be drawn**.
 - Declare `URLs[]`, an array of strings corresponding to the URLs that will respond with JSONP posts of the data this detector needs to update itself.  These will typically be:
  - `<host>:<port>/<route>?jsonp=parseThreshold`, a JSONP post of threshold data (spec below), wrapped in the `parseThreshold` function.
  - `<host>:<port>/<route>?jsonp=parseRate`, a JSONP post of rate data (spec below), wrapped in the `parseRate` function.
  - `<ODB host>:<port>/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment`, a JSONP packing of this experiment's `/Equipment` directory, wrapped in the `fetchODBEquipment` function (spec below).
 - Run `initializeSingleViewDetector()`, a function that factors out all the generic detector setup steps, spec below. 
 - Declare detector specific drawing parameters and other member variables
 - Set up the Kinetic.js visualization of the detector by calling `this.instantiateCells()` and `this.generateColorScale()` (details below).

###initializeSingleViewDetector()
`initializeSingleViewDetector(name, channels, title, URLs)` is declared in `detectorHelpers.js` and factors out the generic steps of setting up a detector with a single layer of visualization.  Its arguments are as follows:
 - `<name>` (string) - a tag name for this detector, intended for use as a key prefix or other identifying purposes.
 - `<channels>` (array of strings) - the same `channels` array described above.
 - `<title>` (string) - the title to be displayed in the header at the top of the detector visualization
 - `<URLs>` (array of strings) - the same `URLs` array described above.

This function then goes through the following steps, described in greater detail below as required:
 - Ensure the necessary objects are available on the `window.currentData` object, ready to receive data as it comes in.  These are the `currentData.HV`, `.threshold`, and `.rate` objects.
 - Establish the custom element's internal DOM structure.
 - Establish some initial state parameters & other member variables.
 - Establish the Kinetic.js environment.
 - Set up data fetching and routing for this detector.

####Internal DOM Structure
The DOM for any single-view detector looks roughly like this:
```
____________________________________________________________
headline wrapper div
  [h1 Title]
  [radio HV, Threshold, Rate]
____________________________________________________________
Kinetic.js target div




____________________________________________________________
plot control wrapper form
  [plot minimum label & input:number]
  [plot maximum label & input:number]
  [select linear / log scale]
____________________________________________________________
```

####State Variables
 - `this.currentView` ['HV', 'Threhsold', 'Rate'] default: 'Rate' - indicated what information is currently being visualized.
 - `this.currentUnit` ['V', 'ADC Units', 'Hz'] default: 'Hz' - units for current view, correspond by index to `this.currentView`
 - `this.scale` ['ROOT Rainbow'] default: 'ROOT Rainbow' - color scale name for temperature scale. 
 - `this.min = {HV: 0, Threshold: 0, Rate: 0}` - object containing scale minima for respective views
 - `this.max = {HV: 3000, Threshold: 1000, Rate: 10000}` - object containing scale maxima for respective views
 - `this.scaleType = {HV: 'lin', Threshold: 'lin', Rate: 'lin'}` - object containing strings describing scale type for respective views, either 'lin' or 'log'. 
 - `this.lastTTindex` [-2 < integer < `this.channelNames.length`] default: -1 - number indicating the index of `this.channelNames` wherein the name of the last channel that the mouse passed over is found; -1 indicates mouse not pointing at any channels.

####Static Member Variables
 - `this.name` - name prefix for this detector
 - `this.channelNames` - final resting place of the `channels` array passed around above.
 - `this.cells` - Object which will hold pointers to the Kinetic.js cells that make up the detector visualization.
 - `this.frameLineWidth` default: 2 - Line width to use for detector visualization.
 - `this.frameColor` default: '#999999' - Frame color for detector visualization.
 - `this.width` & `.height` - dimensions in pixels of Kinetic's rendering area.

####Kinetic.js Setup
All detectors are drawn in a simple Kinetic.js environment, built and pointed at as follows:
 - `this.stage` (Kinetic.Stage) - the top level wrapper for the Kinetic environment.
 - `this.mainLayer` (Kinetic.Layer) - the Kinetic layer on which the detector is drawn.
 - `this.tooltipLayer` (Kinetic.Layer) - the Kinetic layer on which the tooltip is drawn.

ALl the detector cells in `this.cells` are painted on `this.mainLayer`, as are the elements that compose the plot legend (described below), while the tooltip text (`this.text`) and background (`this.TTbkg`) are painted on `this.tooltipLayer`.

####Data Fetching & Routing
The last step of `initializeSingleViewDetector()` is to populate `window.fetchURL` with all the data URLs passed in to the `<URLs>` parameter; `assembleData()` will then manage the periodic refresh of the data returned by these requests.  Finally, `this` detector is appended to `window.refreshTargets`, so that `repopulate()` will know to take the information gathered by `assembleData()` and put it where this custom element is expecting it on refresh.  More details are in the docs describing `assembleData()`, `repopulate()` and the main event loop. 

##Member Functions
Most of the plumbing for detector components is generic, and inherited as the collection of functions registered on the `methods` member of `<detector-template>`.  These member functions are described qualitatively as follows.

###generateColorScale()
Establishes all the Kinetic.js objects involved in the color scale, and attaches them to `this.mainLayer`.  These are pointed at as follows:
 - `this.colorScale` - Kinetic.Rect for the color gradient rectangle itself.
 - `this.tickLabels[]` - Kinetic.Text objects labeling the tickmarks on the color scale, ordered left to right.
 - `this.scaleTitle` - Kinetic.Text object for the scale title.

Tickmarks are also declared here, but no pointers to them are persisted.

###instantiateCells()
This is the only function reimplemented as a rule for each specific detector.  Its generic pattern is:
 - Populate `this.cells` with Kinetic objects representing each channel, in the same order as `this.channelNames`.
 - Attatch event listeners to the members of `this.cells` for governing the tooltip.
 - Add these Kinetic objects to `this.mainLayer`.
 - Add `this.mainLayer` and `this.tooltipLayer` to `this.stage` once they're all set up.

###moveTooltip()
Moves `this.TTbkg` and `this.text` around to follow the mouse; intended as the callback to the `mousemove` event listener of the Kinetic objects in `this.cells`.

###refreshColorScale()
Refreshes the contents and positions of the Kinetic objects in `this.tickLabels[]` and `this.scaleTitle` as a function of whatever is registered in `this.scaleType`, `.min` and `.max` under the `this.currentView` key.  Intended as part of the `onchange` callback after modifying scale parameters in the plot control form, and for updating after changing the view.

###trackView()
Keeps `this.currentView` and `this.currentUnit` and the values of the inputs in the plot control form up to date with whatever the user has chosen from the view selection radio.

###update()
Function called in the master update loop as part of `repopulate()`; wraps all the updates necessary on this cycle.

###updateCells()
Responsible for repainting all the Kinetic objects in `this.cells[]` as part of the master update loop.  Pattern is as follows:
 - Identify appropriate scale limits for current view and state.

For each cell:
 - Extract the raw value for this cell appropriate for the current view from `window.currentData`.
 - If no data found, assign a value of `0xDEADBEEF`.
 - If data is found and log view is requested, take the log of the raw value.
 - Map the raw value onto [0,1] via the scale limits idetified above.
 - Use this mapped value to choose a color to fill the cell with from the color scale, or fill the cell with a default pattern if no data was found.

###updatePlotParameters()
Update this object and `localStorage` with values entered into the plot control form.  Intended as `onchange` callback to updating this form.

###writeTooltip(i)
Populate tooltip with appropriate text for the channel named at `this.channelNames[i]`, and decide whether or not to show the tooltip.

##Tooltip Infrastructure
The tooltip for detector elements is handled by the event listeners Kineitc exposes on its objects.  The Kinetic object in `this.cells[i]` must have the following event listeners bound as part of `instantiateCells()`:
 - `mouseover` : `this.writeTooltip.bind(this, i)`
 - `mousemove` : `this.moveTooltip.bind(this)`
 - `mouseout` : `this.writeTooltip.bind(this, -1)`

##JSONP Services & Callbacks
All detector components rely on being able to acquire live information about detector thresholds and scalar rates from URLs serving JSONP that obey the spec below.  The `<host>:<port>/<route>?<queryString>` strings for these services are exacty the string elements of `URLs[]` discussed above in the context of `lifecycle.created`.

###Threshold Service
Present detector threshold levels must be reported at `<host>:<port>/<route>?jsonp=parseThreshold` via the following JSONP:

```
parseThreshold({
    parameters: {
        thresholds: {
            <channel code 0> : <threshold 0 in ADC units>,
            <channel code 1> : <threshold 1 in ADC units>,
            ...
        }
    }
})
```

where `<channel code n>` is the 10 character channel code defined in the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature).  Other parallel information may be packed in this object, as long as the structure above is present.

`parseThreshold()` will take the above structure and sort it into `window.currentData.threshold` as:
```
window.currentData.threshold = {
        <channel code 0> : <threshold 0 in ADC units>,
        <channel code 1> : <threshold 1 in ADC units>,
        ...
}
```

###Rate Service
Present detector scalar rates must be reported at `<host>:<port>/<route>?jsonp=parseRate` via the following JSONP:

```
parseRate({
    <key 0>: {
        <channel code 0> : <rate 0 in Hz>,
        <channel code 1> : <rate 1 in Hz>,
        ...
    },

    <key 1>: {
        <channel code 2> : <rate 2 in Hz>,
        <channel code 3> : <rate 3 in Hz>,
        ...
    }
})
```

where `<channel code n>` is the 10 character channel code defined in the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature).  `<key n>` can be any valid key name, and any number of these groups can be declared.

`parseRate()` will take the above structure and sort it into `window.currentData.rate` as:
```
window.currentData.rate = {
        <channel code 0> : <rate 0 in Hz>,
        <channel code 1> : <rate 1 in Hz>,
        <channel code 2> : <rate 2 in Hz>,
        <channel code 3> : <rate 3 in Hz>,
        ...
}
```


##HV Data Acquisition
Various MarkII components acquire HV data from the Midas ODB via a JSONP fetch of the form `<ODB host>:<port>/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment`, included in the same `URLs[]` list as discussed above.  The `fetchODBEquipment()` callback takes the JSON representation of the `/Equipment` directory of the ODB returned by the request, and sticks it unmodified on `window.currentData.ODB.Equipment`.

The appropriate ODB structure is generated under `/Equipment` automatically by [this MIDAS HV frontend](https://github.com/BillMills/MIDASfrontends/tree/master/CAENHV).  Currently only CAEN HV cards are supported for this purpose, but any JSONP fetch massaged to populate the same variables on `window.currentData` could be substituted to report voltages from arbitrary sources.

##localStorage Structure
Detector components make use of `localStorage` to persist some per-user information about their state.  The structure built and read from is as follows:

```
localStorage = {
    <this.name>HVmin : <minimum for HV scale for this detector>,
    <this.name>Thresholdmin : <minimum for threshold scale for this detector>,
    <this.name>Ratemin : <minimum for rate scale for this detector>,
    
    <this.name>HVmax : <maximum for HV scale for this detector>,
    <this.name>Thresholdmax : <maximum for threshold scale for this detector>,
    <this.name>Ratemax : <maximum for rate scale for this detector>,

    <this.name>HVscaleType : <lin/log for HV scale for this detector>,
    <this.name>ThresholdscaleType : <lin/log for threshold scale for this detector>,
    <this.name>RatescaleType : <lin/log for rate scale for this detector> 
}
```







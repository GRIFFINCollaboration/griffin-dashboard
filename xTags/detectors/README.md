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
 - `this.max = {HV: x, Threshold: y, Rate: z}` - object containing scale maxima for respective views
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

ALl the detector cells in `this.cells` are painted on `this.mainLayer`, while the tooltip text (`this.text`) and background (`this.TTbkg`) are painted on `this.tooltipLayer`.

####Data Fetching & Routing
The last step of `initializeSingleViewDetector()` is to populate `window.fetchURL` with all the data URLs passed in to the `<URLs>` parameter; `assembleData()` will then manage the periodic refresh of the data returned by these requests.  Finally, `this` detector is appended to `window.refreshTargets`, so that `repopulate()` will know to take the information gathered by `assembleData()` and put it where this custom element is expecting it on refresh.  More details are in the docs describing `assembleData()`, `repopulate()` and the main event loop. 

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

##localStorage Structure








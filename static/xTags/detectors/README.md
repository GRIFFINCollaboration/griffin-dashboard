#Detector Elements

Each detector subsystem supported by MarkII has its own custom element for one-line deployment on a dashboard page.  
All detectors inherit most of their functionality from the `<detector-template>` object, and only detector-specific functionality is declared on the detector classes themselves; as such, this document focuses on the patterns established in `<detector-template>`, the `initializeDetector()` setup function, and the peripheral data these objects expect to have available when building a detector component.

####Contents
 - [Creation & Instantiation](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#web-component-creation---lifecyclecreated)
 - [Participation in the Main Event Loop](https://github.com/BillMills/griffinMarkII/blob/master/xTags/detectors/README.md#detectors-in-the-main-event-loop)
 - [Member Functions](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#member-functions)
 - [Tooltip Infrastructure](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#tooltip-infrastructure)
 - [JSONP Services & Callbacks](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#jsonp-services--callbacks)
 - [HV Data Acquisition](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#hv-data-acquisition)
 - [localStorage structure](https://github.com/BillMills/griffinMarkII/tree/master/xTags/detectors#localstorage-structure)

##Web Component Creation - `lifecycle.created`
All custom web components execute a callback upon creation, found in `lifecycle.created` for each detector; this function declares a lot of detector-specific information, so it is left empty in the `<detector-template>` object, to be defined individually for each detector; nevertheless, `lifecycle.created` typically follows a standard pattern which we describe here:

 - Declare `this.channelNames[i]`, an array of strings corresponding to the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) names of each detector channel to be rendered, **in the order that they will be drawn**.  May also include strings describing summary cells; valid summary names are prefixes of the individual detector elements they will summarize.  For example, `TIS01G` would summarize the BGO channels `TIS01GN01X`, `TIS01GN02X`, `TIS01GN03X`, `TIS01GN04X`, and `TIS01GN05X`.  
 - Declare `this.viewNames[view]`, an array of strings naming each view you want for this detector; a single view detector like the TIP wall only needs one view, while TIGRESS and GRIFFIN use 17 views - one for each clover plus a summary.
 - Run `initializeDetector()`, a function that factors out all the generic detector setup steps, spec below. 
 - Declare detector specific drawing parameters and other member variables
 - Set up the Kinetic.js visualization of the detector by calling `this.instantiateCells()` and `this.generateColorScale()` (details below).

###initializeDetector()
`initializeDetector(name, title)` is declared in `detectorHelpers.js` and factors out the generic steps of setting up a detector.  Its arguments are as follows:
 - `<name>` (string) - a tag name for this detector, intended for use as a key prefix or other identifying purposes.
 - `<title>` (string) - the title to be displayed in the header at the top of the detector visualization

This function then goes through the following steps, described in greater detail below as required:
 - Ensure the necessary objects are available on the `window.currentData` object, ready to receive data as it comes in.  These are the `currentData.HV`, `.threshold`, and `.rate` objects.
 - Establish the custom element's internal DOM structure.
 - Establish some initial state parameters & other member variables.
 - Establish the Kinetic.js environment.
 - Add this detector to `window.refreshTargets` to have it updated in the main event loop.

####Internal DOM Structure
The DOM looks roughly like this:
```
_________________________________________________________________________________________
|headline wrapper div                                        |x-deck for sidebars       |
|  [h1 Title]                                                |  x-card for HV control   |
|  [radio HV, Threshold, Rate]                               |    widget-HVcontrol      |
|____________________________________________________________|  x-card for rate sidebar |
|Brick.js x-deck to shuffle through views                    |    widget-rateBar        |
|  Brick.js x-cards, one for each view                       |                          |
|    Kinetic.js drawing context, one in each x-card          |                          |
|                                                            |                          |
|                                                            |                          |
|                                                            |                          |
|                                                            |                          |
|____________________________________________________________|__________________________|
|plot control wrapper form                                                              | 
|  View selector widget                                                                 |
|  [plot minimum label & input:number]                                                  |
|  [plot maximum label & input:number]                                                  |
|  [select linear / log scale]                                                          |
|_______________________________________________________________________________________|
```

####State Variables
 - `this.currentView` ['HV', 'Threhsold', 'Rate'] default: 'Rate' - indicated what information is currently being visualized.
 - `this.currentUnit` ['V', 'ADC Units', 'Hz'] default: 'Hz' - units for current view, correspond by index to `this.currentView`
 - `this.displayIndex` default: 0 - `x-card` index for the currently displayed card.
 - `this.scale` ['ROOT Rainbow'] default: 'ROOT Rainbow' - color scale name for temperature scale. 
 - `this.min = {HV: 0, Threshold: 0, Rate: 0}` - object containing scale minima for respective views
 - `this.max = {HV: 3000, Threshold: 1000, Rate: 10000}` - object containing scale maxima for respective views
 - `this.scaleType = {HV: 'lin', Threshold: 'lin', Rate: 'lin'}` - object containing strings describing scale type for respective views, either 'lin' or 'log'. 
 - `this.lastTTindex` [-2 < integer < `this.channelNames.length`] default: -1 - number indicating the index of `this.channelNames` wherein the name of the last channel that the mouse passed over is found; -1 indicates mouse not pointing at any channels.

####Static Member Variables
 - `this.name` - name prefix for this detector
 - `this.cells` - Object which will hold pointers to the Kinetic.js cells that make up the detector visualization.
 - `this.frameLineWidth` default: 2 - Line width to use for detector visualization.
 - `this.frameColor` default: '#999999' - Frame color for detector visualization.
 - `this.width` & `.height` - dimensions in pixels of Kinetic's rendering area.
 - `this.summaryDepth` default: 0 - number of characters in the summary cell keys for this detector (ie roughly corresponds to granularity of summary, since summary cell key names prefix the detector keys they summarize).  Note values > 9 will be ignored (since a 10 character prefix will only ever include at most one detector element, and so isn't really a summary).
 - `this.HVcrates` default: 0 - number of HV crates plugged into this experiment.  The helper function `detectHVcrates` is run immediately to autodetect an appropriate value from the ODB.

####Kinetic.js Setup
All detectors are drawn in a simple Kinetic.js environment, built and pointed at as follows; array indices correspond to the current view, to which each sensitive element should belong to exactly one.
 - `this.stage[view]` (Kinetic.Stage) - the top level wrappers for the Kinetic environments.
 - `this.mainLayer[view]` (Kinetic.Layer) - the Kinetic layers on which the detectors are drawn.
 - `this.scaleLayer[view]` (Kinetic.Layer) - the Kinetic layers on which scales and legends are drawn.
 - `this.tooltipLayer[view]` (Kinetic.Layer) - the Kinetic layers on which the tooltips are drawn.
 - `this.TTbkg[view]` (Kinetic.Rect) - backgrounds for tooltips
 - `this.text[view]` (Kinetic.Text) - tooltip texts


and possibly

 - `this.HVlayer[view]` (Kinetic.Layer) - Kinetic layers for special HV segmentation.

All the detector cells in `this.cells[name]` are painted on the appropriate `this.mainLayer[view]`, while the elements that compose the plot legend (described below) are painted on `this.scaleLayer[view]`, and the tooltip text (`this.text[view]`) and background (`this.TTbkg[view]`) are painted on `this.tooltipLayer[view]`.  If a detector segments its HV connections differently than its rate & threshold connections, then the cell names corresponding the HV channels will have their corresponding cells drawn on `this.HVlayer[view]` instead of `this.mainLayer[view]`.

####Data Fetching & Routing
The last step of `initializeDetector()` is to appended `this` detector to `window.refreshTargets`, so that `repopulate()` will know to update this object every period.  More details are in the docs describing `assembleData()`, `repopulate()` and the main event loop. 

##Detectors in the Main Event Loop
As with all updatable objects, detector components participate in the main event loop via their `update()` method as called by `repopulate()`.  The basic flow is as follows:

 - `update()`
   - Request new data from external sources
   - Make sure scale control is up to date
   - generate data summaries for detectors that have summary levels
   - `updateCells()` - refreshes and repaints all the detector cells based on info in `window.currentData` and state variables.
   - `writeTooltip(this.lastTTindex)` - refresh the tooltip text, necessary if mouse is sitting passively on a channel.
   - repaint the currently displayed `this.mainLayer[view]`.

##Member Functions
Most of the plumbing for detector components is generic, and inherited as the collection of functions registered on the `methods` member of `<detector-template>`.  These member functions are described qualitatively as follows.

###generateColorScale()
Establishes all the Kinetic.js objects involved in the color scale, and attaches them to `this.scaleLayer[view]`.  These are pointed at as follows:
 - `this.colorScale[view]` - Kinetic.Rect for the color gradient rectangle itself.
 - `this.tickLabels[view][tick]` - Kinetic.Text objects labeling the tickmarks on the color scale, ordered left to right.
 - `this.scaleTitle[view]` - Kinetic.Text object for the scale title.

Tickmarks are also declared here, but no pointers to them are persisted.

###inCurrentView(channelName)
This is one of the two functions reimplemented as a rule for each specific detector.  It takes the 10 character `channelName` of a detector element as an argument, and returns an integer corresponding to the view index that detector element is drawn in.

###instantiateCells()
This is one of two function reimplemented as a rule for each specific detector.  Its generic pattern is:
 - Populate `this.cells` with Kinetic objects representing each channel, in the same order as `this.channelNames`.
 - Attatch event listeners to the members of `this.cells` for governing the tooltip.
 - Add these Kinetic objects to the appropriate `this.mainLayer[view]`.
 - Add `this.mainLayer[view]` and `this.tooltipLayer[view]` to `this.stage[view]` once they're all set up.

###moveTooltip()
Moves `this.TTbkg` and `this.text` around to follow the mouse; intended as the callback to the `mousemove` event listener of the Kinetic objects in `this.cells`.

###refreshColorScale()
Refreshes the contents and positions of the Kinetic objects in `this.tickLabels[view][tick]` and `this.scaleTitle[view]` as a function of whatever is registered in `this.scaleType`, `.min` and `.max` under the `this.currentView` key.  Intended as part of the `onchange` callback after modifying scale parameters in the plot control form, and for updating after changing the view.

###summarizeData()
Called by `this.update()` iff `this.summaryDepth` is truthy.  Constructs the average rate, threshold and HV for the summary cells declared in `this.channelNames[]` iff the summary cell key's length equals `this.summaryDepth`.  Averages are stored alongside raw channel values in `window.currentData[HV/threshold/rate][summaryKey]` for parsing by the same logic as the individual cells.  Note that if any individual detector is supposed to contribute to this average and fails to report, the whole summary cell will be marked as failing to report.

###trackView()
Keeps `this.currentView` and `this.currentUnit` and the values of the inputs in the plot control form up to date with whatever the user has chosen from the view selection radio.  Also shows and hides `mainLayer` and `HVlayer` as necessary, for detectors with different segmentation for HV than they have for rates & thresholds. 

###update()
Function called in the master update loop as part of `repopulate()`; wraps all the updates necessary on this cycle.

###updateCells()
Responsible for repainting all the Kinetic objects in `this.cells[name]` as part of the master update loop.  Pattern is as follows:
 - Identify appropriate scale limits for current view and state.

For each cell:
 - Extract the raw value for this cell appropriate for the current view from `window.currentData`.
 - If no data found, assign a value of `0xDEADBEEF`.
 - If data is found and log view is requested, take the log of the raw value.
 - Map the raw value onto [0,1] via the scale limits idetified above.
 - Use this mapped value to choose a color to fill the cell with from the color scale, or fill the cell with a default pattern if no data was found.

###updatePlotParameters()
Update this object and `localStorage` with values entered into the plot control form.  Intended as `onchange` callback to updating this form.

###vetoSummary(view, channel)
Called by `summarizeData` to check if the given channel should indeed be included in the summary for the given view.  By default this function always returns `false`, since it is only required for detectors whose HV and rate segmentation differ (HV channels don't report rates and vice versa in this case).  Detectors which require summary vetoing redefine this member as necessary. 

###writeTooltip(i)
Populate tooltip with appropriate text for the channel named at `this.channelNames[i]`, and decide whether or not to show the tooltip.  The default implementation is appropriate for a detector that has identical segmentation between all its views (ie each counting segment has one rate, one threshold and one HV supply).  Detectors with asymmetric segmentation need special tooltips appropriate to their needs to replace `writeTooltip(i)` in the prototype chain.

##Tooltip Infrastructure
The tooltip for detector elements is handled by the event listeners Kineitc exposes on its objects.  The Kinetic object in `this.cells[i]` must have the following event listeners bound as part of `instantiateCells()`:
 - `mouseover` : `this.writeTooltip.bind(this, i)`
 - `mousemove` : `this.moveTooltip.bind(this)`
 - `mouseout` : `this.writeTooltip.bind(this, -1)`

##JSON Services & Callbacks
All detector components rely on being able to acquire live information about detector thresholds and scalar rates from URLs serving JSON that obey the spec below.  The `<host>:<port>/<route>?<queryString>` strings for these services are exacty the string elements of `URLs[i]` discussed above in the context of `lifecycle.created`.

###Threshold Service
Present detector threshold levels must be reported at `<host>:<port>/<route>` via the following JSON:

```
{
    parameters: {
        thresholds: {
            <channel code 0> : <threshold 0 in ADC units>,
            <channel code 1> : <threshold 1 in ADC units>,
            ...
        }
    }
}
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
Present detector scalar rates must be reported at `<host>:<port>/<route>` via the following JSON:

```
{
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
}
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

###HV Service
Present detector HV is scraped from the `Equipment/HV-*` directories of the ODB being served at `this.MIDAS`.  The correct format for these directories is generated automatically by [this MIDAS HV frontend](https://github.com/GRIFFINCollaboration/MIDASfrontends); the only setup requirements are that HV frontends be consecutively named `HV-0`, `HV-1`..., and HV channel names as registered on the crate must use the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature).

`parseHV()` will take the above structure and sort it into `window.currentData.HV` as:
```
window.currentData.HV = {
        <channel code 0> : <voltage 0 in V>,
        <channel code 1> : <voltage 1 in V>,
        <channel code 2> : <voltage 2 in V>,
        <channel code 3> : <voltage 3 in V>,
        ...
}
```

where the voltages are taken from `Equipment/HV-*/Variables/Measured`.

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

#Detector Elements

##Inheritance Structure
Each detector subsystem supported by MarkII has its own custom element for one-line deployment on a dashboard page.  
All detectors inherit most of their functionality from the `<detector-template>` object, and only detector-specific functionality is declared on the detector classes themselves; as such, this document focuses on the patterns established in `<detector-template>`, the `initializeSingleViewDetector()` setup function, and the peripheral data these objects expect to have available when building a detector component.

##Web Component Creation - `lifecycle.created`
All custom web components execute a callback upon creation, found in `lifecycle.created` for each detector; this function declares a lot of detector-specific information, so it is left empty in the `<detector-template>` object, to be defined individually for each detector; nevertheless, `lifecycle.created` typically follows a standard pattern which we describe here:

 - Declare `channels[]`, an array of strings corresponding to the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) names of each detector channel to be rendered, **in the order that they will be drawn**.
 - Declare `URLs[]`, an array of strings corresponding to the URLs that will respond with JSONP posts of the data this detector needs to update itself.  These will typically be:
  - `<host>:<port>/<path>?jsonp=parseThreshold`, a JSONP post of threshold data (spec below), wrapped in the `parseThreshold` function.
  - `<host>:<port>/<path>?jsonp=parseRate`, a JSONP post of rate data (spec below), wrapped in the `parseRate` function.
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
 - Ensure the necessary objects are available on the `window.currentData` object, ready to recieve data as it comes in.  These are the `currentData.HV`, `.threshold`, and `.rate` objects.
 - Establish the custom element's internal DOM structure.
 - Establish some initial state parameters.
 - Establish the Kinetic.js environment
 - Set up data fetching and routing for this detector.


##JSONP Services & Callbacks








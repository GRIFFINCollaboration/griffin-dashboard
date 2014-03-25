#Detector Elements

##Inheritance Structure
Each detector subsystem supported by MarkII has its own custom element for one-line deployment on a dashboard page.  
All detectors inherit most of their functionality from the `<detector-template>` object, and only detector-specific functionality is declared on the detector classes themselves; as such, this document focuses on the patterns established in `<detector-template>`, the `initializeSingleViewDetector()` setup function, and the peripheral data these objects expect to have available when building a detector component.

##Web Component Creation - `lifecycle.created`
All custom web components execute a callback upon creation, found in `lifecycle.created` for each detector; this function declares a lot of detector-specific information, so it is left empty in the `<detector-template>` object, to be defined individually for each detector; nevertheless, `lifecycle.created` typically follows a standard pattern which we describe here:

 - Declare `channels[]`, an array of strings corresponding to the [Greg Standard Mneumonic](http://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) names of each detector channel to be rendered, **in the order that they will be drawn**.
 - Declare `URLs[]`, and array of strings corresponding to the URLs that will respond with JSONP posts of the data this detector needs to update itself.  These will typically be:
  - `<host>:<port>/<path>?jsonp=parseThreshold`, a JSONP post of threshold data (spec below), wrapped in the `parseThreshold` function.
  - `<host>:<port>/<path>?jsonp=parseRate`, a JSONP post of rate data (spec below), wrapped in the `parseRate` function.
  - `<ODB host>:<port>/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment`, a JSONP packing of this experiment's `/Equipment` directory, wrapped in the `fetchODBEquipment` function (spec below).




##JSONP Services & Callbacks








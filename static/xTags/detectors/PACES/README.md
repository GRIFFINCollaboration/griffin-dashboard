###PACES

`<detector-PACES>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  It is the simplest example of a detector with a split rate / HV view, since the same HV channel feeds both segments in a SiLi crystal; as such, it overwrites the standard `writeTooltip` functionality with its own.

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `rateServer`: full URL of JSONP post of scalar rate information for the PACES.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for the PACES.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

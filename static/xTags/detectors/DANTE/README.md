###DANTE

`<detector-DANTE>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  In addition, DANTE has a secondary TAC data stream, with its own TAC-Rate and TAC-Threshold views in addition to the usual rates and thresholds.

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `rateServer`: full URL of JSONP post of scalar rate information for DANTE.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for DANTE.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

###TIGRESS

`<detector-TIGRESS>` inherits all the standard functionality from `xDetectorTemplate` and `setupSingleViewDetector`.  It supports 17 views, one for each clover and one summary view.

####Attributes

 - `rateServer`: full URL of JSONP post of scalar rate information for the TIP Wall.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for the TIP Wall.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

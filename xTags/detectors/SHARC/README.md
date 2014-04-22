###SHARC

`<detector-SHARC>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.

####Attributes

 - `rateServer`: full URL of JSONP post of scalar rate information for SHARC.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for SHARC.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

###SHARC

`<detector-SHARC>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  It supports 17 views, one summary and one each for the 8 QQQ quadrants on either end of SHARC, and the 8 BB sections on the sides.

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `rateServer`: full URL of JSONP post of scalar rate information for SHARC.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for SHARC.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

###GRIFFIN

`<detector-GRIFFIN>` inherits some of the standard functionality from `xDetectorTemplate` and `setupDetector`.  It supports 17 views, one for each clover and one summary view.  The following common methods are reimplemented for GRIFFIN:

 - `inCurrentView` sorts channels between the 17 views mentioned above
 - `clickCell` transitions from summary -> detail views, or when on detailed view, populates sidebar with appropriate widget.
 - `vetoSummary` distinguishes between HV and rate segments for control of the sumarization process in `summarizeData()`
 - `writeTooltip` is re-defined for GRIFFIN so that HV and rate cells cross-post to each other's tooltips in a reasonable manner, accounting for their asymmetric segmentation.
  
GRIFFIN also has some unique members:
 - `isHV(cellName)` determines if the given cell is an HV segment.



####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `rateServer`: full URL of JSONP post of scalar rate information for GRIFFIN.  JSON should be wrapped in a `parseRate(data)` function at this URL.
 - `thresholdServer`: full URL of JSONP post of threshold information for the GRIFFIN.  JSON should be wrapped in a `parseThreshold(data)` function at this URL.

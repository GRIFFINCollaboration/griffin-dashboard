###GRIFFIN

`<detector-GRIFFIN>` inherits some of the standard functionality from `xDetectorTemplate` and `setupDetector`.  It supports 17 views, one for each clover and one summary view.  The following common methods are reimplemented for GRIFFIN:

 - `inCurrentView` sorts channels between the 17 views mentioned above
 - `clickCell` transitions from summary -> detail views, or when on detailed view, populates sidebar with appropriate widget.
 - `vetoSummary` distinguishes between HV and rate segments for control of the sumarization process in `summarizeData()`
 - `writeTooltip` is re-defined for GRIFFIN so that HV and rate cells cross-post to each other's tooltips in a reasonable manner, accounting for their asymmetric segmentation.
 - `isHV(cellName)` and `isRate(cellName)`, for identifying HV and rate cells.



####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.

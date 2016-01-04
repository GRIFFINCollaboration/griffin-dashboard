###DANTE

`<detector-DANTE>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  Unique to DANTE is that it can be deployed in either TAC or PMT mode, via its `readout` attribute.

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `readout`: either `Energy` or `TAC`, chooses which mode to visualize.

###SPICE

`<detector-SPICE>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  It includes a view for SPICE itself, and an optional S3 auxiliary

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.
 - `auxiliary`: `S3`; auxiliary detector upstream of the target in the chamber; currently only S3 supported.

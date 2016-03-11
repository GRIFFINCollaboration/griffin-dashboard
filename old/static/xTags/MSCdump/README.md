#MSC Dump
`<widget-MSC>` is a very simple element built to list the canonical configuration DAQ channels.  **These tables are built from the same functions that automatically generate the `/DAQ/MSC` table in the ODB**, and therefore represent the last word on how these channels should be configured; if the canonical configuration changes, make sure to update the generating functions in `static/utilities/canonicaMSC.js`.

###Attributes
 - `MSC` JSON stringification of an array `[[names], [MSC]]`, where `[names]` contains the 10 character detector names, and `[MSC]` contains the corresponding MSC numbers.
###PACES

`<detector-PACES>` inherits all the standard functionality from `xDetectorTemplate` and `setupDetector`.  It is the simplest example of a detector with a split rate / HV view, since the same HV channel feeds both segments in a SiLi crystal; as such, it overwrites the standard `writeTooltip` functionality with its own, and uses its own `vetoSummary` to decide which cells to exclude from which summaries.

####Attributes
 - `MIDAS`: host:port of the MIDAS experiment the HV frontends for this detector are living at.

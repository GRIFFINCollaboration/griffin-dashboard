#widget-rateBar

`<widget-rateBar>` provides a write interface to the GRIF16 digitizers listed in the ODB's `/DAQ/hosts` table.  The element requires no attributes.

##Setup
`<widget-rateBar>` assumes the ODB's `/DAQ` directory is present in object form on `window.currentData.DAQ`.

##Usage
`<widget-rateBar>` is populated by a single custom event listener, `postADC`, which expects an `event.detail` as the following object:
```
{'channel' : cellName}
```
where `cellName` is the 10-character [standard nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) string for a single detector element.

Upon receipt of this event, the element will populate all its form fields with the current values of the ADC channel determined to correspond to `cellName`, and expose that channel for writing.

##Parameters

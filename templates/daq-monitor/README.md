DAQ Monitor
===========

The DAQ Monitor provides real-time summaries of trigger request and accept rates at each level of the DAQ: master, collectors, digitizers, as well as summaries of the same for individual detection systems.

## Maintenance Requirements

### ODB Structures

The DAQ (and many other pages) requires the following ODB structure to exist and be correctly populated:

```
/DAQ
|
|___/hosts
    |__________/collector0x0
               |______________host (string)
               |______________digitizers (array of 16 strings)
    .
    .
    .
    |__________/collector0xF
    |__________master (string)
|___/params
    |__________/grif16
               |______________/template
                              |____________/0
                              .
                              .
                              .
                              |____________/9
               |______________/custom
|___/MSC
    |__________MSC (array short)
    |__________chan (array string)
```

 - **/DAQ/hosts/collector0x?**: one such directory for each collector, where `?` is the master channel that collector is plugged in on (nominally `0` through `F`).
 - **/DAQ/hosts/master**: host of master, ex `foo.triumf.ca`.
 - **/DAQ/hosts/collector0x?/host**: host of this collector, ex `bar.triumf.ca`.
 - **/DAQ/hosts/collector0x?/digitizers**: array of hosts of each digitizer, where array index corresponds to collector channel.
 - **/DAQ/params**: template and custom parameters for ADC channels; all entries below those listed above not explicitly required (will be defined on the fly by the Dashboard or ADCs). See the [ADC docs](https://github.com/BillMills/griffin-dashboard/blob/gh-pages/templates/detectors/adc-sidebar/README.md) for further discussion on how to use this structure.
 - **/DAQ/MSC/MSC**: Array of MSC addresses `0xMSCC`, where `M` == master channel, `S` == collector channel, `CC` == digitizer channel
 - **/DAQ/MSC/chan**: Array of [10-character channel names](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) in the same order as `/DAQ/MSC/MSC`.

### APIs

The DAQ page polls trigger request and accept rates from the digitizers at the bottom of DAQ hierarchy, via the high-rate API [described here](https://github.com/BillMills/griffin-dashboard/blob/gh-pages/templates/detectors/adc-sidebar/README.md).

## Developer Notes

After polling the digitizers, the DAQ page sums trigger request and accept rates per collector, per detector, and overall for a grand total at master. A couple of notes:

 - All information is read from the digitizers at the bottom of the DAQ hierarchy; it may be worthwhile to also poll collectors and masters directly for sanity checking etc.
 - Detectors to summarize in the 'Detectors' historgram are inferred from the channel names found in the MSC table at `/DAQ/MSC/chan` in the ODB.









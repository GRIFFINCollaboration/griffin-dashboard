Detector Monitors
==================

The Dashboard provides skeuomorphic representations of all detectors involved in the current experiment, to visualize their HV, ADC thresholds, and requested and accepted trigger rates, as well as expose controls for many HV and ADC parameters.

## Maintenance Requirements

#### ODB Structures

 - `/DAQ` directory, as outlined in the [DAQ docs](https://github.com/BillMills/griffin-dashboard/tree/gh-pages/templates/daq-monitor#odb-structures).
 - '/Equipment/HV-*' directories, as outlined in the [HV docs](https://github.com/BillMills/griffin-dashboard/tree/gh-pages/templates/hv-monitor#odb-structures).

#### External APIs

 - **ADC API**, as outlined in the [ADC docs](https://github.com/BillMills/griffin-dashboard/blob/gh-pages/templates/detectors/adc-sidebar/README.md).

## Programmatic Logic

All detectors make heavy use of shared resources, and follow the same patterns for setup and data updates. A few tips to get you started making sense of these:

 - SCEPTAR is probably the simplest example. Following along with `sceptar.html` will illustrate the basic flow:
   - `setupRequests()` finds the ODB DAQ directory, uses it to decide which ADCs to query, and also sets up polling of the ODB Equipment directory.
   - After templates are loaded, `deployDetector` orchestrates setup and initialization; see subsidiary functions for details.
   - Every heartbeat, the run status sidebar is updated [see run status docs](https://github.com/BillMills/griffin-dashboard/blob/gh-pages/templates/detectors/run-status/README.md), the high-rate endpoint of the ADC API is polled, the settings endpoint of the ADC API is polled if there's an ADC channel displayed on the right sidebar, and the ODB equipment directory is pulled in for the HV.

A couple of novel modifications for other pages:
 - DANTE uses a URL query string to decide if it should be displaying energy or time information; see `dataStore.detector.channelType` in `dante.html` for where this decision is made.
 - Some detectors do not have a 1:1 correspondence between HV channels and ADC channels; PACES is the simplest example of this. Detectors (or summaries, as in GRIFFIN) that *do* have a 1:1 correspondence are always drawn in the first view (as listed in `dataStore.detector.views` by `parameterizeDetector()` for each detector, and declared in `setupDetector()`); detectors with this asymmetry are always drawn in subsequent views, for simplicity.
 - Detectors with a large number of channels (like GRIFFIN) get a summary view that displays rate sums for groups of cells. Summary cells are treated exactly the same as regular cells, but are identified by being labeled only by the first few characters of the standard name of their constituents; for example, the summary cell `GRG01B` represents the combination of `GRG01BN00A` and `GRG01BN00B`.
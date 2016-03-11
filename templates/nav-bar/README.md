Nav Bar
=======

The nav bar provides simple links to other Dashboard pages, as well as autodetection of which detectors are present.

## Maintenance Requirements

### ODB Structures

The nav bar infers what detectors to provide a link to from the contents of the ODB's `/DAQ/MSC/chan` array of detector channels. As such, the nav bar relies on the presence of the `/DAQ` ODB structure, described [here](https://github.com/GRIFFINCollaboration/griffin-dashboard/blob/gh-pages/templates/daq-monitor/README.md).
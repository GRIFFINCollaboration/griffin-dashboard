#Navigation

`<widget-navigation>` deploys links to all monitoring pages, and parses the MSC table in the ODB to decide which detectors to link to.

##Attributes

 - `MIDAS`: the `host`:`port` serving MIDAS' web interface, with no extra window-dressing, ie `awesomecomp.triumf.ca:1337`
 - `SOH`: as `MIDAS`, but for the state of health's dashboard.

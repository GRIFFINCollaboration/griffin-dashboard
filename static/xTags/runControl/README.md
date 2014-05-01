###Status Widget

`<widget-status>` provides:
 - Run control
 - Top level run summary (start/stop time, run number, experiment name, uptime)
 - Most recent 5 messages from the message service.

####Attributes
 - `MIDAS`: the host:port for the MIDAS experiment to point run control at.


####Data Acquisition & Run Control
`<widget-status>` takes advantage of the [commands](https://midas.triumf.ca/MidasWiki/index.php/AJAX) exposed by MIDAS for accessing the ODB and manipulating runs.

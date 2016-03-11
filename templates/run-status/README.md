Run Status
==========

The run status bar provides top-level information about the status of the current experiment as well as run start / stop controls, similar to MIDAS's status page.

## Maintenance Requirements

### ODB Structures

The run status bar relies on the standard ODB `/Experiment`, `/Runinfo`, `/Equipment/Trigger/Statistics`, and `/Logger` directories, updated every heartbeat. These don't require any special configuration beyond MIDAS defaults; a request to fetch and unpack them every heartbeat is found on `dataStore.runSummaryQuery`.
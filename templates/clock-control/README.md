Clock Control
=============

The Dashboard's clock page reports statistics on GRIFFIN's 25 clock modules, and exposes some basic controls for the same.

## Maintenance Requirements

### Frontend & ODB Structures

The clock modules interact with the ODB via [the clock frontend found here](https://github.com/GRIFFINCollaboration/MIDASfrontends); the Dashboard will identify clocks from ODB directories labeled `Equipment/GRIF-Clk*`, which runs from `GRIF-Clk0` through `GRIF-Clk24`. The frontend repository linked above has detailed instructions on configuration and setup which will satisfy the Dashboard's requirements.

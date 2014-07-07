#GRIFFIN Clocks

GRIFFIN utilizes up to 25 Chip Scale Atomic Clocks (CSACs) to maintain precise timing throughout the experiment.  Here we provide two custom elements: `<widget-clock>` for visualizing the gross configuration state of each clock, and `<widget-clockControl>`, a sidebar element for finer grained monitoring and control of clock parameters via their MSCB interface to the ODB.

Descriptions of the readable and writable parameters exposed by each clock can be found on [this wiki page](https://www.triumf.info/wiki/tigwiki/index.php/GRIF-Clk)

The clock custom elements rely on the ODB information and control functionality provided by the GRIFClk custom MIDAS frontend found in [this package](https://github.com/GRIFFINCollaboration/MIDASfrontends).  One of these frontends needs be deployed for each CSAC.

##Default Behavior
Rather than independently, GRIFFIN's CSACs operate in a hierarchical manner, with one master clock (nominally GRIFClk-0 at mscb570) providing a central heartbeat to the other 24 clocks.  As a result, there are a few points of usage and default behavior that reflect this structure:
 - only one clock should be switched to Master at a time; this condition is not enforced locally, but ought to be monitored by an ODB alarm.
 - The master clock has by default:
   - LEMO Sync source
   - Atomic clock chosen for reference clock
   - None of its 8 output channels bypassed
 - The slave clocks have by default:
   - eSATA clock source and sync source
   - all channles bypassed (ie master signal passed through without stepdown).

The approporiate defaults described above are set automatically when a clock enters master or slave mode, but can be manually overridden from the `<widget-clockControl>` sidebar if need be.

##`<widget-clock>`
This custom element provides a simple illustration of which clocks have frontends deployed, what their network name is and what their current configuration state is; clicking on a clock in this element also populates the sidebar with finer-grained control and information.

###Member Variables
 - `this.currentClockIndex`: int 0-24, keeps track of which clock is currently on display in the sidebar.
 - `this.clockForm`: array of 25 `<form>` elements corresponding to the clocks.
 - `this.clockAddress`: array of 25 `<h4>` banners for reporting the network name of each device.
 - `this.slaveSwitch`, `this.masterSwitch` : arrays of radio buttons for toggling configuration of each clock. 

###Data Acquisition
Currently `<widget-clock>` only pulls data from the ODB on page load; in future a regular poll will be implemented.

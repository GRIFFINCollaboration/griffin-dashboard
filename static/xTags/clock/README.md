#GRIFFIN Clocks

GRIFFIN utilizes up to 25 Chip Scale Atomic Clocks (CSACs) to maintain precise timing throughout the experiment.  Here we provide two custom elements: `<widget-clock>` for visualizing the gross configuration state of each clock, and `<widget-clockControl>`, a sidebar element for finer grained monitoring and control of clock parameters via their MSCB interface to the ODB.

Descriptions of the readable and writable parameters exposed by each clock can be found on [this wiki page](https://www.triumf.info/wiki/tigwiki/index.php/GRIF-Clk)

The clock custom elements rely on the ODB information and control functionality provided by the GRIFClk custom MIDAS frontend found in [this package](https://github.com/GRIFFINCollaboration/MIDASfrontends).  One of these frontends needs be deployed for each CSAC, and should be named `GRIF-Clk0` through `GRIF-Clk24`.

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
`<widget-clock>` fetches all clock data on page load, and if a clock has been clicked on and populated in the sidebar, will refresh that sidebar's information in the usual update loop.  Note however that if a user has modified any of the form elements in the sidebar's update loop, the sidebar update will be suspended until the page is refreshed, either by committing the new parameters or refreshing the page.


##`<widget-clockControl>`
This custom element provides fine monitoring and control for GRIFFIN's CSACs.  It is populated with the appropriate information via a custom `postClockChan` event listner, and relies on form submission to the node backend to do most of its ODB parameter writing.

###Attributes
 - `MIDAS`: host:port of the MIDAS experiment the GRIF-Clk frontends are living at.

###Event Listeners
 - `postClockChan`, exepcts `detail` object with keys:
    - `index` int 0-24 indexing which clock is being posted
    - `data` JSON object corresponding exactly to the ODB directory `/Equipment/GRIF-Clk<index>`

When this custom event is received, `<widget-clockControl>` updates itself, including reconfiguring its display to suit the configuration of the new clock, via its member function `this.updateForm`.  This behavior is vetoed if uncommitted changes are detected in the input form.

###Encoding
A couple of parameters available from the clocks have less-than-obvious encoding:
 - 'ClockEnB' controls the power state of the 6 eSATA outputs.  
   - 0xF == on, 0x0 == off.
   - packing is channel 0 in the first 4 bits, channel i in bits 4i .. 4i+3
 - `ch<i>_high` and `ch<i>_low` TBD 


###Member Functions

####`this.updateForm(payload)`
Responsible for updating the widget with information from a clock described by `payload`, which is the object described as the event detail of the `postClockChan` custom event.  This process includes populating the fields with infomration, but also manipulating which fields are present when switching between master and slave displays.  See 'Encoding' above for explanation of some of the more obscure logic.

####`this.changeMasterRef()`
Handles toggling the master reference clock with a direct XHR to the ODB.

####`this.changeView()`
Handles navigating through the different sidebar views, called as onchange callback to sidebar's navigation radio.

####`this.humanReadableClock(i, v)`
Parses encoded value `v` pulled from the ODB on clock `i` into a human readable string when possible, and returns that string.

####`this.determineFrequency()`
Parses value of master output frequeny slider into a value for `ch<i>_high` and `ch<i>_low` (see Encoding above) into values for frequencies output by the 8 output channels, and updates local labels and ODB.





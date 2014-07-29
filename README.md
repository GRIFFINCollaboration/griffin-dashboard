griffinMarkII
=============

GRIFFIN Mark II is the next iteration in the GRIFFIN experiment's development of an easy-to-use dashboard to serve all user needs under one UI.  

The main design evolution in Mark II over the original griffin.js is a dramatically heightened level of modularity, and independence from MIDAS.  Instead of trying to provide griffin.js' over-ambitious single page experience for such a sophisticated experiment, Mark II builds all its functionality as custom web components, thanks to the [x-tags](http://www.x-tags.org/) and [brick](http://mozilla.github.io/brick/) libraries from our friends at [Mozilla](http://www.mozilla.org/en-US/).  This way, the standard pages that ship with Mark II can be easily remixed piecemeal into new projects in the future.  Mark II also avails itself of [node](http://nodejs.org/) and [express](http://expressjs.com/) for standalone servers.

As always, the GRIFFIN Collaboration's web apps support Chrome and Firefox.

##Setup - The Full Stack
GRIFFIN's software control infrastructure consists of two layers: a main MIDAS experiment on grsmid00 plus an independent state of health experiment on grifsoh00, and the web interface layer provided by Mark II.  The following is a minimal setup and configuration procedure for this control layer.

###MIDAS Experiments
####Main Experiment
#####MIDAS Install
 - Install MIDAS per their instructions; confirmed working commit 30c93027ddad0cdf5e697fd55b9d50618eabcf1f.  On grsmid00, this should already be available in `/opt/midas`
 - Modify web security.  Open `src/mhttpd.cxx`, and change
```
    rsprintf("Access-Control-Allow-Origin: *\r\n");
```    
to
```
   rsprintf("Access-Control-Allow-Credentials: true\r\n");
   rsprintf("Access-Control-Allow-Origin: http://<host serving MarkII>:2154\r\n");
```
Then in `odbedit`, use `passwd` to configure MIDAS security as usual.  You will now be able to make credentialed requests through the dashboard.

#####Frontends
 - Set up HV frontends for each CAEN HV crate.  [The CAEN frontend found here](https://github.com/GRIFFINCollaboration/MIDASfrontends) needs to be built and run, one copy each for each CAEN high voltage crate being used.  These frontends must be named `HV-0`, `HV-1`, `HV-2`..., and they rely on version >= 5.22 of CAEN's HV wrapper library.
 - Set up clock frontends.  Same as for the HV frontends, except each clock frontend (in the same repo) should be called `GRIF-Clk0`, ..., `GRIF-Clk24`.

####State of Health Experiment
An independent MIDAS experiment running nominally on `grifsoh00`.  Set up Agilent, Epics and VME frontends as per the documentation in [the SOH repo](https://github.com/GRIFFINCollaboration/GRIFFIN-SOH).

###Web Interface
Visualization and control of GRIFFIN experiments is centralized in a web interface by [Mark II](https://github.com/BillMills/griffinMarkII).  To install and setup:
 - Check out the latest release of Mark II from the GRIFFIN collaboration repo.
 - in the base directory of Mark II, do `npm install`
 - now do `node griffin.js`, and the dashboard will serve on port 2154.
 - optionally (and this is set up on grsmid00), do `forever start griffin.js`, and the `forever` utility will make sure the dashboard stays up.  Stop with `forever stop 0` (or whatever process number corresponds to `griffin.js`, check with `forever list`, it's the number in [] in the `uid` column).

Route map for Mark II:

Utilities
 - `/Clocks` atomic clock control
 - `/DAQ` DAQ visualization & rate reporting
 - `/Filter` Filter builder & control
 - `/HV` high voltage control
 - `/MSCbuilder` MSC table generation tool
 - `/PPG` cycle builder & control
 - `/Shack` state of health monitor
 
Detectors
 - `/DANTE-PMT`
 - `/DANTE-TAC`
 - `/DESCANT`
 - `/GRIFFIN`
 - `/PACES`
 - `/SCEPTAR`
 - `/SPICE`
 - `/ZDS`

###Experiment Configuration
Some config steps need to be in order for everything to run smoothly.

####HV
On the CAEN crates directly, the HV channels need to be named via the [standard nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature).  Everything else is automatically detected once the HV frontends discussed above are up and running.

####DAQ
Each GRIFFIN experiment must have a correctly built MSC table, registered in the main ODB at `/DAQ/MSC`, and discussed in greater detail in the [DAQ documentation](https://github.com/BillMills/griffinMarkII/tree/master/static/xTags/DAQ).  Mark II's MSC helper tool, available at `/MSCbuilder`, will help automatically configure this table via the [canonical DAQ configuration]().  **You are expected to follow the canonical DAQ configuration exactly.** When plugging physical channels into the DAQ, have a look at the `/DAQ` visualization to help follow what detectors should be plugged into what DAQ channels.  If modifications from this scheme are necessary, making the corresponding changes to the table in `/DAQ/MSC` will allow the web layer to correctly reflect these customizations.

In addition to `/DAQ/MSC`, `/DAQ/hosts` must also be configured correctly, by populating it with the host names of each DAQ node; see the same DAQ documentation linked above for more details.

####Filter & PPG
Ensure the [filter](https://github.com/BillMills/griffinMarkII/tree/master/static/xTags/Filter#odb-filter-encoding) and [PPG](https://github.com/BillMills/griffinMarkII/tree/master/static/xTags/PPG#ppg-odb-spec) ODB structures are in place and populated sensibly, per the documentation linked.



##For Developers

###Overall Programmatic Logic

####x-tags
As advertised, Mark II is meant to be modular.  The web components that live in `xTags` can be included at will in any page, and all follow the same (minimal) pattern on instantiation:

 - configure their internal DOM structure 
 - append itself to the array `window.refreshTargets`, which puts it in the queue for being refreshed every update.

In addition, all components who want to participate in the update loop must declare:
 
 - an `update()` method (exactly that - named `update`, with no arguments), which goes looking for new information in memory to populate itself with, nominally from the object `window.currentData`, and triggers the requests for new data to be fetched.
 - functionality to parse the JSON acquired during `update()` into some convenient form.

####The Main Event Loop
Every Mark II page relies on a loop of the following form to update itself continuously:

 - call a function `repopulate`, which fires the `update()` methods of all the x-tags queued in `window.refreshTargets`.
 - Each update() called above will fire XHRs at URLs (nominally defined as attributes on the object in question) and expect some JSON response, which it will parse and route appropriately.  Additionally, `update()` is expected to trigger any other per-cycle bookkeeping or visualization updates its parent object needs.  Note that this expects [an appropriate CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) to be defined on the server posting the data of interest.
 
Stick that in a `setInterval` loop and you have a basic Mark II page.


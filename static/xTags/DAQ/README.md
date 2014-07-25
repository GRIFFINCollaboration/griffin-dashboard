#GRIFFIN DAQ

GRIFFIN's data aquisition system is three-tiered:
 - A *Digitizer Layer*, consisting of GRIF16s and 4G modules; each of these contain 16 or 4 ADCs respectively, and compose the finest grained layer of the DAQ.
 - A *Collector Layer*, consisting of 16 GRIF16s, to which the digitizers pass their data.
 - A single *Master*, to which all the collectors subsequently pass the data they received from the digitizer.

Put very simply, GRIFFIN manages its trigger with a single round trip through this system:
 - a detector produces some data
 - a *trigger request* is sent up the DAQ hierarchy to where a decision can be made by the filter on whether or not to accept the trigger
 - on the filter's approval, a *trigger accept* is issued to the original digitizer, and the data is sent to master for writing to disk.

`<widget-DAQ>` visualizes this system in two views: a collector/master view showing all collectors in relation to the master node, and a digitizer/collector view, showing the digitizers plugged into a single collector.  In both views, trigger request and trigger accept rates are visualized for all elements present.


##Specifications
###MSC Addressing
GRIFFIN addresses the components of its DAQ with the MSC scheme it describes in more detail in its documentation.  Briefly, MSC encoding is:

`master channel[4 bits] collector channel[4 bits] digitizer channel [8 bits]`

Where master channel is 0-15, collector channel is 0-15, and digitizer channel is 0-15 for a GRIF16 or 0-3 for a 4G.  So, `0x2A09` is master channel 2, collector channel 10, digitizer channel 9.

###ODB DAQ Encoding
The DAQ is encoded in the ODB via an MSC table, describing which detectors are plugged into which MSC address, and a hosts table, which records the network address of each DAQ component.  The MSC table can be generated in its canonical configuration as a function of which detectors are in use via the [MSC Table Builder](https://github.com/BillMills/griffinMarkII/tree/master/static/xTags/MSCbuilder) page of MarkII.  For custom configurations, updating the MSC table described below is necessary & sufficient for the custom configuration to be reflected throughout MarkII and the experiment.

####MSC Table
The MSC table lives in the ODB at `/DAQ/MSC` and has the following structure, for a DAQ with n detectors pushing data:

```
/DAQ/MSC/MSC [n short]
        /chan [n string]
        /datatype [n byte]
        /gain [n int]
        /offset [n int]
```

 - MSC[i]: 16 bit MSC address of the ith detector.
 - chan[i]: 10 character detector code from the [standard nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature)
 - datatype[i]: single byte describing the datatype of the ith detector (UNIMPLEMENTED)
 - gain[i]: gain of the ith detector channel (UNIMPLEMENTED)
 - offset[i]: offset of the ith detector channel (UNIMPLEMENTED)

####Hosts Table
The hosts table lives alongside the MSC table in the ODB and records the network names of each DAQ element.  Note that no automatic generation of this table currently exists!  It must be maintained by hand.  The hosts table looks like:

```
/DAQ/hosts/master <string>
          /collector0x0
              host <string>
              digitizers [16 strings]
          /collector0x1
              host <string>
              digitizers [16 strings]
          ...
```

 - `/DAQ/hosts/master`: a string containing the network address of the DAQ master, 'foo.triumf.ca'
 - `/DAQ/hosts/collector0x<i>/host`: a string containing the network address of collector `i`, 'bar.triumf.ca'
 - `/DAQ/hosts/collector0x<i>/digitizers[j]`: a string containing the network addresses of the digitizer plugged into channel `j` on collector `i`. 

###DAQ Communication
A GRIFFIN DAQ node with network address `baz.triumf.ca` posts data as an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer) at the following route:

```
http://baz.triumf.ca/report
```

The buffer is packed as follows:

TBD.

Entries for all MSC addresses below the position held by `baz.triumf.ca` are packed into the returned ArrayBuffer; therefore, querying a collector should return the same data as querying all the digitizers is collects, and querying master should return the data for every channel in the DAQ.

##`<widget-DAQ>` Implementation Details
`<widget-DAQ>` visualizes trigger request and accept rates for every DAQ node, as well as providing a histogram of those rates per detector system.

###Loop Behvior
`<widget-DAQ>` participates in the usual update loop that governs all MarkII pages.  `this.update` is called, triggering a refetch of data from all digitizers, and the routing of the returned data to the correct places in the visualization.  In principle, this loop could fetch aggregated data from the collectors or master - once data aggregation is implemented.

###Methods
The following are some of `<widget-DAQ>`'s more interesing methods; the rest are either generic or do essentially what their name says.

####`acquireDAQ()`
 - constructs an array of host names pulled from `/DAQ/hosts` and stores it in `window.currentData.hostList`, if that list doesn't already exist.
 - sends an XHR to each of the hosts found above, asking for an arraybuffer of the channels reporting there
 - supplies `this.unpackDAQdv` as a callback to this XHR to process the data received.


####`buildBarChart(index)`
Draw a histogram for view `index` that summarizes the current total trigger request and accept rates per detection system for channels reporting to that view's node.  `index==0` corresponds to master node, `index==i, i>0` corresponds to collector `i+1`.  This currently relies on the [Flotr2 framework](http://humblesoftware.com/flotr2/) to draw histograms.

####`buildDAQ(response)`
Responsible for instantiating all the Kinetic objects needed for all views in the widget.  `response` is the sringified JSON of the ODB's `/DAQ` directory, specified above.  This function instantiates the member variables `collectors`, `collectorCells`, `masterCables`, `digitizerCells`, `collectorCables`, and `localMSC`, described in the member variable section below.

####`clickCollector(index)`
Programatically manipulates the select element responsible for navigating between views (`id='DAQnav'`), causing the view to transition to collector `index`.

####`unpackDAQdv(dv)`
Takes a dataview `dv` encoded as described in the DAQ Communication specification section above, decodes it, and sorts the extracted data into per-digitizer (`window.currentData.digitizerTotal`), per-collector (`window.currentData.collectorTotal`) and per-detection system (`window.currentData.detectorTotal`) sums.  Also populates both the rate fields of `this.localMSC`; all these sorted data stores are described in more detail in the section below on member variables

####`update()`
Triggers `acquireDAQ()` every periodic refresh, and keeps the tooltips updated as required.

####`updateCells()`
Part of the update loop, sets colors and redraws layers for all cells as necessary; also triggers building the bar charts for the currently showing view.

###Potentially Useful Member Variables

####Kinetic Objects
 - this.collectorCables: like this.masterCables, but with an additional first index indicating which collector these cables belong to.
 - this.collectorCells[i]: the kinetic cell corresponding to the ith collector, for use on the master visualization
 - this.collectors[i]: the contents of the ODB `/DAQ/hosts/collector0x<i>`, typically used to check if this collector has been declared in the ODB DAQ tables.
 - this.digitizerCells[i][j]: kinetic cell for digitizer j on collector i, for use in drawing the view for collector i.
 - this.masterCables[[],[],[],[]]: array of 4 arrays of kinetic lines for drawing the four 4:1 cables connecting the collectors to the master on the master view.  Each 4:1 is packed as [single end, 0-,1-,2-,3-split end].

####Sorted Data
 - this.localMSC[M][S][name] contains, for the detector at master channel`<M>`, collector channel `<S>`, with 10-character `<name>`, the object:
```
{
  MSC: '0xMSCC',
  req: <int>
  acpt: <int>
}
```
 - window.currentData.collectorTotal[i]: contains the total trigger accept and trigger request rates for collector `i`, packed in the object:
```
{
  reqRate: <int>,
  acptRate: <int>
}
```
 - window.currentData.detectorTotal[i][detCode]: contains the total trigger accept and trigger request rates for collector `i`, detector `detCode` packed in the object: 
```
{
  trigReq: <int>,
  trigAcpt: <int>
}
```
 - window.currentData.digitizerTotal[i][j]: contains the total trigger accept and trigger request rates for collector `i`, digitizer `j`, packed in the object:
```
{
  reqRate: <int>,
  acptRate: <int>
}
```
 - window.currentData.masterDetectorTotal[detCode]: contains the total trigger accept and trigger request rates for detector `detCode` summed over the entire DAQ, packed in the object:
```
{
  trigReq: <int>,
  trigAcpt: <int>
}
```




###DOM
`<widget-DAQ>` contains the following rough DOM structure:

```
-------------------------------------------------------
view control UI
-------------------------------------------------------
x-deck (one card for master view + 1 per collector)




-------------------------------------------------------
plot control UI
-------------------------------------------------------
```

Plot control uses the same patterns as the detector elements.



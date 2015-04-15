#xShack

`<widget-shack>` provides a visualization for state of health information regarding the GRIFFIN electronics shack.  Currently, temperature reporting and VME power cycling are supported.

##Attributes
- `SOH`: the `host`:`port` serving the MIDAS web interface for the state of health experiment, with no extra window-dressing, ie `awesomecomp.triumf.ca:1337`

##A Note on Security
The VME power cycle 'password' is in no way secure; it is only intended to prevent accidental power cycling.  Like all MIDAS experiments, the usual password protection should be applied, and sensible firewalls should be erected.

###Some useful member data

 - `this.parameters` namespaces all the parameters for `<widget-shack>`; it is declared just before the racks are drawn, and is (hopefully nearly) self explanatory.

####Kinetic Objects
 - `this.cells.cableman[0-14]` cable management cells
 - `this.cells.comp[0-1]` computers
 - `this.cells.dsa[0-3]` data storage arrays
 - `this.cells.hv[0-2]` HV crates
 - `this.cells.net[0-3]` network switches
 - `this.cells.nim[0-6]` NIM crates
 - `this.cells.racks[0-4]` rack backgrounds.
 - `this.cells.sensorsBottom[0-4]` the thermometers on the bottoms of the 5 racks.
 - `this.cells.sensorsTop[0-4]` the thermometers on the tops of the 5 racks.
 - `this.cells.vme[0-6]` VME crates

 ####Tooltip Data
 `this.tooltipContent[i]` is an object to be listed as key:value pairs in the tooltip of the corresponding cell.  Lookup correspondence is as follows:

  - 0 <= i <= 4: top temperature sensors, `this.cells.sensorsTop[i]`
  - 5 <= i <= 9: bottom temperature sensors, `this.cells.sensorsBottom[i-5]`
  - 10 <= i <= 12: HV crates, `this.cells.hv[i-10]`
  - 13 <= i <= 19: NIM crates, `this.cells.nim[i-13]`
  - 20 <= i <= 26: VME crates, `this.cells.vme[i-20]`
  - 27 <= i <= 28: Computers, `this.cells.computer[i-27]`
  - 29 <= i <= 32: Data storage arrays, `this.cells.dsa[i-29]`
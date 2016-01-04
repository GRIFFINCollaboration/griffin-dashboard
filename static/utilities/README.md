#Utilities

This directory contains a bunch of helper functions.  `colorScales.js` contains the helpers for choosing colors along a scale; `fetchingData.js` contains the helpers that govern the main event loop; and `helpers.js` contains generic helper functions.

##canonicalMSC.js
Contains functions to construct the canonical MSC tables, packaged for inclusion as a node module; responsible for both the automatic generation of `/DAQ/MSC` in the ODB, and the contents of the `/canonicalMSC` page.

##colorScales.js

####`scalepickr(scale, palette)`
Returns the color selected from `palette` by `scale` in the form '`#012DEF`'.  `scale` is a float on [0,1]; `palette` is one of the strings 'Sunset', 'ROOT Rainbow', 'Greyscale', 'Red Scale', 'Mayfair', or 'Test'; additional scales can be defined by adding to the `if/else` on `pallette`, by defining the colors at 0, 20, 40, 60, 80 and 100% of the way along the scale from left (lowest, `scale`==0) to right (highest, `scale`==1) in the varibles `start0` to `start5`, in order.

####`constructHexColor([R,G,B])`
Returns a color string '#012DEF' constructed from a red value `R`, green value `G` and blue value `B`.  `R` `G` and `B` are all integers on [0,255].

##fetchingData.js

####`repopulate(callback)`
Steps through `window.refreshTargets`, and calls the `update()` method of each object found there.  After triggering each `update`, calls `callback` if provided.

####`rebootFetch()`
Governs the master update loop for all dashboard pages.  Suspends the current update loop, triggers `repopulate()`, and restarts the master loop with a 3 second `setInterval` stored in `window.masterLoop`.

##helpers.js

####`canHas(a,b)`
Returns `a` as long as `a` isn't `undefined` or `null`; returns `b` otherwise.

####`chewUptime(s)`
Turns a duration of `s` seconds into a readable string.

####`findADC(channel, DAQ)`
Returns the ADC channel into which `channel`, the 10-character channel name of a detector element, is plugged, where `DAQ` is a JSON represetnation of the ODB's /DAQ directory.

####`findHost(channel, DAQ)`
Returns the host of the digitizer into which `channel`, the 10-character channel name of a detector element, is plugged, where `DAQ` is a JSON represetnation of the ODB's /DAQ directory.

####`generateTickLabel(min, max, nTicks, n)`
For deciding how many decimal places to show in the label of the `n`th tick on an axis; chooses just enough to avoid repeated labels.  `min` and `max` are the axis minimum and maximum respectively, `nTicks` is the number of ticks on the axis. 

####`getParameterByName(name)`
Returns the value of query string parameter `name`.

####`kineticArrow(fromx, fromy, tox, toy)`
Returns a `Kinetic.Line` object in the shape of an arrow, with origin at canvas coordinates [`fromx`, `fromy`] and arrowhead at [`tox`, `toy`].

####`longestWord(phrase)`
Given a string `phrase`, returns the longest substring delimited by spaces.
 
####`prettyNumber(value)`
Takes a number `value`, and returns a string representation of it with a sensible unit (currently M or k).

####`radioArray(parentElt, labelText, values, groupName)`
Appends to a DOM element `parentElt` one radio button and corresponding label for each string in the array `labelText`; `values` is an array containing the value of each radio button, and `groupName` is used as the name of each radio button; `groupName+i` is the id of the ith button.

####`setAttributes(DOMelt, tribs)`
For every 'key' / 'value' pair in the object `tribs`, sets the DOM element `DOMelt`'s `key` property to the value `value`.

####`scrubNumber(value)`
`value` is any float; if `value` is falsey but nonzero, or == 0xDEADBEEF, returns the string 'Not Reporting'; otherwise returns the string of the value in base 10, rounded off to an integer.

####`selected(selectID, fetchText)`
Returns the value of the select element with `id=selectID`.  If `fetchText` is specified, returns the `innerHTML` of the select option instead.

####`sqiushFont(string, maxWidth)`
Given a `Kinetic.Text` object `string`, will step its font size down until its width is less than or equal to `maxWidth`. 

####`toggleSection(id)`
Collapses or uncollapses the height of a `<div>` element id'ed as `id`.  Collapsed divs bear the class `collapsed`; uncollapsed divs have the class `expand`.  Also switches the arrow character to right-pointing (collapsed) or down-pointing (expanded) found in the innerHTML of the element pointed as by `this` (intended to be bound to the onclick of a headline at the top of a collapsible div).

####`unpackDAQ(i, dv)`
Extracts the `i`th record from the dataview `dv`, as constructed from the arraybuffer returned by a request to one of the DAQ elements, and as specified in the DAQ documentation.

####`XHR(URL, callback, mime, noCredentials, isDataview)`
Issues an XHR request to `URL`.  Upon receipt of response, executes a `callback` function (required), which takes as its only argument the response to the request.  `noCredentials == true` indicates an uncredentialed request should be made (default false); `isDataview == true` indicates the expected response is an `arraybuffer` (default false).  If `mime` is provided, its value will be used in a call to `overrideMimeType` on the request. 

####`Math.log10(x)`
Returns the base 10 logarithm of `x`.

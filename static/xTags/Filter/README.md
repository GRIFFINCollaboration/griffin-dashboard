#Filter Manager

`<widget-Filter>` provides a simple interface for defining new filters, saving and loading them to the ODB, and applying them as the current active filter.

##Attributes

 - `MIDAS`: the `host`:`port` serving MIDAS' web interface, with no extra window-dressing, ie `awesomecomp.triumf.ca:1337`

##Basic Logic
GRIFFIN filters are built as follows: 
 - Conditions on individial detectors (such as 'DESCANT singles' or 'GRIFFIN prescale by 1000') form the most fundamental pieces of logic.  These conditions consist of a detector type, a data type (Singles, Coincidences or Prescale), and in the case of coincidences and prescale, a multiplicity or prescale factor, respectively.
 - Individual detector conditions can be ANDed together to form stricter filters (ie 'GRIFFIN multiplicity 2 coincidences AND PACES singles')
 - Several blocks of ANDed conditions can be ORed together for multiple pathways to trigger.

 `<widget-Filter>` represents a filter as a column of logical blocks, where each block contains a table; each row in each table represents one of the basic per-detector conditions in the first point above, and all the rows in a given table are ANDed together to form the stricter filters mentioned in the second point.  All of these blocks are then ORed together to form the final filter definition.

##Internal Structure

###Member Variables
 - `this.presets` array of strings titling the predefined filters found in the ODB under `/Filter/Filters` on page load.
 - `this.filterConditions` array of `<div>` corresponding to the ORed blocks of the currently displayed filter.  Note that once declared, these are never removed from this array, even if the OR block is removed from the logic; that way, the index of the OR block in this array serves as a unique identifier for it.
 - `this.nRows` array containing at position i the number of rows thusfar declared in the table in OR block i.  Note that this is never decremented; intended to provide a unique index number to each new row added to the ith table.
 - `this.detectors` array of strings naming each of the detectors eligible to define a filter condition on.
 - `this.detectorCodes` array of strings giving the [Greg Standard Nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) of the detectors named in `this.detectors`, in the same order.
 - `this.filterOptions` array of strings giving human-readable names to the different types of filter conditions, nominally Singles, Conicidences and Prescale.
 - `this.filterCodes` array of single-character strings giving the encoded representation of the filter conditions in `this.fitlerOptions`, nominally S, C and P.


###Member Functions

####`this.spawnFilterCondition()`
Inserts a new OR block at the bottom of the column of OR blocks in the currently displayed filter.

####`this.addNewRow(index)`
Adds a new table row to the table of ANDed conditions in the OR block at `this.filterConditions[index]`.

####`this.manageInputCell(filterType, idCode)`
Manages the input cell at `optionConfigWrap + idCode` as a function of the data type chosen, input as `filterType` (ie singles require no extra data, coincidences require a field for multiplicity, and prescale requires a field for prescale factor).  `idCode` is a string consisting of the index of the relevant OR block in `this.filterConditions`, concatenated with the index of the relevant table row.

####`this.deleteOrBlock(index)`
Removes the OR block at `this.filterConditions[index]` from the filter logic.

####`this.deleteRow(index, idCode)`
Removes the row bearing id `filterRow + idCode` from the table in the OR condition at `this.filterConditions[index]`.

####`this.registerNewFilter()`
Traverses the filter as currently depicted and codifies it as a JSON string, which it then places in the hidden input `input#encodedFilter` in the submission form in the right sidebar.

####`this.registerFilterODB()`
Intended as callback to fetching `/Filter` from the ODB.  Depicts the currently active filter in the filter builder, and populates the load / delete filter dropdown with preset filters.

####`this.loadFilter(filterName)`
Populates filter representation with the definition of the filter found in the ODB at `Filter/Filters/filterName`.

####`this.dumpFilterName()`
Whenever a predefined filter is loaded in the filter visualization and then edited, its name is removed from the filter name input field via a call to this function, to discourage uninentional overwriting of predefined filters.


##ODB Filter Encoding
Filters are encoded and stored in the ODB according to the following specification:

####ODB tree:

```
/Filter
    Current: <string>
    /Filters
        /someFilter
            orCondition0: [<strings>]
            orCondition1: [<strings>]
            ...
            orConditionN: [<strings>]
        /anotherFilter
            ...
```

####Definitions:

`Current` string at top level is the name of the currently active filter; it must match one of the directory names under `/Filter/Filters`.  Valid options in the above example are therefore `someFilter` and `anotherFilter`.

Directory names under `/Filter/Filters` are strings with no whitespace naming the filter.

`orConditionN` are arrays of strings, where each string encodes an individual filter condition.  All such conditions in a single `orConditionN` array are ANDed together, and then all the resulting conditions are ORed across arrays.  The condition encoding in the strings is as follows:

`XX-Y-Z`

`XX` == 2-character detector code from the standard nomenclature

`Y` == condition type: (S)ingles, (C)oincidence or (P)rescale

`Z` == 1 for singles, multiplicity for coincidences, or prescale factor for prescale.


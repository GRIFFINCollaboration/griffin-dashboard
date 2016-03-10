Filter Builder
==============

The Dashboard's filter builder supports the creation and editing of GRIFFIN's triggers.

## Maintenance Requirements

### ODB Structures

The filter builider expects the following ODB structure to exist:

```
/Filter
|_______Current (string)
|_______/Filters
        |_________________/<filter def 1>
                          |______________________orCondition0  (string array)
                          |______________________coincWindow0  (int)
                          |______________________orCondition1  (string array)
                          |______________________coincWindow1  (int)
                          .
                          .
                          .
                          |______________________orConditionN  (string array)
                          |______________________coincWindowN  (int)
        |_________________/<filter def 2>
        .
        .
        .
        |_________________/<filter def n>
```

 - **`/Filter/Current`**: the string title of the currently active filter; must match the name of a subdirectory of `/Filter/Filters`.
 - **`/Filter/Filters/<filter def>/orConditionN`**: array of strings describing filter conditions to be AND'ed together (see below for condition string encoding spec); if multiple such keys are found, the filter conditions they encode will be ORed together (example below).
 - **`/Filter/Filters/<filter def>/coincWindowN`**: integer representing the length in nanoseconds of the coincidence window enforced on cross-detector coincidences within `orConditionN`.  When `orConditionN` involves only one detector, the value of `coincWindowN` should be disregarded.

 ### Filter String Encoding

 Filter conditions are encoded in strings of the format: `XX-Y-Z[-D]`

`XX` == 2-character detector code from the [standard nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature).

`Y` == condition type: (S)ingles, (C)oincidence or (P)rescale.

`Z` == 1 for singles, multiplicity for coincidences, or prescale factor for prescale.

`-D` (optional) == duration in ns of coincidence window.  Only present for coincidences, ie where `Y==C`.

### Example

So, the following structure:

```
/Filter
|_______Current: xyz
|_______/Filters
        |_________________/demo
                          |______________________orCondition0: [GR-C-2-50] 
                          |______________________coincWindow0: 25
                          |______________________orCondition1: [DS-S-1, SE-S-1]
                          |______________________coincWindow1: 25
```

would describe a filter named `demo` that triggers on multiplicity 2 GRIFFIN coincidences with a 50 ns window, OR a 25 ns coincidence between DESCANT singles and SCEPTAR singles. But, the `demo` filter wouldn't be active, since `xyz` is listed under `/Filter/Current`.

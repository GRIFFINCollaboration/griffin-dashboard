#PPG Cycle Builder
`<widget-PPG>` provides a simple cycle builder for GRIFFIN that decodes and encodes PPG bitmasks as defined [in the spec](http://www.triumf.info/wiki/tigwiki/index.php/GRIF-PPG), and registers them in the ODB.  `<widget-PPG>` doesn't participate in the main event loop, and pushes all ODB-writing procedures to the server.  

On instantiation, `<widget-PPG>` scrapes `/PPG` out of the ODB to inform itself of the current and available cycles, while setting up its DOM.

##Attributes

 - `MIDAS`: the `host`:`port` serving MIDAS' web interface, with no extra window-dressing, ie `awesomecomp.triumf.ca:1337`

##Methods

###loadPPG(PPGtable, durations)
Takes an array of PPG codes `PPGtable` and an array of corresponding `durations` in ms, and populates the `<x-ribbon>` to illustrate this cycle.

###traversePPGribbon()
Returns an array of objects `{PPGcode: int, duration: int}` that encode the current configuration of the `<x-ribbon>`; `PPGcode` is the first 16 bits of the code to be passed to the PPG to represent the ith cycle step, and `duration` is the time in ms for that step.

###registerNewCycle()
Writes a `JSON.stringify`'d version of the output of `traversePPGribbon()` to a hidden input in the form to be submitted to the server for writing a new cycle to the ODB.

###registerPPGODB(response)
Takes the response JSON from getting `/PPG` from the ODB, populates `<widget-PPG>`'s control panel with the available cycle options, and loads the current cycle into the `<x-ribbon>` via `loadPPG`.

###toggleSummary()
Toggles CSS classes to switch between summary view and edit view.

##Server-Side ODB control
To minimize network traffic, `<widget-PPG>` dumps all information about a user request for cycle registration, loading or deleting in one blob on the `POST` route `registerCycle`.  This route will do ONE of the following, in decending order of priority:

 - Load a new cycle.  If the `POST` includes a string `loadTarget`, that string will be registered as the current cycle.
 - Delete a registered cycle.  If the `POST` includes a string `deleteTarget`, the corresponding cycle will be deleted from the list of cycles registered in the ODB.
 - Register a new cycle.  Looks for the member `cycleString` on the `POST`, which should be as the string returned by `registerNewCycle()`, and records the corresponding cycle in the list of registerd cycles in the ODB.  Additionally, if the `POST` includes `applyCycle` = `on`, this cycle will be registered as the current cycle.

##PPG ODB Spec
PPG cycles are registered in the ODB as follows:
```
/PPG
    Current: string
    /Cycles
        /CycleName
            durations: int array
            PPGcodes: int array
        /AnotherCycle
            durations: int array
            PPGcodes: int array
       ...
```

 - `Current`: name of the current cycle.  *Must match one of the subdirectories of* `/Cycles`
 - `/Cycles`: directory containing one subdirectory for every registered cycle.

Each subdirectory in `/Cycles` contains the following two arrays, *which must always be the same length*:
 - `durations`: the duration, in ms, of the ith cycle step.
 - `PPGcodes`: the lowest 16 bits of the PPG code for the ith cycle step. 

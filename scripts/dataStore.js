//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'grsmid00.triumf.ca:8081',
    "ODB": {},                              // place to park info pulled from ODB
    "data": {},                             // place to park raw data from non-ODB sources; note this gets dumped at the start of every heartbeat!
    "detector": {                           // place to park deector-specific data 
        "subview": null,                    // current subview on display
        "subviewUnits": {
            'HV': 'V', 
            'HV_demand': 'V',
            'threshold': 'ADC Units', 
            'trigger_request': 'Hz', 
            'trigger_accept': 'Hz'
        },
        "subviewPrettyText": {
            'HV': 'HV (measured)',
            'HV_demand': 'HV (demand)',
            'threshold': 'Threshold', 
            'trigger_request': 'Trigger Request', 
            'trigger_accept': 'Trigger Accept'
        },
        "plotScales": {                   // defaults, feel free to update later
            'HV': {
                'scale': 'lin',
                'min': 0,
                'max': 2000,
                'color': 'blue'
            },
            'threshold': {
                'scale': 'lin',
                'min': 0,
                'max': 1000,
                'color': 'blue'
            },
            'trigger_request': {
                'scale': 'lin',
                'min': 0,
                'max': 3000,
                'color': 'blue'
            },
            'trigger_accept': {
                'scale': 'lin',
                'min': 0,
                'max': 3000,
                'color': 'blue'
            }
        },
        "cellCoords": {},                   //object with keys == cell names, values == arrays of vertex coordinates for that cell [x0, y0, x1, y1, ....] 
        "cells": {}                         //object keyed by nomenclature code, values == corresponding Kinetic objects
    },       
    "heartbeat": {                          // queries and callbacks for the periodic data poll
        "URLqueries": [],                   // elements == ['url string', 'response type string', callback]; response type can be 'arraybuffer' or 'json'
        "scriptQueries": [],
        "ADCrequest": []                    // same format as URL queries.
    },                        
    "nMessages": 5,                         // number of ODB messages to list in the status sidebar
    "frameColor": '#000000',                // outline color for visualizations
    "frameLineWidth": 2,                    // outline width for visualization
    "ADCClickListeners": [],                // ids of elements listening for custom click events on adc channel detector displays
    "HVClickListeners": [],                 // ids of elements listening for custom click events on hv channel detector displays
    "activeHVsidebar": null,                // channel name of HV channel currently displayed in HV sidebar
    "suspendHVsidebar": false,              // user has entered stuff into the hv sidebar, don't overwrite it on update
    "tooltip": {                            // place to park tooltip information
        'currentTooltipTarget': null
    }                           
}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;
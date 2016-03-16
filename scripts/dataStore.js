//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'grsmid00.triumf.ca:8081',
    "SOHhost": 'grifsoh00.triumf.ca:8081',
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
            },
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
    "frameTextColor": '#DDDDDD',            // text color for in-figure text
    "frameLineWidth": 2,                    // outline width for visualization
    "ADCClickListeners": [],                // ids of elements listening for custom click events on adc channel detector displays
    "HVClickListeners": [],                 // ids of elements listening for custom click events on hv channel detector displays
    "activeHVsidebar": null,                // channel name of HV channel currently displayed in HV sidebar
    "suspendHVsidebar": false,              // user has entered stuff into the hv sidebar, don't overwrite it on update
    "tooltip": {                            // place to park tooltip information
        'currentTooltipTarget': null
    },
    "detPrefix": {                          // standard two-character prefixes for all detectors
        'DA': 'DANTE',
        'DS': 'DESCANT',
        'GR': 'GRIFFIN',
        'PA': 'PACES',
        'SE': 'SCEPTAR'
    },
    "detectorTypes": [                      // detector types acknowledged by grif16 and grif4g
        {                                   // see table 5.4 in https://rawgit.com/wiki/GriffinCollaboration/GRSISort/technical-docs/GRIFFIN_Event_Format.pdf
            "id": '00',
            "short": 'GRGa',
            "full": 'Ge',
            "description": 'GRIFFIN (Low Gain)'   
        },
        {
            "id": '01',
            "short": 'GRGb',
            "full": 'Ge',
            "description": 'GRIFFIN (High Gain)'
        },
        {
            "id": '02',
            "short": 'SEP',
            "full": 'Beta',
            "description": 'SCEPTAR'
        },
        {
            "id": '03',
            "short": 'DAN',
            "full": 'DANTE',
            "description": 'DANTE (Energy)'
        },
        {
            "id": '04',
            "short": 'DAT',
            "full": 'DANTE',
            "description": 'DANTE (Time)'
        },
        {
            "id": '05',
            "short": 'PAC',
            "full": 'PACES',
            "description": 'PACES'
        },
        {
            "id": '06',
            "short": 'DSC',
            "full": 'DESCANT',
            "description": 'DESCANT'
        },
        {
            "id": '07',
            "short": 'GRS',
            "full": 'Suppressors',
            "description": 'GRIFFIN Suppressors'
        },
        {
            "id": '08',
            "short": 'DAS',
            "full": 'Suppressors',
            "description": 'DANTE Suppressors'
        },
        {
            "id": '09',
            "short": 'SET',
            "full": 'Beta',
            "description": 'ZDS'
        },
        {
            "id": '10',
            "short": 'DSCg',
            "full": 'DESCANT (gamma)',
            "description": 'DSCg pulse shape'
        },
        {
            "id": '11',
            "short": 'DSCn',
            "full": 'DESCANT (neutron)',
            "description": 'DSCn pulse shape'
        }

    ]

}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;

OK = 0  // why? so that when a midas ajax command returns nothing but OK in a JSON-P situation, JavaScript doesn't interpret OK as an undefined variable.
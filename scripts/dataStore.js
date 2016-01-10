//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'grsmid00.triumf.ca:8081',
    "ODB": {},                              // place to park info pulled from ODB
    "data": {},                             // place to park raw data from non-ODB sources
    "detector": {                           // place to park deector-specific data 
        "subviewUnits": {
            'HV': 'V', 
            'threshold': 'ADC Units', 
            'trigger_request': 'Hz', 
            'trigger_accept': 'Hz'
        },
        "subviewPrettyText": {
            'HV': 'HV', 
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
        }
    },       
    "heartbeat": {                          // queries and callbacks for the periodic data poll
        "URLqueries": [],
        "scriptQueries": []
    },                        
    "nMessages": 5,                         // number of ODB messages to list in the status sidebar
    "frameColor": '#000000',                // outline color for visualizations
    "frameLineWidth": 2,                    // outline width for visualization
    "ADCClickListeners": []                 // ids of elements listening for custom click events on detector displays
}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;

// external data - note this is loaded asyncronously with the rest of the page,
// so always check that this data is present before attempting to use it!

fetchScript('http://' + dataStore.host + '/?cmd=jcopy&odb=/DAQ&encoding=json-p-nokeys&callback=fetchDAQ');
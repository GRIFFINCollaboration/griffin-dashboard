//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'grsmid00.triumf.ca:8081',
    "ODB": {},                              // place to park info pulled from ODB
    "data": {},                             // place to park raw data from non-ODB sources
    "heartbeat": {                          // queries and callbacks for the periodic data poll
        "URLqueries": [],
        "scriptQueries": []
    },                        
    "nMessages": 5,                         // number of ODB messages to list in the status sidebar
    "frameColor": '#FFFFFF',                // outline color for visualizations
    "frameLineWidth": 2                     // outline width for visualization
}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;

// external data - note this is loaded asyncronously with the rest of the page,
// so always check that this data is present before attempting to use it!

fetchScript('http://' + dataStore.host + '/?cmd=jcopy&odb=/DAQ&encoding=json-p-nokeys&callback=fetchDAQ');
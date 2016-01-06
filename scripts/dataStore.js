//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'grsmid00.triumf.ca:8081',
    "ODB": {},
    "nMessages": 5,                         // number of ODB messages to list in the status sidebar
    "frameColor": '#FFFFFF',                // outline color for visualizations
    "frameLineWidth": 2                     // outline width for visualization
}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;
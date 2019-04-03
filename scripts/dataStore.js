//declare dataStore
dataStore = {
    "heartbeatInterval": 3000,              // ms between data updates
    "host": 'missing-hostname',
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
        "cells": {}                         //object keyed by nomenclature code, values == corresponding qdshape objects
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
    "detPrefix": {                          // standard three-character prefixes for all detectors
        'DAL': 'LaBr3',
        'DSC': 'DESCANT',
        'GRG': 'GRIFFIN',
        'PAC': 'PACES',
        'SEP': 'SCEPTAR',
        'SPI': 'SPICE',
        'SPZ': 'S2',
        'SPE': 'S3',
        'TPW': 'TIP Wall',
        'TPC': 'TIP Ball',
        'ZDS': 'ZDS'
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
            "full": 'LaBr3',
            "description": 'LaBr3 (Energy)'
        },
        {
            "id": '04',
            "short": 'DAT',
            "full": 'LaBr3',
            "description": 'LaBr3 (Time)'
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
            "description": 'LaBr3 Suppressors'
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

    ],

    "ADCparameters": [
        {
            "key": "a_enable", 
            "label": "ADC enabled",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "a_pol", 
            "label": "Polarity",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "+-"
        },
        {
            "key": "a_fgain", 
            "label": "ADC gain",
            "scale": "lin",
            "min":1,
            "max":10,
            "color": "blue",
            "unit": "V p-p"
        },
        // deprecated?
        // {
        //     "key": "a_trim",
        //     "label": "a_trim",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        {
            "key": "a_dcofst", 
            "label": "DC offset",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "t_on", 
            "label": "Triggering enabled",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "t_thres", 
            "label": "Trigger threshold",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "t_diff", 
            "label": "Trigger differentiation",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "t_int", 
            "label": "Trigger integration",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "p_int", 
            "label": "Pulse height integration",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "p_diff", 
            "label": "Pulse height differentiation",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "p_delay", 
            "label": "Pulse height delay",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "p_polec1", 
            "label": "Pulse height pole correction",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue"
        },
        {
            "key": "wfr_smpl", 
            "label": "Waveform samples",
            "scale": "lin",
            "min":0,
            "max":10000,
            "color": "blue"
        },
        {
            "key": "wfr_pret", 
            "label": "Waveform pretrigger",
            "scale": "lin",
            "min":0,
            "max":10000,
            "color": "blue"
        },
        {
            "key": "wfr_mode", 
            "label": "Waveform mode",
            "scale": "lin",
            "min":0,
            "max":2,
            "color": "blue",
            "unit": "categorical, click on cell for details"
        },
        {
            "key": "sim_ena", 
            "label": "Simulation enabled",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "sim_enat", 
            "label": "Simulation trigger enabled",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "sim_enar", 
            "label": "Simulation random enabled",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "sim_pol", 
            "label": "Simulation polarity",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "+-"
        },
        {
            "key": "sim_rise", 
            "label": "Simulation rise time",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "sim_amp", 
            "label": "Simulation amplitude",
            "scale": "lin",
            "min":0,
            "max":20000,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "sim_rate", 
            "label": "Simulation rate",
            "scale": "lin",
            "min":0,
            "max":2000,
            "color": "blue",
            "unit": "Hz"
        },
        {
            "key": "sim_cyc", 
            "label": "Simulation cycle waveform",
            "scale": "lin",
            "min":0,
            "max":1,
            "color": "blue",
            "unit": "bool"
        },
        {
            "key": "sim_dly0", 
            "label": "Simulation delay 0",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key":"sim_dly1", 
            "label": "Simulation delay 1",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "sim_dly2", 
            "label": "Simulation delay 2",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "sim_dly3", 
            "label": "Simulation delay 3",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        },
        {
            "key": "sim_amp0", 
            "label": "Simulation amplitude 0",
            "scale": "lin",
            "min":0,
            "max":20000,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "sim_amp1", 
            "label": "Simulation amplitude 1",
            "scale": "lin",
            "min":0,
            "max":20000,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "sim_amp2", 
            "label": "Simulation amplitude 2",
            "scale": "lin",
            "min":0,
            "max":20000,
            "color": "blue",
            "unit": "mV"
        },
        {
            "key": "sim_amp3", 
            "label": "Simulation amplitude 3",
            "scale": "lin",
            "min":0,
            "max":20000,
            "color": "blue",
            "unit": "mV"
        },
        // looks like timestamps / walltimes
        // {
        //     "key": "dtsclr_b", 
        //     "label": "Deadtime readout",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "trsclr_b", 
        //     "label": "Trigger readout",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        {
            "key": "cfd_dly", 
            "label": "CFD delay",
            "scale": "lin",
            "min":0,
            "max":100,
            "color": "blue",
            "unit": "ns"
        },
        // deprecated
        // {
        //     "key": "rt_d0",
        //     "label": "rt_d0",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_d1",
        //     "label": "rt_d1",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_d10",
        //     "label": "rt_d10",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_d100",
        //     "label": "rt_d100",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // not settings
        // {
        //     "key": "rt_acpt", 
        //     "label": "Trigger accept rate",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_rqst", 
        //     "label": "Trigger request rate",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_dwav", 
        //     "label": "Dropped waveform",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1000,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_dbsy", 
        //     "label": "Dropped busy",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1000,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_dqt", 
        //     "label": "Dropped QT",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1000,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_dtrg", 
        //     "label": "Dropped trigger",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1000,
        //     "color": "blue"
        // },
        // {
        //     "key": "rt_dded", 
        //     "label": "Dropped deadtime",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1000,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_trig", 
        //     "label": "Trigger count",
        //     "scale": "lin",
        //     "min":0,
        //     "max":10000000000,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_trigr", 
        //     "label": "Trigger request count",
        //     "scale": "lin",
        //     "min":0,
        //     "max":10000000000,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_btrig", 
        //     "label": "Trigger buffer fill level",
        //     "scale": "lin",
        //     "min":0,
        //     "max":255,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_bwv", 
        //     "label": "Waveform buffer fill level",
        //     "scale": "lin",
        //     "min":0,
        //     "max":4095,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_bqt", 
        //     "label": "QT buffer fill level",
        //     "scale": "lin",
        //     "min":0,
        //     "max":255,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_bevr", 
        //     "label": "Event buffer read",
        //     "scale": "lin",
        //     "min":0,
        //     "max":4095,
        //     "color": "blue"
        // },
        // {
        //     "key": "st_bevw", 
        //     "label": "Event buffer write",
        //     "scale": "lin",
        //     "min":0,
        //     "max":4095,
        //     "color": "blue"
        // },
        {
            "key": "prg_ddtm", 
            "label": "Prog deadtime",
            "scale": "lin",
            "min":0,
            "max":1000,
            "color": "blue",
            "unit": "ns"
        }//,
        // not set in templates / custom
        // {
        //     "key": "det_type", 
        //     "label": "Detector type",
        //     "scale": "lin",
        //     "min":0,
        //     "max":15,
        //     "color": "blue",
        //     "unit": "categorical, click on cellfor details"
        // },
        // timestamps / real time
        // {
        //     "key": "syn_lvtm", 
        //     "label": "Sync livetime",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "syn_ddtm", 
        //     "label": "Sync deadtime",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // deprecated
        // {
        //     "key": "daq_chnm",
        //     "label": "daq_chnm",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "daq_wrTp",
        //     "label": "daq_wrTp",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // },
        // {
        //     "key": "daq_clrC",
        //     "label": "daq_clrC",
        //     "scale": "lin",
        //     "min":0,
        //     "max":1,
        //     "color": "blue"
        // }

    ]

}

// Grab the hostname from the URL
   var urlData = parseQuery();
    
    console.log(urlData.backend)
    
if(urlData.backend=="griffin")
{
    dataStore.host = 'grsmid00.triumf.ca:8081';
}else if(urlData.backend=="tigress"){
    dataStore.host = 'grsmid02.triumf.ca:8081';
}else{
    dataStore.host = 'missing-hostname';
}

dataStore.runSummaryQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-p-nokeys&callback=runSummaryCB';
dataStore.messageQuery = 'http://' + dataStore.host + '/?cmd=jmsg&n=' + dataStore.nMessages;

OK = 0  // why? so that when a midas ajax command returns nothing but OK in a JSON-P situation, JavaScript doesn't interpret OK as an undefined variable.

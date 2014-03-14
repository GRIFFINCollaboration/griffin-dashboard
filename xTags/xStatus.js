//status bar
(function(){  

    xtag.register('widget-status', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var exptTitle = document.createElement('h2')
                ,   runDetail = document.createElement('ul')
                ,   runNumber = document.createElement('li')
                ,   startTime = document.createElement('li')
                ,   upTime = document.createElement('li')
                ,   stopTime = document.createElement('li')
                ,   runControl = document.createElement('form')
                ,   start = document.createElement('input')
                ,   stop = document.createElement('input')
                ,   pause = document.createElement('input')
                ,   resume = document.createElement('input')
                ,   redirectKludge = document.createElement('input')
                ,   messageList = document.createElement('ul')
                ,   messages = []
                ,   i
                ,   URL = 'http://annikal.triumf.ca:8082/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&encoding=json-p-nokeys&callback=fetchODB';

                for(i=0; i<5; i++){
                    messages[i] = document.createElement('li');
                }

                //headline
                exptTitle.setAttribute('id', 'statusTitle');
                this.appendChild(exptTitle);

                //top level info
                runDetail.setAttribute('id', 'statusRunDetail');
                this.appendChild(runDetail);

                runNumber.setAttribute('id', 'statusRunNumber');
                document.getElementById('statusRunDetail').appendChild(runNumber);

                startTime.setAttribute('id', 'statusStartTime');
                document.getElementById('statusRunDetail').appendChild(startTime);

                upTime.setAttribute('id', 'statusUpTime');
                document.getElementById('statusRunDetail').appendChild(upTime);

                stopTime.setAttribute('id', 'statusStopTime');
                document.getElementById('statusRunDetail').appendChild(stopTime);

                //run control form
                runControl.setAttribute('id', 'runControl');
                this.appendChild(runControl);

                start.setAttribute('id', 'statusStart');
                start.setAttribute('name', 'cmd');
                start.setAttribute('type', 'submit');
                start.setAttribute('value', 'Start');
                document.getElementById('runControl').appendChild(start);
                document.getElementById('statusStart').innerHTML = 'Start';

                stop.setAttribute('id', 'statusStop');
                stop.setAttribute('name', 'cmd');
                stop.setAttribute('type', 'submit');
                stop.setAttribute('value', 'Stop');
                document.getElementById('runControl').appendChild(stop);
                document.getElementById('statusStop').innerHTML = 'Stop';

                pause.setAttribute('id', 'statusPause');
                pause.setAttribute('name', 'cmd');
                pause.setAttribute('type', 'submit');
                pause.setAttribute('value', 'Pause');
                document.getElementById('runControl').appendChild(pause);
                document.getElementById('statusPause').innerHTML = 'Pause';

                resume.setAttribute('id', 'statusResume');
                resume.setAttribute('name', 'cmd');
                resume.setAttribute('type', 'submit');
                resume.setAttribute('value', 'Resume');
                document.getElementById('runControl').appendChild(resume);
                document.getElementById('statusResume').innerHTML = 'Resume';

                redirectKludge.setAttribute('id', 'statusRedirect');
                redirectKludge.setAttribute('name', 'redir');
                redirectKludge.setAttribute('type', 'hidden');
                redirectKludge.setAttribute('value', 'http://annikal.triumf.ca:8082/CS/MarkII')
                document.getElementById('runControl').appendChild(redirectKludge)

                //message list
                messageList.setAttribute('id', 'statusMessageList');
                this.appendChild(messageList);

                for(i=0; i<5; i++){
                    messages[i].setAttribute('id', 'statusMessage'+i);
                    document.getElementById('statusMessageList').appendChild(messages[i]);
                }

                //append data location information to list of URLs to fetch from:
                if(!window.fetchURL)
                    window.fetchURL = [];
                if(window.fetchURL.indexOf(URL) == -1){
                    window.fetchURL[window.fetchURL.length] = URL;
                }

                //let repopulate know that the status bar would like to be updated every loop:
                if(!window.refreshTargets)
                    window.refreshTargets = [];
                window.refreshTargets[window.refreshTargets.length] = this;
                
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {

        }, 
        methods: {

            'update': function(){
                var i,
                    date = new Date(),
                    now, uptime, hours, minutes, seconds,
                    runNumber, stoptime,
                    messages;

                //check to make sure the requisite buffers exist:
                if(!window.currentData.ODB.Experiment || !window.currentData.ODB.Runinfo) return;

                runNumber = 'Run ' + window.currentData.ODB.Runinfo['Run number'];
                //show different stuff depending on run state:
                if(window.currentData.ODB.Runinfo.State == 1){
                    //run is stopped
                    runNumber += ' Stopped';
                    document.getElementById('statusStart').style.display = 'inline';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'none';
                    stoptime = 'Stopped ' + window.currentData.ODB.Runinfo['Stop time'];
                } else if(window.currentData.ODB.Runinfo.State == 2){
                    //run is paused
                    runNumber += ' Paused';
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'inline';
                } else if(window.currentData.ODB.Runinfo.State == 3){
                    //run is live
                    runNumber += ' Live';
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'inline';
                    document.getElementById('statusPause').style.display = 'inline';
                    document.getElementById('statusResume').style.display = 'none';
                }

                //data is present if we get this far, stick it in the correct DOM elements:
                document.getElementById('statusTitle').innerHTML = window.currentData.ODB.Experiment.Name;
                document.getElementById('statusRunNumber').innerHTML = runNumber;
                document.getElementById('statusStartTime').innerHTML = 'Started ' + window.currentData.ODB.Runinfo['Start time'];
                if(stoptime)
                    document.getElementById('statusUpTime').innerHTML = stoptime;
                else{
                    //calculate uptime:
                    now = date.getTime() / 1000;
                    uptime = now - parseInt(window.currentData.ODB.Runinfo['Start time binary'], 16);
                    hours = Math.floor(uptime / 3600);
                    minutes = Math.floor( (uptime%3600)/60 );
                    seconds = Math.floor(uptime%60);
                    document.getElementById('statusUpTime').innerHTML = 'Uptime ' + hours + ' h, ' + minutes + ' m, ' + seconds +' s'
                }


                messages = ODBGetMsg(5);
                for(i=0; i<5; i++){
                    document.getElementById('statusMessage'+i).innerHTML = messages[4-i];
                }
                
            }
        }
    });

})();

//JSONP wrapper function def:
function fetchODB(returnObj){
    if(!window.currentData.ODB)
        window.currentData.ODB = {};
    window.currentData.ODB.Experiment = returnObj[0];
    window.currentData.ODB.Runinfo = returnObj[1];
}
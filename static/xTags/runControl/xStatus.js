//status bar
(function(){  

    xtag.register('widget-status', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var exptTitle = document.createElement('h1')
                ,   runDetail = document.createElement('ul')
                ,   runNumber = document.createElement('li')
                ,   startTime = document.createElement('li')
                ,   runDuration = document.createElement('li')
                ,   stopTime = document.createElement('li')
                ,   runControl = document.createElement('div')
                ,   start = document.createElement('button')
                ,   stop = document.createElement('button')
                ,   pause = document.createElement('button')
                ,   resume = document.createElement('button')
                ,   redirectKludge = document.createElement('button')
                ,   triggerTitle = document.createElement('h3')
                ,   triggerTable = document.createElement('table')
                ,   triggerEventRow = document.createElement('tr')
                ,   triggerEPSrow = document.createElement('tr')
                ,   triggerDPSrow = document.createElement('tr')
                ,   loggerRow = document.createElement('tr')
                ,   isWriteRow = document.createElement('tr')
                ,   dataDirRow = document.createElement('tr')
                ,   triggerEventTitle = document.createElement('td')
                ,   triggerEventVal = document.createElement('td')
                ,   triggerEPSTitle = document.createElement('td')
                ,   triggerEPSVal = document.createElement('td')
                ,   triggerDPSTitle = document.createElement('td')
                ,   triggerDPSVal = document.createElement('td')
                ,   loggerTitle = document.createElement('td')
                ,   loggerVal = document.createElement('td')
                ,   isWriteTitle = document.createElement('td')
                ,   isWriteVal = document.createElement('td')
                ,   dataDirTitle = document.createElement('td')
                ,   dataDirVal = document.createElement('td')
                ,   dataDirInput = document.createElement('input')
                ,   messageTitle = document.createElement('h3')
                ,   messageWrap = document.createElement('div')
                ,   messageList = document.createElement('ul')
                ,   messages = []
                ,   i;

                //make sure data store is available
                if(!window.currentData)
                    window.currentData = {};

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

                stopTime.setAttribute('id', 'statusStopTime');
                document.getElementById('statusRunDetail').appendChild(stopTime);

                runDuration.setAttribute('id', 'statusRunDuration');
                document.getElementById('statusRunDetail').appendChild(runDuration);

                //run control form
                runControl.setAttribute('id', 'runControl');
                this.appendChild(runControl);

                start.setAttribute('id', 'statusStart');
                start.setAttribute('onclick', 'runTransition("'+this.MIDAS+'", "Start")');
                document.getElementById('runControl').appendChild(start);
                document.getElementById('statusStart').innerHTML = 'Start';

                stop.setAttribute('id', 'statusStop');
                stop.setAttribute('onclick', 'runTransition("'+this.MIDAS+'", "Stop")');
                document.getElementById('runControl').appendChild(stop);
                document.getElementById('statusStop').innerHTML = 'Stop';

                pause.setAttribute('id', 'statusPause');
                pause.setAttribute('onclick', 'runTransition("'+this.MIDAS+'", "Pause")');
                document.getElementById('runControl').appendChild(pause);
                document.getElementById('statusPause').innerHTML = 'Pause';

                resume.setAttribute('id', 'statusResume');
                resume.setAttribute('onclick', 'runTransition("'+this.MIDAS+'", "Resume")');
                document.getElementById('runControl').appendChild(resume);
                document.getElementById('statusResume').innerHTML = 'Resume';

                //trigger rates
                triggerTitle.innerHTML = 'Trigger Stats:'
                this.appendChild(triggerTitle);
                this.appendChild(triggerTable);
                triggerTable.appendChild(triggerEventRow)
                triggerTable.appendChild(triggerEPSrow)
                triggerTable.appendChild(triggerDPSrow)
                triggerTable.appendChild(loggerRow)
                triggerTable.appendChild(isWriteRow)
                triggerTable.appendChild(dataDirRow)
                triggerEventTitle.innerHTML = 'Events: ';
                triggerEventVal.setAttribute('id', 'triggerEvents');
                triggerEventRow.appendChild(triggerEventTitle);
                triggerEventRow.appendChild(triggerEventVal);
                triggerEPSTitle.innerHTML = 'Events / s: ';
                triggerEPSVal.setAttribute('id', 'triggerEventsPerSec');
                triggerEPSrow.appendChild(triggerEPSTitle);
                triggerEPSrow.appendChild(triggerEPSVal);
                triggerDPSTitle.innerHTML = 'kB / s: ';
                triggerDPSVal.setAttribute('id', 'triggerDataPerSec');
                triggerDPSrow.appendChild(triggerDPSTitle);
                triggerDPSrow.appendChild(triggerDPSVal);
                loggerTitle.innerHTML = 'GB Written: ';
                loggerVal.setAttribute('id', 'dataRecorded');
                loggerRow.appendChild(loggerTitle);
                loggerRow.appendChild(loggerVal);
                isWriteTitle.innerHTML = 'Write Data: ';
                isWriteVal.setAttribute('id', 'isWriting');
                isWriteRow.appendChild(isWriteTitle);
                isWriteRow.appendChild(isWriteVal);
                dataDirTitle.innerHTML = 'Data Dir: ';
                dataDirVal.setAttribute('id', 'dataDir');
                dataDirRow.appendChild(dataDirTitle);
                dataDirRow.appendChild(dataDirVal);
                dataDirInput.setAttribute('type', 'text')
                dataDirInput.setAttribute('id', 'dataDirIn')
                dataDirInput.setAttribute('class', 'stdin')
                dataDirVal.appendChild(dataDirInput)

                //message list
                messageWrap.setAttribute('class', 'expand');
                messageWrap.setAttribute('id', 'messageWrap');
                this.appendChild(messageWrap);

                messageTitle.innerHTML = String.fromCharCode(0x25BC) + ' Messages';
                messageTitle.onclick = toggleSection.bind(messageTitle, 'messageWrap');
                messageWrap.appendChild(messageTitle);

                messageList.setAttribute('id', 'statusMessageList');
                messageWrap.appendChild(messageList);

                for(i=0; i<5; i++){
                    messages[i].setAttribute('id', 'statusMessage'+i);
                    document.getElementById('statusMessageList').appendChild(messages[i]);
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
            'MIDAS':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {

            'update': function(){
                getRunSummary(this.MIDAS);
                ODBGetMsg(this.MIDAS, 5);                
            }
        }
    });

})();

//JSONP wrapper function def:
function fetchODBrunControl(returnObj){
    if(!window.currentData.ODB)
        window.currentData.ODB = {};
    window.currentData.ODB.Experiment = returnObj[0];
    window.currentData.ODB.Runinfo = returnObj[1];
}

//run control
function runTransition(host,command){
    
    var xmlhttp = new XMLHttpRequest(),
        cmd;

    //Start is too dumb to know how to increment the run number by itself :/
    if(command == 'Start'){
        cmd = command + '&value=' + (window.currentData.ODB.Runinfo['Run number']+1)
    } else
        cmd = command;

    //once this is all dealt with, refresh the display immediately
    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4)
            rebootFetch();
    }
    xmlhttp.withCredentials = true;
    //fire
    xmlhttp.open('GET', 'http://'+host+'/?cmd='+cmd);
    xmlhttp.send();
    
}

//message fetch
function ODBGetMsg(host, n){
    var xmlhttp = new XMLHttpRequest();

    //once this is all dealt with, refresh the display immediately
    xmlhttp.onreadystatechange = function(){
        var i, messages;

        if(this.readyState == 4){
            messages = this.responseText.split('\n');
            for(i=0; i<messages.length; i++){
                document.getElementById('statusMessage'+i).innerHTML = messages[messages.length-1-i];
            }
        }
            
    }
    xmlhttp.withCredentials = true;
    //fire async
    xmlhttp.open('GET', 'http://'+host+'/?cmd=jmsg&n='+n);
    xmlhttp.send();
}

//run summary fetch
function getRunSummary(host){
    var xmlhttp = new XMLHttpRequest();

    //once this is all dealt with, refresh the display immediately
    xmlhttp.onreadystatechange = function(){
        var data,
            i, state,
            date = new Date(),
            now, RunDuration, hours, minutes, seconds,
            runNumber, stoptime, starttimeInt, stoptimeInt,
            widget,
            messages;

        if(this.readyState == 4){
            //register the new data
            data = JSON.parse(this.responseText);
            if(!window.currentData.ODB)
                window.currentData.ODB = {};
            window.currentData.ODB.Experiment = data[0];
            window.currentData.ODB.Runinfo = data[1];
            window.currentData.ODB.Trigger = data[2];
            window.currentData.ODB.Logger  = data[3];

            //check to make sure the requisite buffers exist before populating all the fields
            if(window.currentData.ODB.Experiment && window.currentData.ODB.Runinfo && window.currentData.ODB.Trigger){

                runNumber = 'Run ' + window.currentData.ODB.Runinfo['Run number'];
                RunDuration = date.getTime() / 1000 - parseInt(window.currentData.ODB.Runinfo['Start time binary'], 16);

                //show different stuff depending on run state:
                if(window.currentData.ODB.Runinfo.State == 1){
                    //run is stopped
                    if(window.currentData.ODB.Runinfo['Transition in progress'] == 1){
                        state = 1;
                        runNumber += ' Spooling Up...';
                    } else{
                        runNumber += ' Stopped';
                        state = 0;
                    }
                    document.getElementById('statusStart').style.display = 'inline';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'none';
                    stoptime = 'Stopped ' + window.currentData.ODB.Runinfo['Stop time'];
                    stoptimeInt = Date.parse(window.currentData.ODB.Runinfo['Stop time']);
                    starttimeInt = Date.parse(window.currentData.ODB.Runinfo['Start time']);
                    RunDuration = (stoptimeInt - starttimeInt) / 1000;
                } else if(window.currentData.ODB.Runinfo.State == 2){
                    //run is paused
                    runNumber += ' Paused';
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'inline';
                    state = 2;
                    
                } else if(window.currentData.ODB.Runinfo.State == 3){
                    //run is live
                    if(window.currentData.ODB.Runinfo['Transition in progress'] == 1)
                        runNumber += ' Ending Run...';
                    else
                        runNumber += ' Live';
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'inline';
                    document.getElementById('statusPause').style.display = 'inline';
                    document.getElementById('statusResume').style.display = 'none';
                    durationInt = date.getTime() / 1000;
                    state = 3;
                }

                //data is present if we get this far, stick it in the correct DOM elements:
                document.getElementById('statusTitle').innerHTML = window.currentData.ODB.Experiment.Name;
                document.getElementById('statusRunNumber').innerHTML = runNumber;
                document.getElementById('statusStartTime').innerHTML = 'Started ' + window.currentData.ODB.Runinfo['Start time'];
                document.getElementById('statusStopTime').innerHTML = stoptime;
                
                //calculate RunDuration:
                hours = Math.floor(RunDuration / 3600);
                minutes = Math.floor( (RunDuration%3600)/60 );
                seconds = Math.floor(RunDuration%60);
                document.getElementById('statusRunDuration').innerHTML = 'Run Duration ' + hours + ' h, ' + minutes + ' m, ' + seconds +' s'

                //conditional reporting of times based on run state
                if(state == 0)
                    document.getElementById('statusStopTime').setAttribute('style', 'display:block');
                else
                    document.getElementById('statusStopTime').setAttribute('style', 'display:none');

                if(state == 0 || state == 3)
                    document.getElementById('statusRunDuration').setAttribute('style', 'display:block');
                else
                    document.getElementById('statusRunDuration').setAttribute('style', 'display:none');

                //class controld border color
                widget = document.getElementsByTagName('widget-status')[0];
                if(state == 0)
                    widget.setAttribute('class', 'stopped');
                if(state == 1 || state == 2)
                    widget.setAttribute('class', 'paused');
                if(state == 3)
                    widget.setAttribute('class', 'running');

                //trigger
                document.getElementById('triggerEvents').innerHTML = prettyNumber(window.currentData.ODB.Trigger['Events sent']);
                document.getElementById('triggerEventsPerSec').innerHTML = window.currentData.ODB.Trigger['Events per sec.'].toFixed();
                document.getElementById('triggerDataPerSec').innerHTML = window.currentData.ODB.Trigger['kBytes per sec.'].toFixed();
                document.getElementById('dataRecorded').innerHTML = (window.currentData.ODB.Logger.Channels['0'].Statistics['Bytes written']/1073742000).toFixed(3);
                document.getElementById('isWriting').innerHTML = window.currentData.ODB.Logger['Write data'] ? 'Yes' : 'No';
            }

        }
            
    }
    xmlhttp.withCredentials = true;
    //fire async
    xmlhttp.open('GET', 'http://'+host+'/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&odb2=Equipment/Trigger/Statistics/&odb3=Logger/&encoding=json-nokeys');
    xmlhttp.send();
}
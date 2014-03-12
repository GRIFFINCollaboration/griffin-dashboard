//status bar
(function(){  

    xtag.register('x-status', {
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
                ,   i;

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

            'populateFields': function(){
                var i,
                    date = new Date(),
                    now, uptime, hours, minutes, seconds;

                //check to make sure the requisite buffers exist:
                if(!window.currentData.ODB.Experiment || !window.currentData.ODB.Runinfo) return;

                //show different stuff depending on run state:
                if(window.currentData.ODB.Runinfo.State == 1){
                    //run is stopped
                    document.getElementById('statusStart').style.display = 'inline';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'none';
                } else if(window.currentData.ODB.Runinfo.State == 2){
                    //run is paused
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'none';
                    document.getElementById('statusPause').style.display = 'none';
                    document.getElementById('statusResume').style.display = 'inline';
                } else if(window.currentData.ODB.Runinfo.State == 3){
                    //run is live
                    document.getElementById('statusStart').style.display = 'none';
                    document.getElementById('statusStop').style.display = 'inline';
                    document.getElementById('statusPause').style.display = 'inline';
                    document.getElementById('statusResume').style.display = 'none';
                }

                //data is present if we get this far, stick it in the correct DOM elements:
                document.getElementById('statusTitle').innerHTML = window.currentData.ODB.Experiment.Name;
                document.getElementById('statusRunNumber').innerHTML = 'Run ' + window.currentData.ODB.Runinfo['Run number'];
                document.getElementById('statusStartTime').innerHTML = 'Started ' + window.currentData.ODB.Runinfo['Start time'];
                //calculate uptime:
                now = date.getTime() / 1000;
                uptime = now - parseInt(window.currentData.ODB.Runinfo['Start time binary'], 16);
                hours = Math.floor(uptime / 3600);
                minutes = Math.floor( (uptime%3600)/60 );
                seconds = Math.floor(uptime%60);
                document.getElementById('statusUpTime').innerHTML = 'Uptime ' + hours + ' h, ' + minutes + ' m, ' + seconds +' s'


                /*
                no messages for now - need JSONP support for jmsg
                for(i=0; i<5; i++){
                    document.getElementById('statusMessage'+i).innerHTML = i;
                }
                */
            }
        }
    });

})();
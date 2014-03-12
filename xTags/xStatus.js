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
                ,   start = document.createElement('button')
                ,   stop = document.createElement('button')
                ,   pause = document.createElement('button')
                ,   resume = document.createElement('button')
                ,   redirectKludge = document.createElement('button')
                ,   messageList = document.createElement('ul')
                ,   messages = []
                ,   i;

                for(i=0; i<5; i++){
                    messages[i] = document.createElement('li');
                }

                exptTitle.setAttribute('id', 'statusTitle');
                this.appendChild(exptTitle);

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

                messageList.setAttribute('id', 'statusMessageList');
                this.appendChild(messageList);

                for(i=0; i<5; i++){
                    messages[i].setAttribute('id', 'statusMessage'+i);
                    document.getElementById('statusMessageList').appendChild(messages[i]);
                }                
                
                //this.populateFields();
                
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
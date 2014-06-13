(function(){  

    xtag.register('widget-PPG', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString,
                    title = document.createElement('h1'),
                    controlWrap = document.createElement('form'),
                    savePPG = document.createElement('button'),
                    saveLoadPPG = document.createElement('button'),
                    encodedCycle = document.createElement('input'),
                    applyCycle = document.createElement('input'),
                    cycleNameLabel = document.createElement('label'),
                    cycleName = document.createElement('input'),
                    chooseCycleLabel = document.createElement('label'),
                    chooseCycle = document.createElement('select'),
                    controlRows = [],
                    loadPPG = document.createElement('button');
                    deletePPG = document.createElement('button');
                    loadTarget = document.createElement('input');
                    deleteTarget = document.createElement('input');


                XHR('http://'+this.MIDAS+'/?cmd=jcopy&odb=/PPG&encoding=json-nokeys', this.registerPPGODB.bind(this));

                xString = '<h1>Cycle Configuration</h1><x-ribbon id="PPGribbon"></x-ribbon>';
                xtag.innerHTML(this,xString);
                this.ribbon = document.getElementById('PPGribbon')

                this.ribbon.wrapperForm.onchange = function(){
                    document.getElementById('cycleName').value = '';
                };

                controlWrap.setAttribute('class', 'PPGcontrol');
                controlWrap.setAttribute('method', 'POST');
                controlWrap.setAttribute('action', 'registerCycle');
                this.appendChild(controlWrap);

                controlRows[0] = document.createElement('span')
                controlWrap.appendChild(controlRows[0]);

                encodedCycle.setAttribute('type', 'text');
                encodedCycle.setAttribute('id', 'encodedCycle');
                encodedCycle.setAttribute('style', 'display:none');
                encodedCycle.setAttribute('name', 'cycleString');
                controlRows[0].appendChild(encodedCycle);

                applyCycle.setAttribute('type', 'checkbox');
                applyCycle.setAttribute('id', 'applyCycle');
                applyCycle.setAttribute('style', 'display:none');
                applyCycle.setAttribute('name', 'applyCycle');
                controlRows[0].appendChild(applyCycle);

                cycleNameLabel.innerHTML = 'Cycle Name:';
                cycleName.setAttribute('class', 'stdin');
                cycleName.setAttribute('type', 'text');
                cycleName.setAttribute('id', 'cycleName');
                cycleName.setAttribute('name', 'cycleName');
                controlRows[0].appendChild(cycleNameLabel);
                controlRows[0].appendChild(cycleName);

                savePPG.setAttribute('class', 'stdin');
                savePPG.innerHTML = 'Save Cycle Definition';
                savePPG.onclick = this.registerNewCycle.bind(this);
                controlRows[0].appendChild(savePPG);

                saveLoadPPG.setAttribute('class', 'stdin');
                saveLoadPPG.innerHTML = 'Save & Apply Cycle Definition';
                saveLoadPPG.onclick = function(){
                    this.registerNewCycle();
                    document.getElementById('applyCycle').checked = true;
                }.bind(this);
                controlRows[0].appendChild(saveLoadPPG);

                controlRows[1] = document.createElement('span');
                controlWrap.appendChild(controlRows[1]);

                chooseCycleLabel.innerHTML = 'Load / Delete Cycle:'
                controlRows[1].appendChild(chooseCycleLabel);
                chooseCycle.setAttribute('class', 'stdin');
                chooseCycle.setAttribute('id', 'cycleList');
                controlRows[1].appendChild(chooseCycle);

                loadTarget.setAttribute('type', 'text');
                loadTarget.setAttribute('name', 'loadTarget');
                loadTarget.setAttribute('id', 'loadTarget');
                loadTarget.setAttribute('value', 'null');
                loadTarget.setAttribute('style', 'display:none');
                controlRows[1].appendChild(loadTarget);
                loadPPG.setAttribute('class', 'stdin');
                loadPPG.innerHTML = 'Load'
                loadPPG.onclick = function(){
                    document.getElementById('loadTarget').value = selected('cycleList')
                }
                controlRows[1].appendChild(loadPPG);

                deleteTarget.setAttribute('type', 'text');
                deleteTarget.setAttribute('name', 'deleteTarget');
                deleteTarget.setAttribute('id', 'deleteTarget');
                deleteTarget.setAttribute('value', 'null');
                deleteTarget.setAttribute('style', 'display:none');
                controlRows[1].appendChild(deleteTarget);
                deletePPG.setAttribute('class', 'stdin');
                deletePPG.innerHTML = 'Delete'
                deletePPG.onclick = function(){
                    document.getElementById('deleteTarget').value = selected('cycleList')
                }
                controlRows[1].appendChild(deletePPG);
                
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
            'loadPPG' : function(ppgTable, durations){
                var i, j, lastStep, options, lastDuration;

                for(i=0; i<ppgTable.length; i++){
                    this.ribbon.endRibbon.onclick();

                    lastStep = this.ribbon.getElementsByTagName('ul');
                    lastStep = lastStep[lastStep.length-1];
                    options = lastStep.querySelectorAll('input[type="checkbox"]');

                    lastDuration = this.ribbon.querySelectorAll('input[type="number"]');
                    lastDuration = lastDuration[lastDuration.length-1];
                    if(durations[i]%60000 == 0){
                        lastDuration.value = durations[i] / 60000;
                        lastDuration.nextSibling.value = 60000;
                    }
                    else if(durations[i]%1000 == 0){
                        lastDuration.value = durations[i] / 1000;
                        lastDuration.nextSibling.value = 1000;
                    } else
                        lastDuration.value = durations[i];

                    for(j=0; j<16; j++){
                        if( (1 << j) & ppgTable[i]){
                            options[j].checked = true;
                        }
                    }
                }
            },

            'traversePPGribbon' : function(){
                var steps = this.ribbon.getElementsByTagName('ul'),
                    durations = this.ribbon.querySelectorAll('input[type="number"]'),
                    units = this.ribbon.querySelectorAll('select'),
                    duration = 0,
                    options,
                    ppgConfig = [],
                    i, j;

                for(i=0; i<steps.length; i++){
                    duration = parseInt(durations[i].value) * selected(units[i].id); 
    
                    options = steps[i].querySelectorAll('input[type="checkbox"]:checked');
                    if(options.length > 0){
                        ppgConfig.push({'PPGcode' : 0, 'duration' : duration});
                        for(j=0; j<options.length; j++){
                            ppgConfig[ppgConfig.length-1].PPGcode = ppgConfig[ppgConfig.length-1].PPGcode | parseInt(options[j].value,10);
                        }
                    }
                }

                return ppgConfig;    
            },

            'registerNewCycle' : function(){
                document.getElementById('encodedCycle').value = JSON.stringify(this.traversePPGribbon());
            },

            'registerPPGODB' : function(responseText){
                var data = JSON.parse(responseText),
                    currentName = data.Current,
                    currentPPG = (data.Cycles[currentName]) ? data.Cycles[currentName].PPGcodes : [],
                    currentDuration = (data.Cycles[currentName]) ? data.Cycles[currentName].durations : [],
                    cycleSelect = document.getElementById('cycleList'),
                    cycleOptions, key;

                this.PPGrecord = data;

                this.loadPPG(currentPPG, currentDuration);
                document.getElementById('cycleName').value = currentName;

                for(key in data.Cycles){
                    cycleOptions = document.createElement('option');
                    cycleOptions.innerHTML = key;
                    cycleOptions.value = key;
                    cycleSelect.appendChild(cycleOptions);
                    
                }

                cycleSelect.value = currentName;
            }
        }
    });

})();
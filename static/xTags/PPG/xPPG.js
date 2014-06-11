(function(){  

    xtag.register('widget-PPG', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString, 
                    title = document.createElement('h1'),
                    controlWrap = document.createElement('form'),
                    savePPG = document.createElement('button'),
                    encodedCycle = document.createElement('input'),
                    cycleNameLabel = document.createElement('label'),
                    cycleName = document.createElement('input')

                this.ribbon;

                xString = '<h1>Cycle Configuration</h1><x-ribbon id="PPGribbon"></x-ribbon>';
                xtag.innerHTML(this,xString);
                this.ribbon = document.getElementById('PPGribbon')

                this.ribbon.wrapperForm.onchange = function(){
                    document.getElementById('cycleName').value = '';
                    document.getElementById('encodedCycle').value = JSON.stringify(this.traversePPGribbon());

                }

                controlWrap.setAttribute('class', 'PPGcontrol');
                controlWrap.setAttribute('method', 'POST');
                controlWrap.setAttribute('action', 'registerCycle');
                this.appendChild(controlWrap);

                encodedCycle.setAttribute('type', 'text');
                encodedCycle.setAttribute('id', 'encodedCycle');
                encodedCycle.setAttribute('style', 'display:none');
                encodedCycle.setAttribute('name', 'cycleString');

                cycleNameLabel.innerHTML = 'Cycle Name:';
                cycleName.setAttribute('class', 'stdin');
                cycleName.setAttribute('type', 'text');
                cycleName.setAttribute('id', 'cycleName');
                cycleName.setAttribute('name', 'cycleName');
                controlWrap.appendChild(cycleNameLabel);
                controlWrap.appendChild(cycleName);

                savePPG.setAttribute('class', 'stdin');
                savePPG.innerHTML = 'Save New Cycle Definition';
                savePPG.onclick = this.registerNewCycle.bind(this);
                controlWrap.appendChild(savePPG);

                this.loadPPG([1,2,5], this.ribbon);
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
            'loadPPG' : function(ppgTable, ribbon){
                var i, j, lastStep, options;

                for(i=0; i<ppgTable.length; i++){
                    ribbon.endRibbon.onclick();

                    lastStep = ribbon.getElementsByTagName('ul');
                    lastStep = lastStep[lastStep.length-1];
                    options = lastStep.querySelectorAll('input[type="checkbox"]');

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
                var PPGcode = this.traversePPGribbon(),
                    cycleName = document.getElementById('cycleName').value;

                console.log(cycleName)
                console.log(PPGcode)
            }
        }
    });

})();
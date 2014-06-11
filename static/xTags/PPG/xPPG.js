(function(){  

    xtag.register('widget-PPG', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString;

                this.ribbon;

                xString = '<x-ribbon id="PPGribbon"></x-ribbon>';
                xtag.innerHTML(this,xString);
                this.ribbon = document.getElementById('PPGribbon')

                this.ribbon.cardConfig = this.cardConfig;

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

            'traversePPGribbon' : function(ribbon){
                var steps = ribbon.getElementsByTagName('ul'),
                    options,
                    ppgConfig = [],
                    i, j;

                    for(i=0; i<steps.length; i++){
                        options = steps[i].querySelectorAll('input[type="checkbox"]:checked');
                        if(options.length > 0){
                            ppgConfig.push(0);
                            for(j=0; j<options.length; j++){
                                ppgConfig[ppgConfig.length-1] = ppgConfig[ppgConfig.length-1] | parseInt(options[j].value,10);
                            }
                        }
                    }
            },

            'cardConfig' : function(targetElement){
                var remove = document.createElement('button'),
                    moveLater = document.createElement('button'),
                    moveEarlier = document.createElement('button'),
                    timeLabel = document.createElement('label'),
                    duration = document.createElement('input'),
                    durationUnits = document.createElement('select'),
                    unitOption, units = ['ms', 's', 'min'], unitScale = [1, 1000, 60000],
                    list = document.createElement('ul'),
                    listItem, ppgOption, ppgLabel,
                    ppgName = ['strawberry', 'banana', 'neopolitain'], 
                    ppgCode = [0x1, 0x2, 0x4],
                    i;

                remove.innerHTML = 'Remove';
                remove.onclick = this.deleteCard.bind(this, targetElement);
                targetElement.appendChild(remove);

                timeLabel.innerHTML = 'Duration';
                targetElement.appendChild(timeLabel);
                duration.setAttribute('class', 'stdin');
                targetElement.appendChild(duration);
                durationUnits.setAttribute('class', 'stdin');
                targetElement.appendChild(durationUnits);
                for(i=0; i<units.length; i++){
                    unitOption = document.createElement('option');
                    unitOption.innerHTML = units[i];
                    unitOption.value = unitScale[i];
                    durationUnits.appendChild(unitOption);
                }

                targetElement.appendChild(list);

                for(i=0; i<ppgName.length; i++){
                    listItem = document.createElement('li');
                    list.appendChild(listItem);

                    ppgOption = document.createElement('input');
                    ppgOption.setAttribute('type', 'checkbox');
                    ppgOption.setAttribute('id', 'uID' + this.uniqueIndex + 'ppg' + ppgCode[i].toString(16));
                    ppgOption.value = ppgCode[i];
                    listItem.appendChild(ppgOption);

                    ppgLabel = document.createElement('label');
                    ppgLabel.innerHTML = ppgName[i];
                    ppgLabel.setAttribute('for', 'uID' + this.uniqueIndex + 'ppg' + ppgCode[i].toString(16));
                    listItem.appendChild(ppgLabel);
                }

                moveLater.innerHTML = 'Later';
                moveLater.onclick = this.shuffleCardLater.bind(this, targetElement);
                targetElement.appendChild(moveLater);

                moveEarlier.innerHTML = 'Earlier';
                moveEarlier.onclick = this.shuffleCardEarlier.bind(this, targetElement);
                targetElement.appendChild(moveEarlier);
            }
        }
    });

})();
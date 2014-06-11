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
            }
        }
    });

})();
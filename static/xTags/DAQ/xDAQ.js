(function(){  

    xtag.register('widget-DAQ', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString;

                //get the DAQ structure
                XHR('http://' + this.MIDAS + '/?cmd=jcopy&odb=/DAQ&encoding=json-nokeys', 
                    function(res){
                        this.buildDAQ(res);
                    }.bind(this), 
                    'application/json');

                xString = '<x-deck id="' + this.id + 'Deck" selected-index=0>';
                xString += '<x-card id="DAQmasterCard"></x-card></x-deck>';
                xtag.innerHTML(this, xString);

                this.masterBlock = document.createElement('div');
                this.masterBlock.setAttribute('class', 'masterDAQ');
                document.getElementById('DAQmasterCard').appendChild(this.masterBlock);

                this.collectorBlock = document.createElement('div');
                this.collectorBlock.setAttribute('class', 'collectorDAQ');
                document.getElementById('DAQmasterCard').appendChild(this.collectorBlock)
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
            'buildDAQ' : function(response){
                var data = JSON.parse(response),
                    collectors = [],
                    digitizers = [],
                    i;

                //determine what collectors are present
                for(i=0; i<16; i++){
                    collectors[i] = data.hosts['collector0x' + i.toString(16)]
                }

                console.log(collectors)
            }
        }
    });

})();
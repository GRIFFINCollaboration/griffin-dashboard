(function(){  

    xtag.register('widget-DAQhisto', {
        extends: 'div'
        lifecycle: {
            created: function() {
                var histos = ['spectrum', 'time', 'pulse', 'waveform'],
                    i;

                    for(i=0; i<histos.length; i++){
                        this[histos[i]] = document.createElement('div')
                        this[histos[i]].setAttribute('id', histos[i])
                        this[histos[i]].setAttribute('class', 'DAQhisto')
                        this.appendChild(this[histos[i]]);
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

        }
    });

})();
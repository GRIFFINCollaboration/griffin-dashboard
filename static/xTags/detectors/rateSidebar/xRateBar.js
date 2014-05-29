//HV control panel
(function(){  

    xtag.register('widget-rateBar', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var barTitle = document.createElement('h2')

                ////////////////////
                //build the DOM
                ////////////////////
                controlTitle.setAttribute('id', this.id + 'Title');
                controlTitle.innerHTML = 'Rates & Thresholds.';
                this.appendChild(barTitle);

                this.addEventListener('postRateChan', function(evt){
                    this.updateRates(evt.detail);
                }, false);

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
            'updateRates' : function(customEventData){
                
            }
        }
    });

})();
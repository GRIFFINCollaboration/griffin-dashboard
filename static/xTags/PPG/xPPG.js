(function(){  

    xtag.register('widget-PPG', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString;

                xString = '<x-ribbon id="PPGribbon"></x-ribbon>';

                xtag.innerHTML(this,xString);

                loadPPG([1,2,5], document.getElementById('PPGribbon'));
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

        }
    });

})();
(function(){  

    xtag.register('widget-DAQ', {
        extends: 'div',
        lifecycle: {
            created: function() {
                XHR(this.midas + '/?cmd=jcopy&odb=/DAQ&encoding=json-nokeys', function(res){console.log(res) }, 'application/json')
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
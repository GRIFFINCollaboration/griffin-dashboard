(function(){  

    xtag.register('x-clock', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i,
                    clockDiv,
                    dummy;

                for(i=0; i<25; i++){
                    clockDiv = document.createElement('div');
                    clockDiv.setAttribute('id', 'clock'+i);
                    clockDiv.setAttribute('class', 'clockSummary');
                    this.appendChild(clockDiv);

                    dummy = document.createElement('button');
                    dummy.innerHTML = 'test'
                    dummy.onclick = function(){
                        console.log('test');
                    }
                    clockDiv.appendChild(dummy);

                    if(i%5 == 0)
                        clockDiv.setAttribute('class', 'clockSummary absentClock')
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

        },

    });

})();




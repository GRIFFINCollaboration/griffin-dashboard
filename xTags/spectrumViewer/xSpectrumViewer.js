//status bar
(function(){  

    xtag.register('widget-spectrumViewer', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h2')
                ,   spectrum = document.createElement('canvas')
                ,   viewer;

                //headline
                title.setAttribute('id', 'SVTitle');
                this.appendChild(title);
                title.innerHTML = 'Spectrum Viewer';

                //spectrum canvas
                spectrum.setAttribute('id', 'SVplot');
                this.appendChild(spectrum);                

                //initialize viewer
                viewer = new spectrumViewer('SVplot');
                viewer.canvas.style.backgroundColor = '#111111';
                viewer.addData('dummy0', viewer.fakeData.energydata0);
                
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

            'update': function(){
               
         
            }
        }
    });

})();
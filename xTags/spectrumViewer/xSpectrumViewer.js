//status bar
(function(){  

    xtag.register('widget-spectrumViewer', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h2')
                ,   spectrum = document.createElement('canvas')
                ,   channelSelect = document.createElement('select')
                ,   channel
                ,   viewer, i, dummyString;

                //headline
                title.setAttribute('id', 'SVTitle');
                this.appendChild(title);
                title.innerHTML = 'Spectrum Viewer';

                //spectrum canvas
                spectrum.setAttribute('id', 'SVplot');
                this.appendChild(spectrum);
                spectrum.width = 0.9*this.offsetWidth
                spectrum.height = 0.75*spectrum.width;                

                //initialize viewer
                viewer = new spectrumViewer('SVplot');
                viewer.canvas.style.backgroundColor = '#111111';
                viewer.addData('dummy0', viewer.fakeData.energydata0);
                viewer.plotData();

                //set up channel selector
                channelSelect.setAttribute('id', 'SVselector');
                this.appendChild(channelSelect);
                for(i=1; i<25; i++){
                    if(i<10)
                        dummyString = 'TPW00' + i + 'P00X';
                    else
                        dummyString = 'TPW0' + i + 'P00X';

                    channel = document.createElement('option')
                    channel.setAttribute('id', dummyString)
                    channelSelect.appendChild(channel);
                    channel.innerHTML = dummyString;
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

            'update': function(){
               
         
            }
        }
    });

})();
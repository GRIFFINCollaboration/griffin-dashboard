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
                ,   i, dummyString;

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
                this.viewer = new spectrumViewer('SVplot');
                this.viewer.canvas.style.backgroundColor = '#111111';
                this.viewer.addData('dummy0', this.viewer.fakeData.energydata0);
                this.viewer.plotData();

                //set up channel selector
                channelSelect.setAttribute('id', 'SVselector');
                this.appendChild(channelSelect);
                for(i=1; i<25; i++){
                    if(i<10)
                        dummyString = 'TPW00' + i + 'P00X';
                    else
                        dummyString = 'TPW0' + i + 'P00X';

                    channel = document.createElement('option')
                    channel.setAttribute('id', 'SV' + dummyString)
                    channelSelect.appendChild(channel);
                    channel.innerHTML = dummyString;
                }

                //dummy plot generator for demo
                channelSelect.onchange = function(){
                    var center = []
                        sigma = [],
                        amp = [],
                        i, j,
                        energies = [],
                        SV = document.getElementById('spectrumViewer');

                    for(i=0; i<5; i++){
                        center[i] = Math.random()*1000;
                        sigma[i] = Math.random()*5;
                        amp[i] = Math.random()*1000;
                    }

                    for(i=0; i<1000; i++){
                        energies[i] = 0;
                        for(j=0; j<5; j++){
                            energies[i] += amp[j]*Math.exp(-(i-center[j])*(i-center[j])/2/sigma[j]/sigma[j]);
                        }
                    }
                    SV.viewer.removeData('dummy0')
                    SV.viewer.addData('dummy0', energies)
                    SV.viewer.plotData();
                }

                //ready to catch events to change the channel
                this.addEventListener('changeChannel', function(evt){
                    console.log(evt.channel)
                }, false);
                
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
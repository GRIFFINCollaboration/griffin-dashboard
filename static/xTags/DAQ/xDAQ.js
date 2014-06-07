(function(){  

    xtag.register('widget-DAQ', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString, option;

                this.width = this.offsetWidth;
                this.height = window.innerHeight*0.6;

                //get the DAQ structure
                XHR('http://' + this.MIDAS + '/?cmd=jcopy&odb=/DAQ&encoding=json-nokeys', 
                    function(res){
                        this.buildDAQ(res);
                    }.bind(this), 
                    'application/json');

                //build DOM
                xString = '<x-deck id="DAQdeck" selected-index=0>';
                xString += '<x-card id="DAQmasterCard"></x-card></x-deck>';
                xtag.innerHTML(this, xString);
                this.nCards = 1

                this.masterBlock = document.createElement('div');
                this.masterBlock.setAttribute('class', 'masterDAQ');
                document.getElementById('DAQmasterCard').appendChild(this.masterBlock);

                this.collectorBlock = document.createElement('div');
                this.collectorBlock.setAttribute('id', 'collectorBlock');
                this.collectorBlock.setAttribute('class', 'collectorDAQ');
                document.getElementById('DAQmasterCard').appendChild(this.collectorBlock);

                this.navBlock = document.createElement('div');
                this.navBlock.setAttribute('class', 'DAQnav');
                this.appendChild(this.navBlock);

                this.cardNav = document.createElement('select');
                this.cardNav.setAttribute('class', 'stdin');
                this.navBlock.appendChild(this.cardNav);

                option = document.createElement('option');
                option.value = 0;
                option.innerHTML = 'Master'
                this.cardNav.appendChild(option);

                ////////////////////////////
                //Kinetic.js setup
                ////////////////////////////

                //indices for these arrays correspond to the x-card index on display
                this.stage = [];
                this.mainLayer = [];
                this.scaleLayer = [];
                this.tooltipLayer = [];
                this.TTbkg = [];
                this.text = [];
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
                    i, option,
                    collectorGutter = 10;

                this.collectors = [];
                this.digitizers = [];
                this.collectorCells = [];

                //determine what collectors are present and instantiate x-cards for each one
                for(i=0; i<16; i++){
                    this.collectors[i] = data.hosts['collector0x' + i.toString(16)];

                    //if(this.collectors[i]){
                        document.getElementById('DAQdeck').innerHTML += '<x-card id="collector'+i+'"></x-card>';
                        option = document.createElement('option');
                        option.value = this.nCards;
                        option.innerHTML = 'Collector 0x' + i.toString(16).toUpperCase();
                        this.cardNav.appendChild(option);
                        this.nCards++;
                    
                    //}
                }

                //now that the xdeck is built, paint master canvas:
                this.setupKinetic('collectorBlock');
                for(i=0; i<16; i++){
                    //if(this.collectors[i]){
                        this.collectorCells[i] = new Kinetic.Rect({
                            x:collectorGutter/2 + i*this.width/16,
                            y:this.height*0.6,
                            width: (this.width - collectorGutter*16) / 16,
                            height:this.height*0.2,
                            fill:'#555555',
                            stroke: '#000000',
                        });
                        this.mainLayer[0].add(this.collectorCells[i]);
                    //}
                }
                this.mainLayer[0].draw();
                
                


                console.log(this.collectors)
            },

            'setupKinetic' : function(targetID){
                var i = this.stage.length;
                //point kinetic at the div and set up the staging and layers:
                this.stage[i] = new Kinetic.Stage({
                    container: targetID,
                    width: this.width,
                    height: this.height
                });
                this.mainLayer[i] = new Kinetic.Layer();       //main rendering layer
                this.scaleLayer[i] = new Kinetic.Layer();      //layer for scales / legends
                this.tooltipLayer[i] = new Kinetic.Layer();    //layer for tooltip info

                //tooltip background:
                this.TTbkg[i] = new Kinetic.Rect({
                    x:-1000,
                    y:-1000,
                    width:100,
                    height:100,
                    fill:'rgba(0,0,0,0.8)',
                    stroke: 'rgba(0,0,0,0)',
                    listening: false
                });
                this.tooltipLayer[i].add(this.TTbkg[i]);

                //tooltip text:
                this.text[i] = new Kinetic.Text({
                    x: -1000,
                    y: -1000,
                    fontFamily: 'Arial',
                    fontSize: 16,
                    text: '',
                    lineHeight: 1.2,
                    fill: '#EEEEEE',
                    listening: false
                });
                this.tooltipLayer[i].add(this.text[i]);

                this.stage[i].add(this.mainLayer[i]);
                this.stage[i].add(this.scaleLayer[i]);
                this.stage[i].add(this.tooltipLayer[i]);
            }
        }
    });

})();
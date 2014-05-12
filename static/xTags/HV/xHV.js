//status bar
(function(){  

    xtag.register('widget-HV', {
        extends: 'div',
        lifecycle: {
            created: function() {
                ////////////////
                //Members
                ////////////////
                this.width = this.offsetWidth;
                this.height = this.offsetHeight;
                this.crateNames = ['Crate_0', 'Crate_1', 'Crate_2'];
                //slot occupancy, ie [4,4,4,4] == four 4-slot cards beside each other,
                //[1,0,1,0] == a one slot card, a space, another 1 slot card, and another empty slot, etc.
                this.cratePop = [
                    [4,4,4,4],
                    [1,0,1,0,0,0],
                    [4,0,4,0,4,0,0]
                ];
                this.cardNames = [
                    ['Slot 0', 'Slot 4', 'Slot 8', 'Slot 12'],
                    ['Slot 0', 'Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5'],
                    ['Slot 0', 'Slot 4', 'Slot 5', 'Slot 9', 'Slot 10', 'Slot 14', 'Slot 15']
                ]
                
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

            'update': function(){
                
            },

            'instantiateMonitors': function(){
                var deckWrap = document.createElement('div'),
                    nav = document.createElement('div'),
                    title = document.createElement('h1'),
                    crateLabel, crateRadio, xString, HVgrid, i, j, k, nSlots, colsPassed;

                ////////////////
                //DOM Setup
                ////////////////
                //crate navigation
                nav.setAttribute('id', this.id+'Nav');
                nav.setAttribute('class', 'HVcrateNav');
                this.appendChild(nav);
                title.innerHTML = 'HV Control';
                document.getElementById(this.id+'Nav').appendChild(title);
                for(i=0; i<this.crateNames.length; i++){
                    crateRadio = document.createElement('input')
                    crateRadio.setAttribute('id', this.id+'goto'+this.crateNames[i]);
                    crateRadio.setAttribute('class', 'crateRadio');
                    crateRadio.setAttribute('type', 'radio');
                    crateRadio.setAttribute('name', this.id+'Nav');
                    crateRadio.setAttribute('value', this.crateNames[i]);
                    crateRadio.onchange = this.changeView.bind(this, i);
                    if(i==0) crateRadio.setAttribute('checked', true);
                    document.getElementById(this.id+'Nav').appendChild(crateRadio);
                    crateLabel = document.createElement('label');
                    crateLabel.setAttribute('id', this.id+'goto'+this.crateNames[i]+'Label');
                    crateLabel.setAttribute('class', 'crateLabel');
                    crateLabel.setAttribute('for', this.id+'goto'+this.crateNames[i]);
                    document.getElementById(this.id+'Nav').appendChild(crateLabel);
                    document.getElementById(this.id+'goto'+this.crateNames[i]+'Label').innerHTML = this.crateNames[i];
                }

                //plot deck wrapper:
                deckWrap.setAttribute('id', this.id+'DeckWrap');
                this.appendChild(deckWrap);

                //declaring x-tags from within other x-tags needs special treatment via innerHTML; must build HTML string and set it.
                xString = '<x-deck id="' + this.id + 'Deck" selected-index=0>';
                for(i=0; i<this.crateNames.length; i++){
                    xString += '<x-card id="HVCard'+i+'"><x-waffle id="HVGrid'+i+'"></x-waffle></x-card>';
                }
                xString += '</x-deck>'
                deckWrap.innerHTML = xString;

                //configure HV grids
                for(i=0; i<this.crateNames.length; i++){
                    //rows and cols
                    HVgrid = document.getElementById('HVGrid'+i);
                    nSlots = 0;
                    for(j=0; j<this.cratePop[i].length; j++){
                        nSlots += Math.max(this.cratePop[i][j], 1);
                    }
                    HVgrid.rows = 13;
                    HVgrid.cols = nSlots;

                    //cell names
                    HVgrid.cellNames = [];
                    for(j=0; j<HVgrid.rows; j++){
                        HVgrid.cellNames[j] = []
                        for(k=0; k<HVgrid.cols; k++){
                            HVgrid.cellNames[j][k] = 'test'+j+'_'+k;
                        }
                    }

                    //master cells for 4-channel cards & card dividers & card names
                    colsPassed = 0
                    HVgrid.specials = {};
                    HVgrid.dividers = {};
                    HVgrid.colTitles = [];
                    for(j=0; j<this.cratePop[i].length; j++){
                        //master cells
                        if(this.cratePop[i][j] == 4){
                            HVgrid.specials['test'+i+j] = [0,colsPassed, 4,1];
                        }

                        //card titles
                        HVgrid.colTitles[j] = [];
                        HVgrid.colTitles[j][0] = this.cardNames[i][j];
                        HVgrid.colTitles[j][1] = colsPassed;
                        HVgrid.colTitles[j][2] = Math.max(1, this.cratePop[i][j]);

                        //row titles
                        HVgrid.rowTitles = ['Master',1,2,3,4,5,6,7,8,9,10,11,12];

                        colsPassed += Math.max(1, this.cratePop[i][j]);

                        //dividers
                        if(colsPassed != HVgrid.cols)
                            HVgrid.dividers['divider'+j] = [colsPassed,0, colsPassed,HVgrid.rows];

                    }

                    //legend
                    HVgrid.legend = [
                        ['green', 'All OK'],
                        ['red', 'Alarm!'],
                        ['yellow', 'Ramping'],
                        ['blue', 'Ext. Trip'],
                        ['0x222222', 'Off']
                    ]

                }

            },

            'changeView': function(i){
                document.getElementById(this.id+'Deck').shuffleTo(i);
            }
  
        }
    });

})();
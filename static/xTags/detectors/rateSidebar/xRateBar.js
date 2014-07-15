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
                barTitle.setAttribute('id', this.id + 'Title');
                barTitle.innerHTML = 'Click on a rate or threshold channel to get started.';
                this.appendChild(barTitle);
                this.UIdeployed = false;









                this.addEventListener('postADC', function(evt){
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
                document.getElementById(this.id + 'Title').innerHTML = customEventData.channel
                if(!this.UIdeployed)
                    this.setUpUI();
            },

            'setUpUI' : function(){
                var control = document.createElement('div'),
                    mainSections = ['ADCstatusPane', 'ADC', 'trig', 'pulseHeight', 'time', 'waveform', 'simulation', 'misc'],
                    mainSectionDivs = [],
                    mainSectionTitles = ['MSCB Node Info', 'ADC Control', 'Triggering', 'Pulse Height Evaluation', 'Time Evaluation', 'Waveform Readout', 'Simulation Pulse', 'Miscellaneous'],
                    mainSectionH3 = [],
                    mainLists = [],
                    i;

                //wrapper for ADC UI
                control.setAttribute('id', 'control');
                this.appendChild(control);

                //main sections
                for(i=0; i<mainSections.length; i++){
                    mainSectionDivs[i] = document.createElement('div');
                    mainSectionDivs[i].setAttribute('id', mainSections[i]);
                    mainSectionDivs[i].setAttribute('class', 'collapse');

                    mainSectionH3[i] = document.createElement('h3');
                    mainSectionH3[i].setAttribute('class', 'sectionHead');
                    mainSectionH3[i].onclick = toggleSelection.bind(this, mainSections[i]);
                    mainSectionH3[i].innerHTML = String.fromCharCode(0x25B6) + ' ' +mainSectionTitles[i];
                    mainSectionDivs[i].appendChild(mainSectionH3[i]);

                    mainLists[i] = document.createElement('ul');
                    mainSectionDivs[i].appendChild(mainLists[i]);

                    control.appendChild(mainSectionDivs[i]);
                }

            }
        }
    });

})();


function toggleSection(id){
    var section = document.getElementById(id)

    if(section.className == 'collapse'){
        section.className = 'expand'
        this.innerHTML = String.fromCharCode(0x25BC) + this.innerHTML.slice(this.innerHTML.indexOf(' '));
    }
    else{
        section.className = 'collapse'
        this.innerHTML = String.fromCharCode(0x25B6) + this.innerHTML.slice(this.innerHTML.indexOf(' '));   
    }
}
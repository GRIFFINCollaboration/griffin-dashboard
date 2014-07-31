(function(){  

    xtag.register('widget-MSCbuilder', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h1'),
                    optionWrap, message, submit;

                title.innerHTML = 'Detector Deployment'
                this.appendChild(title);

                this.detectorForm = document.createElement('form');
                this.detectorForm.setAttribute('name', 'detectors');
                this.detectorForm.setAttribute('method', 'POST');
                this.detectorForm.setAttribute('action', 'buildMSC');
                this.appendChild(this.detectorForm);

                this.upstreamChamber = document.createElement('div');
                this.upstreamChamber.setAttribute('class', 'detectorSection');
                this.detectorForm.appendChild(this.upstreamChamber);
                title = document.createElement('h2');
                title.innerHTML = 'Upstream Chamber';
                this.upstreamChamber.appendChild(title);
                optionWrap = document.createElement('div');
                optionWrap.setAttribute('class', 'optionWrap');
                this.upstreamChamber.appendChild(optionWrap);
                radioArray(optionWrap, ['Absent', 'SCEPTAR', 'PACES', 'SPICE'], ['USCabsent', 'USCSE', 'USCPA', 'USCSP'], 'USC');

                this.downstreamChamber = document.createElement('div');
                this.downstreamChamber.setAttribute('class', 'detectorSection');
                this.detectorForm.appendChild(this.downstreamChamber);
                title = document.createElement('h2');
                title.innerHTML = 'Downstream Chamber';
                this.downstreamChamber.appendChild(title);
                optionWrap = document.createElement('div');
                optionWrap.setAttribute('class', 'optionWrap');
                this.downstreamChamber.appendChild(optionWrap);
                radioArray(optionWrap, ['Absent', 'SCEPTAR', 'ZDS', 'S2', 'S3'], ['DSCabsent', 'DSCSE', 'DSCZD', 'DSCS2', 'DSCS3'], 'DSC');
                document.getElementById('DSC3Label').setAttribute('style', 'display:none');
                document.getElementById('DSC4Label').setAttribute('style', 'display:none');

                this.corona = document.createElement('div');
                this.corona.setAttribute('class', 'detectorSection');
                this.detectorForm.appendChild(this.corona);
                title = document.createElement('h2');
                title.innerHTML = 'Corona';
                this.corona.appendChild(title);
                optionWrap = document.createElement('div');
                optionWrap.setAttribute('class', 'optionWrap');
                this.corona.appendChild(optionWrap);
                radioArray(optionWrap, ['Absent', 'GRIFFIN'], ['coronaAbsent', 'CoronaGR'], 'corona');
                this.corona.appendChild(this.generateGRIFFINtable('corona', [5,6,7,8,9,10,11,12]));

                this.upstreamLampshade = document.createElement('div');
                this.upstreamLampshade.setAttribute('class', 'detectorSection');
                this.detectorForm.appendChild(this.upstreamLampshade);
                title = document.createElement('h2');
                title.innerHTML = 'Upstream Lampshade';
                this.upstreamLampshade.appendChild(title);
                optionWrap = document.createElement('div');
                optionWrap.setAttribute('class', 'optionWrap');
                this.upstreamLampshade.appendChild(optionWrap);
                radioArray(optionWrap, ['Absent', 'GRIFFIN', 'GRIFFIN + DANTE'], ['USLabsent', 'USLGR', 'USLGRDA'], 'USL');
                this.upstreamLampshade.appendChild(this.generateGRIFFINtable('USL', [13,14,15,16]));
                message = document.createElement('p');
                message.setAttribute('id', 'USLmessage');
                message.setAttribute('class', 'message hidden');
                this.upstreamLampshade.appendChild(message);

                this.downstreamLampshade = document.createElement('div');
                this.downstreamLampshade.setAttribute('class', 'detectorSection');
                this.detectorForm.appendChild(this.downstreamLampshade);
                title = document.createElement('h2');
                title.innerHTML = 'Downstream Lampshade';
                this.downstreamLampshade.appendChild(title);
                optionWrap = document.createElement('div');
                optionWrap.setAttribute('class', 'optionWrap');
                this.downstreamLampshade.appendChild(optionWrap);
                radioArray(optionWrap, ['Absent', 'GRIFFIN', 'GRIFFIN + DANTE', 'DESCANT'], ['DSLabsent', 'DSLGR', 'DSLGRDA', 'DSLDS'], 'DSL')
                this.downstreamLampshade.appendChild(this.generateGRIFFINtable('DSL', [1,2,3,4]));

                submit = document.createElement('button');
                submit.setAttribute('class', 'stdin');
                submit.innerHTML = 'Build DAQ Address Table';
                this.detectorForm.appendChild(submit);

                //state management
                //turn appropriate GRIFFIN tables on as needed, and manage SPICE / GRIFFIN constraint in USL:
                document.getElementById('USC0Label').onclick = this.turnOffSPICE;
                document.getElementById('USC1Label').onclick = this.turnOffSPICE;
                document.getElementById('USC2Label').onclick = this.turnOffSPICE;
                document.getElementById('USC3Label').onclick = function(){
                    var message = document.getElementById('USLmessage')

                    message.setAttribute('class', 'message');
                    message.innerHTML = 'SPICE services occupy the upstream lampshade when SPICE is installed; remove SPICE from the upstream chamber to use GRIFFIN here.'

                    document.forms.detectors.USL[0].checked=true;
                    document.getElementById('USL0Label').onclick();

                    document.getElementById('DSC1Label').setAttribute('style', 'display:none');
                    document.getElementById('DSC2Label').setAttribute('style', 'display:none');
                    document.getElementById('DSC3Label').setAttribute('style', 'display:auto');
                    document.getElementById('DSC4Label').setAttribute('style', 'display:auto');
                    document.forms.detectors.DSC[0].checked=true;

                }

                document.getElementById('corona0Label').onclick = function(){
                    document.getElementById('coronaGRIFFINconfig').setAttribute('class', 'GRIFFINconfig hidden');
                }
                document.getElementById('corona1Label').onclick = function(){
                    document.getElementById('coronaGRIFFINconfig').setAttribute('class', 'GRIFFINconfig');
                }

                document.getElementById('USL0Label').onclick = function(){
                    document.getElementById('USLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig hidden');
                }
                document.getElementById('USL1Label').onclick = function(){
                    var USC = document.querySelectorAll('input[name="USC"]:checked')[0]

                    if(USC && USC.value == 'USCSP')
                        return false;

                    document.getElementById('USLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig');
                }
                document.getElementById('USL2Label').onclick = function(){
                    var USC = document.querySelectorAll('input[name="USC"]:checked')[0]

                    if(USC && USC.value == 'USCSP')
                        return false;

                    document.getElementById('USLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig');
                }


                document.getElementById('DSL0Label').onclick = function(){
                    document.getElementById('DSLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig hidden');
                }
                document.getElementById('DSL1Label').onclick = function(){
                    document.getElementById('DSLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig');
                }
                document.getElementById('DSL2Label').onclick = function(){
                    document.getElementById('DSLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig');
                }
                document.getElementById('DSL3Label').onclick = function(){
                    document.getElementById('DSLGRIFFINconfig').setAttribute('class', 'GRIFFINconfig hidden');
                }

                //defaults
                document.forms.detectors.USC[0].checked=true;
                document.forms.detectors.DSC[0].checked=true;
                document.forms.detectors.corona[1].checked=true;
                document.forms.detectors.USL[1].checked=true;
                document.forms.detectors.DSL[1].checked=true;
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
            'generateGRIFFINtable' : function(section, clovers){
                var table = document.createElement('table'),
                    row, cell, checkbox,
                    i;

                table.setAttribute('class', 'GRIFFINconfig')
                table.setAttribute('id', section+'GRIFFINconfig')

                row = document.createElement('tr');
                table.appendChild(row);
                cell = document.createElement('td');
                cell.innerHTML = 'Clover';
                row.appendChild(cell);
                for(i=0; i<clovers.length; i++){
                    cell = document.createElement('td');
                    cell.innerHTML = clovers[i];
                    row.appendChild(cell);
                }

                row = document.createElement('tr');
                table.appendChild(row);
                cell = document.createElement('td');
                cell.innerHTML = 'Crystal'
                row.appendChild(cell);
                for(i=0; i<clovers.length; i++){
                    cell = document.createElement('td');
                    checkbox = document.createElement('input');
                    checkbox.setAttribute('type', 'checkbox');
                    checkbox.setAttribute('name', 'crystal' + clovers[i]);
                    checkbox.setAttribute('checked', true);
                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }

                row = document.createElement('tr');
                table.appendChild(row);
                cell = document.createElement('td');
                cell.innerHTML = 'Suppressor'
                row.appendChild(cell);
                for(i=0; i<clovers.length; i++){
                    cell = document.createElement('td');
                    checkbox = document.createElement('input');
                    checkbox.setAttribute('type', 'checkbox');
                    checkbox.setAttribute('name', 'suppressor' + clovers[i]);
                    //checkbox.setAttribute('checked', true);
                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }

                return table;
            },

            'turnOffSPICE' : function(){
                var message = document.getElementById('USLmessage')
                message.setAttribute('class', 'message hidden');
                document.getElementById('DSC1Label').setAttribute('style', 'display:auto');
                document.getElementById('DSC2Label').setAttribute('style', 'display:auto');
                document.getElementById('DSC3Label').setAttribute('style', 'display:none');
                document.getElementById('DSC4Label').setAttribute('style', 'display:none');
                document.forms.detectors.DSC[0].checked=true;
            }
 
        }
    });

})();
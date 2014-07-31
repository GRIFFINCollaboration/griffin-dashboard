(function(){  

    xtag.register('widget-Filter', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var spawnCondition, filterTitle, currentFilter,
                    contentWrap = document.createElement('div'),
                    floatWrap = document.createElement('div'),
                    controlWrap = document.createElement('form'),
                    controlRows = [],
                    encodedFilter = document.createElement('input'),
                    applyFilter = document.createElement('input'),
                    filterNameLabel = document.createElement('label'),
                    filterName = document.createElement('input'),
                    saveFilter = document.createElement('button'),
                    chooseFilterLabel = document.createElement('label'),
                    chooseFilter = document.createElement('select'),
                    loadFilter = document.createElement('button'),
                    deleteFilter = document.createElement('button'),
                    loadTarget = document.createElement('input'),
                    deleteTarget = document.createElement('input'),
                    saveLoadFilter = document.createElement('button');

                this.presets = [];
                this.filterConditions = [];
                this.nRows = [];
                this.detectors = ['DANTE', 'DESCANT', 'GRIFFIN', 'PACES', 'SCEPTAR', 'ZDS'];
                this.detectorCodes = ['DA', 'DS', 'GR', 'PA', 'SE', 'ZD'],
                this.filterOptions = ['Singles', 'Coincidences', 'Prescale'];
                this.filterCodes = ['S', 'C', 'P'];

                filterTitle = document.createElement('h1');
                filterTitle.innerHTML = 'Filter Control';
                this.appendChild(filterTitle);
                currentFilter = document.createElement('h3');
                currentFilter.setAttribute('id', 'currentFilter');
                this.appendChild(currentFilter);

                floatWrap.setAttribute('id', 'floatWrap');
                this.appendChild(floatWrap);

                contentWrap.setAttribute('id', 'contentWrap');
                floatWrap.appendChild(contentWrap);

                this.conditionWrap = document.createElement('form');
                this.conditionWrap.setAttribute('id', 'conditionWrap');
                this.conditionWrap.onchange = function(){
                    this.dumpFilterName();  
                }.bind(this);
                contentWrap.appendChild(this.conditionWrap);

                this.spawnFilterCondition();

                spawnCondition = document.createElement('button');
                spawnCondition.innerHTML = 'OR new condition';
                spawnCondition.setAttribute('class', 'stdin');
                spawnCondition.setAttribute('id', 'spawnCondition')
                spawnCondition.onclick = this.spawnFilterCondition.bind(this);
                contentWrap.appendChild(spawnCondition);

                controlWrap.setAttribute('class', 'filterControl summary');
                controlWrap.setAttribute('id', 'filterDefinitionForm');
                controlWrap.setAttribute('method', 'POST');
                controlWrap.setAttribute('action', 'registerFilter');
                floatWrap.appendChild(controlWrap);

                controlRows[0] = document.createElement('span')
                controlWrap.appendChild(controlRows[0]);

                encodedFilter.setAttribute('type', 'text');
                encodedFilter.setAttribute('id', 'encodedFilter');
                encodedFilter.setAttribute('style', 'display:none');
                encodedFilter.setAttribute('name', 'filterString');
                controlRows[0].appendChild(encodedFilter);

                applyFilter.setAttribute('type', 'checkbox');
                applyFilter.setAttribute('id', 'applyFilter');
                applyFilter.setAttribute('style', 'display:none');
                applyFilter.setAttribute('name', 'applyFilter');
                controlRows[0].appendChild(applyFilter);

                filterNameLabel.innerHTML = 'Filter Name:';
                filterName.setAttribute('class', 'stdin');
                filterName.setAttribute('type', 'text');
                filterName.setAttribute('id', 'filterName');
                filterName.setAttribute('name', 'filterName');
                filterName.setAttribute('pattern', '^[\\S]*$');
                filterName.setAttribute('required', true);
                controlRows[0].appendChild(filterNameLabel);
                controlRows[0].appendChild(filterName);

                saveFilter.setAttribute('class', 'stdin');
                saveFilter.innerHTML = 'Save Filter Definition';
                saveFilter.onclick = this.registerNewFilter.bind(this);
                controlRows[0].appendChild(saveFilter);

                saveLoadFilter.setAttribute('class', 'stdin');
                saveLoadFilter.innerHTML = 'Save & Apply Filter Definition';
                saveLoadFilter.onclick = function(){
                    this.registerNewFilter();
                    document.getElementById('applyFilter').checked = true;
                }.bind(this);
                controlRows[0].appendChild(saveLoadFilter);

                controlRows[1] = document.createElement('span');
                controlWrap.appendChild(controlRows[1]);

                chooseFilterLabel.innerHTML = 'Load / Delete Filter:'
                controlRows[1].appendChild(chooseFilterLabel);
                chooseFilter.setAttribute('class', 'stdin');
                chooseFilter.setAttribute('id', 'filterList');
                controlRows[1].appendChild(chooseFilter);

                loadTarget.setAttribute('type', 'text');
                loadTarget.setAttribute('name', 'loadTarget');
                loadTarget.setAttribute('id', 'loadTarget');
                loadTarget.setAttribute('value', 'null');
                loadTarget.setAttribute('style', 'display:none');
                controlRows[1].appendChild(loadTarget);
                loadFilter.setAttribute('class', 'stdin');
                loadFilter.innerHTML = 'Load'
                loadFilter.onclick = function(){
                    document.getElementById('filterName').value = selected('filterList');
                    document.getElementById('loadTarget').value = selected('filterList');
                }
                controlRows[1].appendChild(loadFilter);

                deleteTarget.setAttribute('type', 'text');
                deleteTarget.setAttribute('name', 'deleteTarget');
                deleteTarget.setAttribute('id', 'deleteTarget');
                deleteTarget.setAttribute('value', 'null');
                deleteTarget.setAttribute('style', 'display:none');
                controlRows[1].appendChild(deleteTarget);
                deleteFilter.setAttribute('class', 'stdin');
                deleteFilter.innerHTML = 'Delete'
                deleteFilter.onclick = function(){
                    document.getElementById('filterName').value = selected('filterList');
                    document.getElementById('deleteTarget').value = selected('filterList')
                }
                controlRows[1].appendChild(deleteFilter);

                XHR('http://'+this.MIDAS+'/?cmd=jcopy&odb=/Filter&encoding=json-nokeys', this.registerFilterODB.bind(this));
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
            'spawnFilterCondition' : function(){
                var newCondition = document.createElement('div'),
                    leftTab = document.createElement('div'),
                    filterContent = document.createElement('div'),
                    conditionTable = document.createElement('table'),
                    crossDetectorCoincWrap = document.createElement('div'),
                    crossDetectorCoincLabel = document.createElement('label'),
                    crossDetectorCoincInput = document.createElement('input'),
                    addNewRow = document.createElement('button'),
                    deleteCondition = document.createElement('button'),
                    index = this.filterConditions.length;

                newCondition.setAttribute('id', 'filterCondition' + index);
                newCondition.setAttribute('class', 'filterCondition');
                this.conditionWrap.appendChild(newCondition);

                leftTab.setAttribute('id', 'leftTab' + index);
                leftTab.setAttribute('class', 'leftTab');
                leftTab.innerHTML = 'OR';
                newCondition.appendChild(leftTab);

                filterContent.setAttribute('id', 'filterContent' + index);
                filterContent.setAttribute('class', 'filterContent');
                newCondition.appendChild(filterContent)

                conditionTable.setAttribute('id', 'filterTable'+index);
                conditionTable.setAttribute('class', 'filterTable');
                filterContent.appendChild(conditionTable);

                //coincidence time window for multi-detector coincidences
                crossDetectorCoincWrap = document.createElement('div');
                crossDetectorCoincWrap.setAttribute('id', 'crossDetectorCoincWrap'+index);
                crossDetectorCoincWrap.setAttribute('class', 'crossDetectorCoincWrap hidden');
                filterContent.appendChild(crossDetectorCoincWrap);
                crossDetectorCoincLabel = document.createElement('label');
                crossDetectorCoincLabel.setAttribute('id', 'crossDetectorCoincLabel'+index);
                crossDetectorCoincLabel.innerHTML = 'Cross-Detector Coinc. Window [ns]:'
                crossDetectorCoincWrap.appendChild(crossDetectorCoincLabel);
                crossDetectorCoincInput = document.createElement('input');
                crossDetectorCoincInput.setAttribute('id', 'crossDetectorCoincInput'+index);
                crossDetectorCoincInput.setAttribute('class', 'stdin');
                crossDetectorCoincInput.setAttribute('type', 'number');
                crossDetectorCoincInput.setAttribute('step', 1);
                crossDetectorCoincInput.setAttribute('min', 0);
                crossDetectorCoincInput.value = 50;
                crossDetectorCoincWrap.appendChild(crossDetectorCoincInput);

                addNewRow.setAttribute('id', 'addNewRow' + index);
                addNewRow.setAttribute('class', 'stdin lightButton');
                addNewRow.innerHTML = 'AND new condition';
                addNewRow.onclick = this.addNewRow.bind(this, index);
                filterContent.appendChild(addNewRow);

                deleteCondition.setAttribute('id', 'deleteCondition' + index);
                deleteCondition.setAttribute('class', 'stdin lightButton');
                deleteCondition.innerHTML = 'Delete This Block';
                deleteCondition.onclick = this.deleteOrBlock.bind(this, index);
                filterContent.appendChild(deleteCondition);

                this.nRows[index] = 0;
                addNewRow.onclick();

                this.filterConditions.push(newCondition);

                this.dumpFilterName();
            },

            'addNewRow' : function(index){
                var row, cell, 
                    detectorSelect, detectorOption,
                    filterSelect, filterOption,
                    optionConfigWrap, optionConfigLabel, optionConfigInput, coincConfigWrap, coincConfigLabel, coincConfigInput,
                    deleteRow,
                    i, 
                    rowIndex = this.nRows[index]

                if(this.nRows[index] == 1)
                    document.getElementById('crossDetectorCoincWrap'+index).setAttribute('class', 'crossDetectorCoincWrap');

                row = document.createElement('tr');
                row.setAttribute('id', 'filterRow' + index + rowIndex);
                document.getElementById('filterTable' + index).appendChild(row);

                cell = document.createElement('td');
                cell.innerHTML = 'AND';
                row.appendChild(cell);

                cell = document.createElement('td');
                row.appendChild(cell);
                detectorSelect = document.createElement('select');
                detectorSelect.setAttribute('id', 'detectorSelect'+index+rowIndex);
                detectorSelect.setAttribute('class', 'stdin');
                for(i=0; i<this.detectors.length; i++){
                    detectorOption = document.createElement('option');
                    detectorOption.value = this.detectorCodes[i];
                    detectorOption.innerHTML = this.detectors[i];
                    detectorSelect.appendChild(detectorOption);
                }
                cell.appendChild(detectorSelect);

                cell = document.createElement('td');
                row.appendChild(cell);
                filterSelect = document.createElement('select');
                filterSelect.setAttribute('id', 'filterType'+index+rowIndex)
                filterSelect.setAttribute('class', 'stdin');
                filterSelect.onchange = function(idCode){
                    var filterType = selected('filterType'+idCode);

                    this.manageInputCell(filterType, idCode);

                }.bind(this, ''+index+rowIndex);
                for(i=0; i<this.filterOptions.length; i++){
                    filterOption = document.createElement('option');
                    filterOption.value = this.filterCodes[i];
                    filterOption.innerHTML = this.filterOptions[i];
                    filterSelect.appendChild(filterOption);
                }
                cell.appendChild(filterSelect);

                //generic config parameter (multiplicity or prescale factor)
                cell = document.createElement('td');
                row.appendChild(cell);
                optionConfigWrap = document.createElement('div');
                optionConfigWrap.setAttribute('id', 'optionConfigWrap'+index+rowIndex);
                optionConfigWrap.setAttribute('class', 'optionConfigWrap hiddenConfig');
                cell.appendChild(optionConfigWrap);
                optionConfigLabel = document.createElement('label');
                optionConfigLabel.setAttribute('id', 'optionConfigLabel'+index+rowIndex);
                optionConfigWrap.appendChild(optionConfigLabel);
                optionConfigInput = document.createElement('input');
                optionConfigInput.setAttribute('id', 'optionConfigInput'+index+rowIndex);
                optionConfigInput.setAttribute('class', 'stdin');
                optionConfigInput.setAttribute('type', 'number');
                optionConfigInput.setAttribute('step', 1);
                optionConfigInput.setAttribute('min', 0);
                optionConfigWrap.appendChild(optionConfigInput);

                //coincidence time window
                cell = document.createElement('td');
                row.appendChild(cell);
                coincConfigWrap = document.createElement('div');
                coincConfigWrap.setAttribute('id', 'coincConfigWrap'+index+rowIndex);
                coincConfigWrap.setAttribute('class', 'coincConfigWrap hiddenConfig');
                cell.appendChild(coincConfigWrap);
                coincConfigLabel = document.createElement('label');
                coincConfigLabel.setAttribute('id', 'coincConfigLabel'+index+rowIndex);
                coincConfigLabel.innerHTML = 'Coinc. Window [ns]:'
                coincConfigWrap.appendChild(coincConfigLabel);
                coincConfigInput = document.createElement('input');
                coincConfigInput.setAttribute('id', 'coincConfigInput'+index+rowIndex);
                coincConfigInput.setAttribute('class', 'stdin');
                coincConfigInput.setAttribute('type', 'number');
                coincConfigInput.setAttribute('step', 1);
                coincConfigInput.setAttribute('min', 0);
                coincConfigInput.value = 50;
                coincConfigWrap.appendChild(coincConfigInput);

                cell = document.createElement('td');
                row.appendChild(cell);
                deleteRow = document.createElement('button');
                deleteRow.innerHTML = 'Remove';
                deleteRow.setAttribute('class', 'stdin');
                deleteRow.onclick = this.deleteRow.bind(this, index, ''+index+rowIndex);
                cell.appendChild(deleteRow);

                this.nRows[index]++;

                this.dumpFilterName();

                return false;

            },

            'manageInputCell' : function(filterType, idCode){

                if(filterType == 'S'){
                    document.getElementById('optionConfigWrap'+idCode).setAttribute('class', 'optionConfigWrap hiddenConfig');
                    document.getElementById('coincConfigWrap'+idCode).setAttribute('class', 'coincConfigWrap hiddenConfig');
                } else if(filterType == 'C'){
                    document.getElementById('optionConfigWrap'+idCode).setAttribute('class', 'optionConfigWrap');
                    document.getElementById('coincConfigWrap'+idCode).setAttribute('class', 'coincConfigWrap');
                    document.getElementById('optionConfigLabel'+idCode).innerHTML = 'Multiplicity: ';
                    document.getElementById('optionConfigInput'+idCode).setAttribute('value', 2);
                } else if(filterType == 'P'){
                    document.getElementById('optionConfigWrap'+idCode).setAttribute('class', 'optionConfigWrap');
                    document.getElementById('coincConfigWrap'+idCode).setAttribute('class', 'coincConfigWrap hiddenConfig');
                    document.getElementById('optionConfigLabel'+idCode).innerHTML = 'Factor: ';
                    document.getElementById('optionConfigInput'+idCode).setAttribute('value', 10);
                }
            },

            'deleteOrBlock' : function(index){
                var block = document.getElementById('filterCondition' + index);
                this.conditionWrap.removeChild(block);
                this.dumpFilterName();

                return false;
            },

            'deleteRow' : function(index, idCode){
                var row = document.getElementById('filterRow'+idCode),
                    table = document.getElementById('filterTable'+index);

                table.removeChild(row);
                this.dumpFilterName();

                if(table.querySelectorAll('tr').length==0)
                    document.getElementById('deleteCondition' + index).onclick();

                this.nRows[index]--;
                if(this.nRows[index] == 1)
                    document.getElementById('crossDetectorCoincWrap'+index).setAttribute('class', 'crossDetectorCoincWrap hidden');

                return false;
            },

            'registerNewFilter' : function(){
                var filterConditions = this.querySelectorAll('div.filterCondition'),
                    tableRows,
                    selects,
                    detector, filter, scale, condition, coinc, crossDetCoinc,
                    encoded = [],
                    crossDetectorCoincs = [],
                    i,j;

                for(i=0; i<filterConditions.length; i++){
                    tableRows = filterConditions[i].querySelectorAll('tr');
                    if(!tableRows || tableRows.length == 0) continue;
                    encoded[i] = [];

                    for(j=0; j<tableRows.length; j++){
                        selects = tableRows[j].querySelectorAll('select');

                        detector = selected(selects[0].id);
                        filter = selected(selects[1].id);
                        scale = parseInt(tableRows[j].querySelectorAll('input')[0].value, 10);
                        if(!scale) scale = 1;
                        if (filter == 'C')
                            coinc = parseInt(tableRows[j].querySelectorAll('input')[1].value, 10);

                        condition = detector + '-' + filter + '-' + scale;
                        if(filter == 'C')
                            condition += '-'+coinc;

                        encoded[i][j] = condition;
                                                
                    }

                    crossDetCoinc = filterConditions[i].querySelectorAll('input');
                    crossDetCoinc = crossDetCoinc[crossDetCoinc.length - 1];
                    console.log(crossDetCoinc)
                    crossDetectorCoincs[i] = crossDetCoinc
                }

                document.getElementById('encodedFilter').value = JSON.stringify(encoded);
            },

            'registerFilterODB' : function(responseText){
                var data = JSON.parse(responseText),
                    currentName = data.Current,
                    currentFilter = data.Filters[currentName],
                    filterSelect = document.getElementById('filterList'),
                    filterOptions, key;

                this.filterRecord = data;

                this.loadFilter(currentFilter);
                document.getElementById('filterName').value = currentName;
                document.getElementById('currentFilter').innerHTML = 'Current Active Filter: ' + currentName;

                for(key in data.Filters){
                    filterOptions = document.createElement('option');
                    filterOptions.innerHTML = key;
                    filterOptions.value = key;
                    filterSelect.appendChild(filterOptions);
                    this.presets.push(key);
                }

                filterSelect.value = currentName;
            },

            'loadFilter' : function(currentFilter){
                var orCells = this.querySelectorAll('div.filterCondition'),
                    cellDelete,
                    createOr = document.getElementById('spawnCondition'),
                    currentOr,
                    i, key, lastDash;

                for(i=0; i<orCells.length; i++){
                    cellDelete = orCells[i].querySelectorAll('button.lightButton')[1]; //TODO fragile - don't ever change that class or loading breaks!
                    cellDelete.onclick();
                }

                for(key in currentFilter){
                    if(key.indexOf('last_written') != -1 ) continue;

                    createOr.onclick();

                    currentOr = this.querySelectorAll('div.filterCondition');
                    currentOr = currentOr[currentOr.length - 1];
                    //midas won't return a one element array, annoying...
                    if(currentFilter[key] instanceof Array){
                        for(i=0; i<currentFilter[key].length; i++){
                            lastDash = currentFilter[key][i].lastIndexOf('-');
                            currentOr.querySelectorAll('select')[i*2].value = currentFilter[key][i].slice(0,2);
                            currentOr.querySelectorAll('select')[i*2+1].value = currentFilter[key][i].slice(3,4);
                            currentOr.querySelectorAll('select')[i*2+1].onchange();
                            currentOr.querySelectorAll('input')[i*2].value = parseInt(currentFilter[key][i].slice(5,lastDash),10);
                            currentOr.querySelectorAll('input')[i*2+1].value = parseInt(currentFilter[key][i].slice(lastDash+1),10);

                            if(i<currentFilter[key].length-1)
                                currentOr.querySelectorAll('button.lightButton')[0].onclick();
                        }
                    } else {
                        lastDash = currentFilter[key][i].lastIndexOf('-');
                        currentOr.querySelectorAll('select')[0].value = currentFilter[key].slice(0,2);
                        currentOr.querySelectorAll('select')[1].value = currentFilter[key].slice(3,4);
                        currentOr.querySelectorAll('select')[1].onchange();
                        currentOr.querySelectorAll('input')[0].value = parseInt(currentFilter[key].slice(5,lastDash),10);
                        currentOr.querySelectorAll('input')[1].value = parseInt(currentFilter[key].slice(lastDash+1),10);                        
                    }

                }
            },

            'dumpFilterName' : function(){
                var filterName = document.getElementById('filterName');


                if(filterName && this.presets.indexOf(filterName.value) != -1)
                    filterName.value = '';
            }
        }
    });

})();
(function(){  

    xtag.register('widget-Filter', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var spawnCondition;

                this.filterConditions = [];

                this.conditionWrap = document.createElement('div');
                this.conditionWrap.setAttribute('id', 'conditionWrap');
                this.appendChild(this.conditionWrap);

                this.spawnFilterCondition();

                spawnCondition = document.createElement('button');
                spawnCondition.innerHTML = 'OR new condition';
                spawnCondition.setAttribute('class', 'stdin');
                spawnCondition.onclick = this.spawnFilterCondition.bind(this);
                this.appendChild(spawnCondition);
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
                    addNewRow = document.createElement('button'),
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

                addNewRow.setAttribute('id', 'addNewRow' + index);
                addNewRow.setAttribute('class', 'stdin addFilterCondition');
                addNewRow.innerHTML = 'AND new condition';
                addNewRow.onclick = this.addNewRow.bind(this, index);
                filterContent.appendChild(addNewRow);

                addNewRow.onclick();

                this.filterConditions.push(newCondition);
            },

            'addNewRow' : function(index){
                var row, cell;

                row = document.createElement('tr');
                document.getElementById('filterTable' + index).appendChild(row);

                cell = document.createElement('td');
                cell.innerHTML = 'AND';
                row.appendChild(cell);
            }
        }
    });

})();
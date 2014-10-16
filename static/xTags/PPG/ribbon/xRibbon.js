(function(){  

    xtag.register('x-ribbon', {
        extends: 'div',
        lifecycle: {
            created: function() {
                this.startRibbon = document.createElement('div')
                this.endRibbon = document.createElement('div')
                this.nCards = 0;
                this.uniqueIndex = 0;
                this.wrapperForm = document.createElement('form') 

                this.wrapperForm.setAttribute('id', this.id+'Wrapper');
                this.wrapperForm.setAttribute('class', 'ribbonWrapper');
                this.appendChild(this.wrapperForm);

                this.startRibbon.setAttribute('id', this.id+'StartRibbon');
                this.startRibbon.setAttribute('class', 'ribbon');
                this.startRibbon.setAttribute('style', 'border-radius: 1em 0em 0em 1em')
                this.wrapperForm.appendChild(this.startRibbon);

                this.endRibbon.setAttribute('id', this.id+'EndRibbon');
                this.endRibbon.setAttribute('class', 'ribbon');
                this.endRibbon.setAttribute('style', 'border-radius: 0em 1em 1em 0em')
                this.wrapperForm.appendChild(this.endRibbon);

                this.startRibbon.onclick = function(){
                    if(this.nCards == 0)
                        this.spawnCard(this.endRibbon)
                    else{
                        this.newNode(this.startRibbon.nextSibling);
                        this.spawnCard(this.startRibbon.nextSibling);
                    }
                }.bind(this);

                this.endRibbon.onclick = function(){
                    if(this.nCards == 0)
                        this.spawnCard(this.endRibbon)
                    else{
                        this.spawnCard(this.endRibbon);
                        this.newNode(this.endRibbon.previousSibling);
                    }
                }.bind(this);
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
            'spawnCard' : function(nextNode){
                var card = document.createElement('div');

                card.setAttribute('class', 'ribbonCard');
                this.cardConfig(card);
                this.wrapperForm.insertBefore(card, nextNode)

                this.nCards++;
                this.uniqueIndex++;
                if(this.wrapperForm.onchange)
                    this.wrapperForm.onchange();
                
            },

            'newNode' : function(nextNode){
                var ribbon = document.createElement('div');

                ribbon.setAttribute('class', 'ribbon');
                this.wrapperForm.insertBefore(ribbon, nextNode);
                ribbon.onclick = function(xRibbon){
                    xRibbon.newNode(this);
                    xRibbon.spawnCard(this);
                }.bind(ribbon, this);

            },

            'cardConfig' : function(targetElement){
                var remove = document.createElement('input'),
                    moveLater = document.createElement('input'),
                    moveEarlier = document.createElement('input'),
                    timingWrap = document.createElement('div'),
                    sortWrap = document.createElement('div'),
                    timeLabel = document.createElement('label'),
                    duration = document.createElement('input'),
                    durationUnits = document.createElement('select'),
                    unitOption, units = ['ms', 's', 'min'], unitScale = [1000, 1000000, 60000000],
                    durationSummary = document.createElement('span'),
                    list = document.createElement('ul'),
                    listItem, ppgOption, ppgLabel,
                    summaryState = document.getElementById('PPGtool').querySelectorAll('input[type="radio"]:checked')[0].value,
                    ppgName = ['Beam On', 'Output 2', 'Output 3', 'Move Tape',
                               'Output 5', 'Output 6', 'Output 7', 'HPGe Trigger',
                               'SCEPTAR Trigger', 'Si(Li) Trigger', 'LaBr3 Trigger', 'DESCANT Trigger',
                               'Indicate Background Counting', 'Output 14', 'All Triggers Enable1', 'All Triggers Enabled2'], 
                               // 'Clear Scalers' no longer used here
                    ppgCode = [0x0001, 0x0002, 0x0004, 0x0008,
                               0x0010, 0x0020, 0x0040, 0x0080, 
                               0x0100, 0x0200, 0x0400, 0x0800,
                               0x1000, 0x2000, 0xC000, 0xC000],
                    i;

                timingWrap.setAttribute('class', summaryState);
                timingWrap.setAttribute('id', 'timingWrap');
                targetElement.appendChild(timingWrap);

                sortWrap.setAttribute('class', 'PPGcardSorting');
                timingWrap.appendChild(sortWrap);

                moveEarlier.value = 'Earlier';
                moveEarlier.setAttribute('class', 'stdin');
                moveEarlier.setAttribute('type', 'button');
                moveEarlier.onclick = this.shuffleCardEarlier.bind(this, targetElement);
                sortWrap.appendChild(moveEarlier);

                remove.value = 'Remove';
                remove.setAttribute('class', 'stdin');
                remove.setAttribute('type', 'button');
                remove.onclick = this.deleteCard.bind(this, targetElement);
                sortWrap.appendChild(remove);

                moveLater.value = 'Later';
                moveLater.setAttribute('class', 'stdin');
                moveLater.setAttribute('type', 'button');
                moveLater.onclick = this.shuffleCardLater.bind(this, targetElement);
                sortWrap.appendChild(moveLater);

                timeLabel.innerHTML = 'Duration:';
                timingWrap.appendChild(timeLabel);
                duration.setAttribute('class', 'stdin');
                duration.setAttribute('type', 'number');
                duration.setAttribute('value', 0);
                duration.setAttribute('step', 'any');
                timingWrap.appendChild(duration);
                durationUnits.setAttribute('class', 'stdin');
                durationUnits.setAttribute('id', 'units' + this.uniqueIndex)
                timingWrap.appendChild(durationUnits);
                for(i=0; i<units.length; i++){
                    unitOption = document.createElement('option');
                    unitOption.innerHTML = units[i];
                    unitOption.value = unitScale[i];
                    durationUnits.appendChild(unitOption);
                }

                durationSummary.setAttribute('id', 'durationSummary');
                durationSummary.setAttribute('class', summaryState);
                targetElement.appendChild(durationSummary);

                list.setAttribute('class', summaryState);
                targetElement.appendChild(list);

                for(i=0; i<ppgName.length; i++){
                    listItem = document.createElement('li');
                    list.appendChild(listItem);

                    ppgOption = document.createElement('input');
                    ppgOption.setAttribute('type', 'checkbox');
                    ppgOption.setAttribute('class', summaryState);
                    ppgOption.setAttribute('id', 'uID' + this.uniqueIndex + 'ppg' + ppgCode[i].toString(16));
                    ppgOption.value = ppgCode[i];
                    listItem.appendChild(ppgOption);

                    ppgLabel = document.createElement('label');
                    ppgLabel.innerHTML = ppgName[i];
                    ppgLabel.setAttribute('for', 'uID' + this.uniqueIndex + 'ppg' + ppgCode[i].toString(16));
                    listItem.appendChild(ppgLabel);
                }

            },
        
            'deleteCard' : function(target){
                if(target.nextSibling.id !== this.id + 'EndRibbon')
                    target.nextSibling.remove();
                else
                    target.previousSibling.remove();
                target.remove();
                this.nCards--;
                this.wrapperForm.onchange();
            },

            'shuffleCardLater' : function(target){
                if(target.nextSibling.id == this.id+'EndRibbon') 
                    return //can't go any later

                this.wrapperForm.insertBefore(target.nextSibling, target.nextSibling.nextSibling.nextSibling);
                this.wrapperForm.insertBefore(target, target.nextSibling.nextSibling.nextSibling);
                this.wrapperForm.onchange();
            },

            'shuffleCardEarlier' : function(target){
                if(target.previousSibling.id == this.id+'StartRibbon') 
                    return //can't go any later

                this.wrapperForm.insertBefore(target.previousSibling, target.previousSibling.previousSibling);
                this.wrapperForm.insertBefore(target, target.previousSibling.previousSibling);
                this.wrapperForm.onchange();
            }
        },

    });

})();




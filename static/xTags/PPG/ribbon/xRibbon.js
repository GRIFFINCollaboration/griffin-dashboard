(function(){  

    xtag.register('x-ribbon', {
        extends: 'div',
        lifecycle: {
            created: function() {
                this.startRibbon = document.createElement('div')
                this.endRibbon = document.createElement('div')
                this.nCards = 0;
                this.uniqueIndex = 0;
                this.wrapperDiv = document.createElement('div') 

                this.wrapperDiv.setAttribute('id', this.id+'Wrapper');
                this.wrapperDiv.setAttribute('class', 'ribbonWrapper');
                this.appendChild(this.wrapperDiv);

                this.startRibbon.setAttribute('id', this.id+'StartRibbon');
                this.startRibbon.setAttribute('class', 'ribbon');
                this.startRibbon.setAttribute('style', 'border-radius: 1em 0em 0em 1em')
                this.wrapperDiv.appendChild(this.startRibbon);

                this.endRibbon.setAttribute('id', this.id+'EndRibbon');
                this.endRibbon.setAttribute('class', 'ribbon');
                this.endRibbon.setAttribute('style', 'border-radius: 0em 1em 1em 0em')
                this.wrapperDiv.appendChild(this.endRibbon);

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
            'cardConfig':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'spawnCard' : function(nextNode){
                var card = document.createElement('div');

                card.setAttribute('class', 'ribbonCard');
                this.cardConfig(card);
                this.wrapperDiv.insertBefore(card, nextNode)

                this.nCards++;
                this.uniqueIndex++;
            },

            'newNode' : function(nextNode){
                var ribbon = document.createElement('div');

                ribbon.setAttribute('class', 'ribbon');
                this.wrapperDiv.insertBefore(ribbon, nextNode);
                ribbon.onclick = function(xRibbon){
                    xRibbon.newNode(this);
                    xRibbon.spawnCard(this);
                }.bind(ribbon, this);

            },
/*
            'cardConfig' : function(targetElement){
                var demo = document.createElement('button');
                demo.innerHTML = 'Remove'
                demo.onclick = this.deleteCard.bind(this, targetElement);

                targetElement.appendChild(demo);
            },
*/
            'deleteCard' : function(target){
                if(target.nextSibling.id !== this.id + 'EndRibbon')
                    target.nextSibling.remove();
                else
                    target.previousSibling.remove();
                target.remove();
                this.nCards--;
            },

            'shuffleCardLater' : function(target){
                if(target.nextSibling.id == this.id+'EndRibbon') 
                    return //can't go any later

                this.wrapperDiv.insertBefore(target.nextSibling, target.nextSibling.nextSibling.nextSibling);
                this.wrapperDiv.insertBefore(target, target.nextSibling.nextSibling.nextSibling);
            },

            'shuffleCardEarlier' : function(target){
                if(target.previousSibling.id == this.id+'StartRibbon') 
                    return //can't go any later

                this.wrapperDiv.insertBefore(target.previousSibling, target.previousSibling.previousSibling);
                this.wrapperDiv.insertBefore(target, target.previousSibling.previousSibling);
            }
        },

    });

})();




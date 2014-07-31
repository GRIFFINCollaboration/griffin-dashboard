//navigation - auto populates with status page and custom pages
(function(){  

    xtag.register('widget-MSC', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h1'),
                    row, cell, i, j,
                    MSC = JSON.parse(this.MSC);

                window.refreshTargets = []

                this.GRIFFIN = document.createElement('table')
                this.SCEPTAR = document.createElement('table')
                this.DANTE = document.createElement('table')
                this.PACES = document.createElement('table')
                this.SPICE = document.createElement('table')
                this.ZDS = document.createElement('table')
                this.S2S3 = document.createElement('table')
                this.DESCANT = document.createElement('table')

                title.innerHTML = 'Canonical MSC Table'
                this.appendChild(title);            
console.log(this.MSC[0])
                for(j=0; j<this.MSC[0].length; j++){
                    console.log(MSC[0][j])
                    row = document.createElement('tr')
                    this.GRIFFIN.appendChild(row)
                    cell = document.createElement('td')
                    cell.innerHTML = MSC[0][j]
                    row.appendChild(cell)
                    cell = document.createElement('td')
                    cell.innerHTML = '0x'+MSC[1][j].toString(16);
                    row.appendChild(cell)
                }
                
                this.appendChild(this.GRIFFIN)

            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'MSC':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {

        }
    });

})();
//navigation - auto populates with status page and custom pages
(function(){  

    xtag.register('widget-MSC', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var title = document.createElement('h1'),
                    row, cell, MSC, i, j;

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

                //GRIFFIN
                for(i=0; i<16; i++){
                    MSC = module.exports.configGRIFFINclover(i, true);

                    for(j=0; j<MSC[0].length; j++){
                        row = document.createElement('tr')
                        this.GRIFFIN.appendChild(row)
                        cell = document.createElement('td')
                        cell.innerHTML = MSC[0][j]
                        row.appendChild(cell)
                        cell = document.createElement('td')
                        cell.innerHTML = MSC[1][j]
                        row.appendChild(cell)

                    }
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

        }, 
        methods: {

        }
    });

})();
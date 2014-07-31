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
                this.griffinTitle = document.createElement('caption')
                this.griffinTitle.innerHTML = 'GRIFFIN'
                this.GRIFFIN.appendChild(this.griffinTitle)

                this.SCEPTAR = document.createElement('table')
                this.sceptarTitle = document.createElement('caption')
                this.sceptarTitle.innerHTML = 'SCEPTAR'
                this.SCEPTAR.appendChild(this.sceptarTitle)

                this.DANTE = document.createElement('table')
                this.danteTitle = document.createElement('caption')
                this.danteTitle.innerHTML = 'DANTE'
                this.DANTE.appendChild(this.danteTitle)

                this.PACES = document.createElement('table')
                this.pacesTitle = document.createElement('caption')
                this.pacesTitle.innerHTML = 'PACES'
                this.PACES.appendChild(this.pacesTitle)

                this.SPICE = document.createElement('table')
                this.spiceTitle = document.createElement('caption')
                this.spiceTitle.innerHTML = 'SPICE'
                this.SPICE.appendChild(this.spiceTitle)

                this.ZDS = document.createElement('table')
                this.zdsTitle = document.createElement('caption')
                this.zdsTitle.innerHTML = 'ZDS'
                this.ZDS.appendChild(this.zdsTitle)

                this.S2S3 = document.createElement('table')
                this.s2s3Title = document.createElement('caption')
                this.s2s3Title.innerHTML = 'S2 / S3'
                this.S2S3.appendChild(this.s2s3Title)

                this.DESCANT = document.createElement('table')
                this.descantTitle = document.createElement('caption')
                this.descantTitle.innerHTML = 'DESCANT'
                this.DESCANT.appendChild(this.descantTitle)

                title.innerHTML = 'Canonical MSC Table'
                this.appendChild(title);            

                for(j=0; j<MSC[0].length; j++){
                    row = document.createElement('tr')
                    if(MSC[0][j].slice(0,2) == 'GR')
                        this.GRIFFIN.appendChild(row)
                    else if (MSC[0][j].slice(0,2) == 'SE')
                        this.SCEPTAR.appendChild(row)
                    else if (MSC[0][j].slice(0,2) == 'ZD')
                        this.ZDS.appendChild(row)
                    else if (MSC[0][j].slice(0,2) == 'DA')
                        this.DANTE.appendChild(row)
                    else if (MSC[0][j].slice(0,2) == 'PA')
                        this.PACES.appendChild(row)
                    else if (MSC[0][j].slice(0,3) == 'SPI')
                        this.SPICE.appendChild(row)
                    else if (MSC[0][j].slice(0,3) == 'SPE' || MSC[0][j].slice(0,3) == 'SPZ')
                        this.S2S3.appendChild(row)
                    else if (MSC[0][j].slice(0,2) == 'DS')
                        this.DESCANT.appendChild(row)
                    cell = document.createElement('td')
                    cell.innerHTML = MSC[0][j]
                    row.appendChild(cell)
                    cell = document.createElement('td')
                    cell.innerHTML = '0x'+MSC[1][j].toString(16);
                    row.appendChild(cell)
                }
                
                this.appendChild(this.GRIFFIN)
                this.appendChild(this.SCEPTAR)
                this.appendChild(this.DANTE)
                this.appendChild(this.PACES)
                this.appendChild(this.SPICE)
                this.appendChild(this.S2S3)
                this.appendChild(this.DESCANT)
                this.appendChild(this.ZDS)

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
(function(){  

    xtag.register('x-waffle', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i, j;

                this.wrap = document.createElement('div');

                ////////////////////////////
                //Members
                ////////////////////////////
                this.topMargin = 0.07*this.offsetHeight;
                this.leftMargin = 0.1*this.offsetWidth;

                ////////////////////////////
                //DOM Setup
                ////////////////////////////
                this.wrap.setAttribute('id', this.id+'Wrap');
                this.appendChild(this.wrap);

                //tooltip
                this.tooltip = document.createElement('div');
                this.tooltip.setAttribute('id', 'tooltip');
                this.appendChild(this.tooltip);

                ////////////////////////////
                //Kinetic.js setup
                ////////////////////////////
                //point kinetic at the div and set up the staging and layers:
                this.stage = new Kinetic.Stage({
                    container: this.id+'Wrap',
                    width: this.offsetWidth,
                    height: this.offsetHeight
                });
                this.mainLayer = new Kinetic.Layer();       //main rendering layer
                
                this.stage.add(this.mainLayer);

                this.errorPattern = new Image();
                this.errorPattern.src = 'static/img/static.gif'
                    
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

            'update': function(){
                this.mainLayer.draw();
                if(this.lastTTindex)   
                    this.writeTooltip(this.lastTTindex);
            },

            'instantiateCells': function(){
                var i, j, key, text, legendKey;

                //start fresh:
                this.mainLayer.destroyChildren();
                this.cells = {};
                this.grid = Math.min(0.8*this.offsetWidth/this.cols, 0.7*this.offsetHeight/this.rows);

                //default instantiation of single cells:
                for(i=0; i<this.cols; i++){
                    for(j=0; j<this.rows; j++){
                        this.cells[this.cellNames[j][i]] = new Kinetic.Rect({
                            x: this.leftMargin + i*this.grid,
                            y: this.topMargin + j*this.grid,
                            width: this.grid,
                            height: this.grid,
                            fill: '#111111',
                            stroke: 'black',
                            strokeWidth: 2,
                            fillPatternImage: this.errorPattern,
                            fillPatternOffsetX: 100*Math.random(),
                            fillPatternOffsetY: 100*Math.random()
                        });
                        //start on non-reporting
                        this.cells[this.cellNames[j][i]].setFillPriority('pattern');
                        //set up the tooltip listeners:
                        this.cells[this.cellNames[j][i]].on('mouseover', this.writeTooltip.bind(this, this.cellNames[j][i]) );
                        this.cells[this.cellNames[j][i]].on('mousemove', this.moveTooltip.bind(this) );
                        this.cells[this.cellNames[j][i]].on('mouseout', this.writeTooltip.bind(this, -1));

                        //set up onclick listeners:
                        if(this.clickCell)
                            this.cells[this.cellNames[j][i]].on('click', this.clickCell.bind(this, this.cellNames[j][i]) );

                        this.mainLayer.add(this.cells[this.cellNames[j][i]])
                    }
                }

                //overlay special composite cells:
                if(this.specials){
                    for(key in this.specials){
                        this.cells[key] = new Kinetic.Rect({
                            x: this.leftMargin + this.specials[key][1]*this.grid,
                            y: this.topMargin + this.specials[key][0]*this.grid,
                            width: this.grid*this.specials[key][2],
                            height: this.grid*this.specials[key][3],
                            fill: 'blue',
                            stroke: 'black',
                            strokeWidth: 2
                        });

                        //set up the tooltip listeners:
                        this.cells[key].on('mouseover', this.writeTooltip.bind(this, key) );
                        this.cells[key].on('mousemove', this.moveTooltip.bind(this) );
                        this.cells[key].on('mouseout', this.writeTooltip.bind(this, -1));

                        //set up onclick listeners:
                        if(this.clickCell)  
                            this.cells[key].on('click', this.clickCell.bind(this, key) );

                        this.mainLayer.add(this.cells[key]);

                        //remove 1x1 cells now hidden by overlays
                        //note this will break if any of the cells to be removed share a name with any other cell :/
                        for(i=this.specials[key][1]; i<this.specials[key][1]+this.specials[key][2]; i++){
                            for(j=this.specials[key][0]; j< this.specials[key][0]+this.specials[key][3]; j++){
                                this.cells[this.cellNames[j][i]].remove();
                            }
                        }

                    }
                }

                //overlay dividers:
                if(this.dividers){
                    for(key in this.dividers){
                        this.cells[key] = new Kinetic.Line({
                            points: [this.leftMargin + this.dividers[key][0]*this.grid, this.topMargin + this.dividers[key][1]*this.grid, this.leftMargin + this.dividers[key][2]*this.grid, this.topMargin + this.dividers[key][3]*this.grid],
                            stroke: 'black',
                            strokeWidth: 6
                        });

                        this.mainLayer.add(this.cells[key])
                    }
                }

                //column titles
                if(this.colTitles){
                    for(i=0; i<this.colTitles.length; i++){
                        text = new Kinetic.Text({
                                x: this.leftMargin + this.colTitles[i][1]*this.grid,
                                y: 0,
                                text: this.colTitles[i][0],
                                fontSize: Math.min(28, 1.7*this.colTitles[i][2]*this.grid / longestWord(this.colTitles[i][0]) ),
                                fontFamily: 'Arial',
                                fill: '#999999',
                                width: this.colTitles[i][2]*this.grid,
                                align: 'center'
                            });

                        //center label nicely
                        text.setAttr('y', this.topMargin - text.getHeight() - 5);

                        this.mainLayer.add(text);
                    }
                }

                //row titles
                if(this.rowTitles){
                    for(i=0; i<this.rowTitles.length; i++){
                        text = new Kinetic.Text({
                                x: 0,
                                y: this.topMargin + (i+0.5)*this.grid - 14,
                                text: this.rowTitles[i],
                                fontSize: Math.min(28, 1.7*this.leftMargin/longestWord(''+this.rowTitles[i])),
                                fontFamily: 'Arial',
                                fill: '#999999',
                            });

                        //center label nicely
                        text.setAttr('x', this.leftMargin - text.getWidth() - 10);

                        this.mainLayer.add(text);
                    } 
                }               

                //legend
                if(this.legend){
                    for(i=0; i<this.legend.length; i++){
                        legendKey = new Kinetic.Rect({
                                x: this.leftMargin + ((this.offsetWidth - this.leftMargin) / this.legend.length)*i,
                                y: this.topMargin + this.grid*(this.rows+0.5),
                                width: this.grid,
                                height: this.grid,
                                fill: this.legend[i][0],
                                stroke: 'black',
                                strokeWidth: 2
                            });
                        this.mainLayer.add(legendKey);

                        text = new Kinetic.Text({
                                x: this.leftMargin + ((this.offsetWidth - this.leftMargin) / this.legend.length)*i + this.grid + 10,
                                y: this.topMargin + this.grid*(this.rows+0.5) + this.grid/2 - 14,
                                text: this.legend[i][1],
                                fontSize: Math.min(28, 1.7*((this.offsetWidth - this.leftMargin) / this.legend.length - this.grid - 20)/longestWord(this.legend[i][1])),
                                fontFamily: 'Arial',
                                fill: '#999999',
                                width: (this.offsetWidth - this.leftMargin) / this.legend.length - this.grid - 10,
                                align: 'left'
                            });
                        //center label nicely
                        text.setAttr('y', this.topMargin + this.grid*(this.rows+0.5) + this.grid/2 - text.getHeight()/2 );

                        this.mainLayer.add(text);
                    }
                }

                this.mainLayer.draw();
            },

            //move the tooltip around
            'moveTooltip' : function(){
                var tt = document.getElementById('tooltip'),
                    mousePos = this.stage.getPointerPosition(),
                    offsetTop = 0, offsetLeft = 0,
                    left = mousePos.x,
                    top = mousePos.y,
                    element = this;

                do{
                    offsetTop += element.offsetTop || 0;
                    offsetLeft += element.offsetLeft || 0;
                    element = element.offsetParent;
                } while(element != this)

                left += offsetLeft;
                top += offsetTop;

                tt.setAttribute('style', 'display:block; z-index:10; position: absolute; left:' + left + '; top:' + top + ';');
            },

            //formulate the tooltip text for cell <name> and write it on the tooltip layer.
            'writeTooltip': function(name){
                var text, j, key;

                if(name!=-1){
                    text = name + '<br>';
                    if(this.TTdata && this.TTdata[name]){
                        for(key in this.TTdata[name]){
                            text += '<br>' + key + ': ' + this.TTdata[name][key]
                        }
                    }
                    if(text == name + '<br>') text = name;
                } else {
                    text = '';
                }

                this.lastTTindex = name;
                if(text != '')
                    document.getElementById('tooltip').innerHTML = text;
                else
                    document.getElementById('tooltip').setAttribute('style', '');
            }        
        }
    });

})();
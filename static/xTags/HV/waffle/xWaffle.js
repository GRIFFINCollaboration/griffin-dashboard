//status bar
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
            this.rows = 13;
            this.cols = 16;
            this.topMargin = 0.1*this.offsetHeight;
            this.leftMargin = 0.1*this.offsetWidth;
            this.grid = Math.min(0.9*this.offsetWidth/this.cols, 0.8*this.offsetHeight/this.rows);
            //multi-cell cells, [top left row, top left column, width, height]
            this.specials = {
                'test1': [0,0, 4,1],
                'test2': [0,4, 4,1],
                'test3': [0,8, 4,1],
                'test4': [0,12, 4,1]
            }
            //arbitrary bold lines, [starting grid pos x, starting grid pos y, end x, end y]
            this.dividers = {
                'first': [4,0, 4,13],
                'second': [8,0, 8,13],
                'third': [12,0, 12,13]
            }
            //names for each 1x1 cell; specials us their key as their name
            this.cellNames = [];
            for(i=0; i<this.rows; i++){
                this.cellNames[i] = []
                for(j=0; j<this.cols; j++){
                    this.cellNames[i][j] = 'test'+i+'_'+j;
                }
            }
            //information to report in the tooltip, keyed by name:
            this.TTdata = {};
            for(i=0; i<this.rows; i++){
                for(j=0; j<this.cols; j++){
                    this.TTdata[this.cellNames[i][j]] = {
                        'dummy': Math.random().toFixed(3)
                    }
                }
            }
            //function to call on cell click:
            this.clickCell = function(name){
                console.log(name);
            }
            //column titles; [text, x-left in grid coords, width in grid cells]
            this.colTitles = [
                ['blah blah blah blah blah', 0, 4],
                ['Card 1', 4, 4],
                ['Card 2', 8, 4],
                ['Card 3', 12, 4]
            ]
            //row titles, starting from the top
            this.rowTitles = [
                0,1,2,3,4,5,6,7,8,9,10,11,12      
            ]
            //legend
            this.legend = [
                ['green', 'All OK'],
                ['red', 'Alarm!'],
                ['yellow', 'Ramping'],
                ['0x222222', 'Off'],
                ['blue', 'Ext. Trip']
            ]


            ////////////////////////////
            //DOM Setup
            ////////////////////////////
            this.wrap.setAttribute('id', this.id+'Wrap');
            this.appendChild(this.wrap);

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
            this.tooltipLayer = new Kinetic.Layer();    //layer for tooltip info

            //tooltip background:
            this.TTbkg = new Kinetic.Rect({
                x:-1000,
                y:-1000,
                width:100,
                height:100,
                fill:'rgba(0,0,0,0.8)',
                stroke: 'rgba(0,0,0,0)',
                listening: false
            });
            this.tooltipLayer.add(this.TTbkg);

            //tooltip text:
            this.text = new Kinetic.Text({
                x: -1000,
                y: -1000,
                fontFamily: 'Arial',
                fontSize: 16,
                text: '',
                lineHeight: 1.2,
                fill: '#EEEEEE',
                listening: false
            });
            this.tooltipLayer.add(this.text);
            
            this.stage.add(this.mainLayer);
            this.stage.add(this.tooltipLayer);

            this.instantiateCells();
                
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

            'update': function(){
                
            },

            'instantiateCells': function(){
                var i, j, key, text, legendKey;

                //start fresh:
                this.mainLayer.destroyChildren();
                this.cells = {};

                //default instantiation of single cells:
                for(i=0; i<this.cols; i++){
                    for(j=0; j<this.rows; j++){
                        this.cells[this.cellNames[j][i]] = new Kinetic.Rect({
                            x: this.leftMargin + i*this.grid,
                            y: this.topMargin + j*this.grid,
                            width: this.grid,
                            height: this.grid,
                            fill: 'green',
                            stroke: 'black',
                            strokeWidth: 2
                        });

                        //set up the tooltip listeners:
                        this.cells[this.cellNames[j][i]].on('mouseover', this.writeTooltip.bind(this, this.cellNames[j][i]) );
                        this.cells[this.cellNames[j][i]].on('mousemove', this.moveTooltip.bind(this) );
                        this.cells[this.cellNames[j][i]].on('mouseout', this.writeTooltip.bind(this, -1));

                        //set up onclick listeners:
                        this.cells[this.cellNames[j][i]].on('click', this.clickCell.bind(this, this.cellNames[j][i]) );

                        this.mainLayer.add(this.cells[this.cellNames[j][i]])
                    }
                }

                //overlay special composite cells:
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
                    this.cells[key].on('click', this.clickCell.bind(this, key) );

                    this.mainLayer.add(this.cells[key])
                }

                //overlay dividers:
                for(key in this.dividers){
                    this.cells[key] = new Kinetic.Line({
                        points: [this.leftMargin + this.dividers[key][0]*this.grid, this.topMargin + this.dividers[key][1]*this.grid, this.leftMargin + this.dividers[key][2]*this.grid, this.topMargin + this.dividers[key][3]*this.grid],
                        stroke: 'black',
                        strokeWidth: 6
                    });

                    this.mainLayer.add(this.cells[key])
                }

                //column titles
                for(i=0; i<this.colTitles.length; i++){
                    text = new Kinetic.Text({
                            x: this.leftMargin + this.colTitles[i][1]*this.grid,
                            y: 0,
                            text: this.colTitles[i][0],
                            fontSize: 28,
                            fontFamily: 'Arial',
                            fill: '#999999',
                            width: this.colTitles[i][2]*this.grid,
                            align: 'center'
                        });

                    //center label nicely
                    text.setAttr('y', this.topMargin - text.getHeight() - 5);

                    this.mainLayer.add(text);
                }

                //row titles
                for(i=0; i<this.rowTitles.length; i++){
                    text = new Kinetic.Text({
                            x: 0,
                            y: this.topMargin + (i+0.5)*this.grid - 14,
                            text: this.rowTitles[i],
                            fontSize: 28,
                            fontFamily: 'Arial',
                            fill: '#999999',
                        });

                    //center label nicely
                    text.setAttr('x', this.leftMargin - text.getWidth() - 10);

                    this.mainLayer.add(text);
                }                

                //legend
                for(i=0; i<this.legend.length; i++){
                    legendKey = new Kinetic.Rect({
                            x: (this.offsetWidth / this.legend.length)*i,
                            y: 0.92*this.offsetHeight,
                            width: this.grid,
                            height: this.grid,
                            fill: this.legend[i][0],
                            stroke: 'black',
                            strokeWidth: 2
                        });
                    this.mainLayer.add(legendKey);

                    text = new Kinetic.Text({
                            x: (this.offsetWidth / this.legend.length)*i + this.grid + 10,
                            y: 0.92*this.offsetHeight + this.grid/2 - 14,
                            text: this.legend[i][1],
                            fontSize: 28,
                            fontFamily: 'Arial',
                            fill: '#999999',
                            width: this.offsetWidth / this.legend.length - this.grid - 10,
                            align: 'left'
                        });
                    this.mainLayer.add(text);
                }


                this.mainLayer.draw();
            },

            //move the tooltip around
            'moveTooltip': function(){
                var mousePos = this.stage.getPointerPosition(),
                    TTwidth = this.TTbkg.getAttr('width'),
                    TTheight = this.TTbkg.getAttr('height');

                //adjust the background size & position
                this.TTbkg.setAttr( 'x', Math.min(mousePos.x + 10, this.offsetWidth - TTwidth) );
                this.TTbkg.setAttr( 'y', Math.min(mousePos.y + 10, this.offsetHeight - TTheight) );
                //make text follow the mouse too
                this.text.setAttr( 'x', Math.min(mousePos.x + 20, this.offsetWidth - TTwidth + 10) );
                this.text.setAttr( 'y', Math.min(mousePos.y + 20, this.offsetHeight - TTheight) ); 

                this.tooltipLayer.draw();
            },

            //formulate the tooltip text for cell <name> and write it on the tooltip layer.
            'writeTooltip': function(name){
                var text, j, key;

                if(name!=-1){
                    text = name;
                    for(key in this.TTdata[name]){
                        text += '\n' + key + ': ' + this.TTdata[name][key]
                    }
                } else {
                    text = '';
                }
                this.lastTTindex = name;
                this.text.setText(text);
                if(text != ''){
                    //adjust the background size
                    this.TTbkg.setAttr( 'width', this.text.getAttr('width') + 20 );
                    this.TTbkg.setAttr( 'height', this.text.getAttr('height') + 20 ); 
                } else {
                    this.TTbkg.setAttr('width', 0);
                    this.TTbkg.setAttr('height', 0);                    
                }
                this.tooltipLayer.draw();
            }            
        }
    });

})();
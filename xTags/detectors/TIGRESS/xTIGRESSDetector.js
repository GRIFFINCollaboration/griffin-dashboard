//status bar
(function(){  

    xtag.register('detector-TIGRESS', {
        //prototype: Object.create(HTMLElement.prototype),
        extends: 'detector-template',
        lifecycle: {
            created: function() {
                //need to build up names of all ~1000 channels:
                var channels = [], i, j, k,
                    HPGEprefixes = ['TIG01', 'TIG02', 'TIG03', 'TIG04', 'TIG05', 'TIG06', 'TIG07', 'TIG08', 'TIG09', 'TIG10', 'TIG11', 'TIG12', 'TIG13', 'TIG14', 'TIG15', 'TIG16'],
                    colors = ['R', 'G', 'B', 'W'],
                    HPGEcellCodes = ['N00A', 'N00B', 'P01X', 'P02X,', 'P03X', 'P04X,', 'P05X', 'P06X,', 'P07X', 'P08X,'],
                    BGOprefixes = ['TIS01', 'TIS02', 'TIS03', 'TIS04', 'TIS05', 'TIS06', 'TIS07', 'TIS08', 'TIS09', 'TIS10', 'TIS11', 'TIS12', 'TIS13', 'TIS14', 'TIS15', 'TIS16'],
                    BGOcellCodes = ['N01X', 'N02X', 'N03X', 'N04X', 'N05X'],
                    //throw in URLs while we're at it:
                    URLs = [this.thresholdServer,    //threshold server
                            this.rateServer,             //rate server
                            'http://'+window.location.host+'/?cmd=jcopy&odb0=Equipment/&encoding=json-p-nokeys&callback=fetchODBEquipment'];  //ODB Equipment tree

                //build up channel names
                for(i=0; i<HPGEprefixes.length; i++){
                    for(j=0; j<colors.length; j++){
                        for(k=0; k<HPGEcellCodes.length; k++){
                            channels[channels.length] = HPGEprefixes[i] + colors[j] + HPGEcellCodes[k];
                        }
                        for(k=0; k<BGOcellCodes.length; k++){
                            channels[channels.length] = BGOprefixes[i] + colors[j] + BGOcellCodes[k];
                        }
                    }
                }

                //deploy the standard stuff
                initializeDetector.bind(this, 'TIGRESS', channels, 'TIGRESS', URLs, ['Main', 'TIG01', 'TIG02', 'TIG03', 'TIG04', 'TIG05', 'TIG06', 'TIG07', 'TIG08', 'TIG09', 'TIG10', 'TIG11', 'TIG12', 'TIG13', 'TIG14', 'TIG15', 'TIG16'])();

                //////////////////////////////////////
                //TIGRESS specific drawing parameters
                //////////////////////////////////////
    
                //TIGRESS clovers are laid out on a 24x24 square grid.
                this.grid = this.height*0.8/24;

                /////////////////////////////
                //Initialize visualization
                /////////////////////////////
                //initialize all the cells:
                this.instantiateCells();
                //generate the color scale
                //this.generateColorScale();

            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'rateServer':{
                attribute: {} //this just needs to be declared
            },
            'thresholdServer':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            'instantiateCells': function(){
                
                var i, cardIndex, cellKey,
                    g = this.grid, 
                    cellCoords = {};

                //vertices of cells, keyed by last 5 characters 
                //Green HPGE
                cellCoords['GN00A'] = [8*g,10*g, 8*g,8*g, 10*g,8*g];
                cellCoords['GN00B'] = [8*g,10*g, 10*g,10*g, 10*g,8*g];
                cellCoords['GP01X'] = [8*g,9*g, 7*g,9*g, 7*g,7*g, 9*g,7*g, 9*g,8*g, 8*g,8*g];
                cellCoords['GP02X'] = [8*g,9*g, 7*g,9*g, 7*g,11*g, 9*g,11*g, 9*g,10*g, 8*g,10*g];
                cellCoords['GP03X'] = [9*g,10*g, 10*g,10*g, 10*g,9*g, 11*g,9*g, 11*g,11*g, 9*g,11*g];
                cellCoords['GP04X'] = [10*g,9*g, 10*g,8*g, 9*g,8*g, 9*g,7*g, 11*g,7*g, 11*g,9*g];
                cellCoords['GP05X'] = [7*g,9*g, 6*g,9*g, 6*g,6*g, 9*g,6*g, 9*g,7*g, 7*g,7*g];
                cellCoords['GP06X'] = [7*g,9*g, 6*g,9*g, 6*g,12*g, 9*g,12*g, 9*g,11*g, 7*g,11*g];
                cellCoords['GP07X'] = [9*g,12*g, 12*g,12*g, 12*g,9*g, 11*g,9*g, 11*g,11*g, 9*g,11*g];
                cellCoords['GP08X'] = [11*g,9*g, 12*g,9*g, 12*g,6*g, 9*g,6*g, 9*g,7*g, 11*g,7*g];
                //Blue HPGE
                cellCoords['BN00A'] = [16*g,10*g, 16*g,8*g, 14*g,8*g];
                cellCoords['BN00B'] = [14*g,8*g, 14*g,10*g, 16*g,10*g];
                cellCoords['BP02X'] = [14*g,9*g, 13*g,9*g, 13*g,7*g, 15*g,7*g, 15*g,8*g, 14*g,8*g];
                cellCoords['BP03X'] = [14*g,9*g, 13*g,9*g, 13*g,11*g, 15*g,11*g, 15*g,10*g, 14*g,10*g];
                cellCoords['BP04X'] = [15*g,10*g, 16*g,10*g, 16*g,9*g, 17*g,9*g, 17*g,11*g, 15*g,11*g];
                cellCoords['BP01X'] = [16*g,9*g, 16*g,8*g, 15*g,8*g, 15*g,7*g, 17*g,7*g, 17*g,9*g];
                cellCoords['BP06X'] = [13*g,9*g, 12*g,9*g, 12*g,6*g, 15*g,6*g, 15*g,7*g, 13*g,7*g];
                cellCoords['BP07X'] = [13*g,9*g, 12*g,9*g, 12*g,12*g, 15*g,12*g, 15*g,11*g, 13*g,11*g];
                cellCoords['BP08X'] = [15*g,12*g, 18*g,12*g, 18*g,9*g, 17*g,9*g, 17*g,11*g, 15*g,11*g];
                cellCoords['BP05X'] = [17*g,9*g, 18*g,9*g, 18*g,6*g, 15*g,6*g, 15*g,7*g, 17*g,7*g];
                //White HPGE
                cellCoords['WN00B'] = [14*g,16*g, 14*g,14*g, 16*g,14*g];
                cellCoords['WN00A'] = [14*g,16*g, 16*g,16*g, 16*g,14*g];
                cellCoords['WP03X'] = [14*g,15*g, 13*g,15*g, 13*g,13*g, 15*g,13*g, 15*g,14*g, 14*g,14*g];
                cellCoords['WP04X'] = [14*g,15*g, 13*g,15*g, 13*g,17*g, 15*g,17*g, 15*g,16*g, 14*g,16*g];
                cellCoords['WP01X'] = [15*g,16*g, 16*g,16*g, 16*g,15*g, 17*g,15*g, 17*g,17*g, 15*g,17*g];
                cellCoords['WP02X'] = [16*g,15*g, 16*g,14*g, 15*g,14*g, 15*g,13*g, 17*g,13*g, 17*g,15*g];
                cellCoords['WP07X'] = [13*g,15*g, 12*g,15*g, 12*g,12*g, 15*g,12*g, 15*g,13*g, 13*g,13*g];
                cellCoords['WP08X'] = [13*g,15*g, 12*g,15*g, 12*g,18*g, 15*g,18*g, 15*g,17*g, 13*g,17*g];
                cellCoords['WP05X'] = [15*g,18*g, 18*g,18*g, 18*g,15*g, 17*g,15*g, 17*g,17*g, 15*g,17*g];
                cellCoords['WP06X'] = [17*g,15*g, 18*g,15*g, 18*g,12*g, 15*g,12*g, 15*g,13*g, 17*g,13*g];
                //Red HPGE
                cellCoords['RN00B'] = [10*g,16*g, 10*g,14*g, 8*g,14*g];
                cellCoords['RN00A'] = [8*g,14*g, 8*g,16*g, 10*g,16*g];
                cellCoords['RP04X'] = [8*g,15*g, 7*g,15*g, 7*g,13*g, 9*g,13*g, 9*g,14*g, 8*g,14*g];
                cellCoords['RP01X'] = [8*g,15*g, 7*g,15*g, 7*g,17*g, 9*g,17*g, 9*g,16*g, 8*g,16*g];
                cellCoords['RP02X'] = [9*g,16*g, 10*g,16*g, 10*g,15*g, 11*g,15*g, 11*g,17*g, 9*g,17*g];
                cellCoords['RP03X'] = [10*g,15*g, 10*g,14*g, 9*g,14*g, 9*g,13*g, 11*g,13*g, 11*g,15*g];
                cellCoords['RP08X'] = [7*g,15*g, 6*g,15*g, 6*g,12*g, 9*g,12*g, 9*g,13*g, 7*g,13*g];
                cellCoords['RP05X'] = [7*g,15*g, 6*g,15*g, 6*g,18*g, 9*g,18*g, 9*g,17*g, 7*g,17*g];
                cellCoords['RP06X'] = [9*g,18*g, 12*g,18*g, 12*g,15*g, 11*g,15*g, 11*g,17*g, 9*g,17*g];
                cellCoords['RP07X'] = [11*g,15*g, 12*g,15*g, 12*g,12*g, 9*g,12*g, 9*g,13*g, 11*g,13*g];
                //Green BGO
                cellCoords['GN05X'] = [5*g,12*g, 4*g,12*g, 4*g,4*g, 12*g,4*g, 12*g,5*g, 5*g,5*g];
                cellCoords['GN04X'] = [3*g,12*g, 2*g,12*g, 2*g,2*g, 3*g,3*g];
                cellCoords['GN03X'] = [2*g,2*g, 12*g,2*g, 12*g,3*g, 3*g,3*g];
                cellCoords['GN02X'] = [1*g,12*g, 0*g,12*g, 0*g,1*g, 1*g,2*g];
                cellCoords['GN01X'] = [1*g,0*g, 12*g,0*g, 12*g,1*g, 2*g,1*g];
                //Blue BGO
                cellCoords['BN05X'] = [23*g,12*g, 24*g,12*g, 24*g,4*g, 12*g,4*g, 12*g,5*g, 23*g,5*g];
                cellCoords['BN04X'] = [12*g,3*g, 12*g,2*g, 22*g,2*g, 21*g,3*g];
                cellCoords['BN03X'] = [21*g,12*g, 22*g,12*g, 22*g,2*g, 21*g,3*g];
                cellCoords['BN02X'] = [12*g,0*g, 12*g,1*g, 22*g,1*g, 23*g,0*g];
                cellCoords['BN01X'] = [24*g,12*g, 23*g,12*g, 23*g,2*g, 24*g,1*g];
                //White BGO
                cellCoords['WN05X'] = [12*g,19*g, 12*g,20*g, 20*g,20*g, 20*g,12*g, 19*g,12*g, 19*g,19*g];
                cellCoords['WN04X'] = [21*g,12*g, 22*g,12*g, 22*g,22*g, 21*g,21*g];
                cellCoords['WN03X'] = [22*g,22*g, 12*g,22*g, 12*g,21*g, 21*g,21*g];
                cellCoords['WN02X'] = [24*g,23*g, 23*g,22*g, 23*g,12*g, 24*g,12*g];
                cellCoords['WN01X'] = [23*g,24*g, 22*g,23*g, 12*g,23*g, 12*g,24*g];
                //Red BGO
                cellCoords['RN05X'] = [12*g,19*g, 12*g,20*g, 4*g,20*g, 4*g,12*g, 5*g,12*g, 5*g,19*g];
                cellCoords['RN04X'] = [12*g,21*g, 12*g,22*g, 2*g,22*g, 3*g,21*g];
                cellCoords['RN03X'] = [3*g,21*g, 2*g,22*g, 2*g,12*g, 3*g,12*g];
                cellCoords['RN02X'] = [12*g,24*g, 12*g,23*g, 2*g,23*g, 1*g,24*g];
                cellCoords['RN01X'] = [0*g,12*g, 1*g,12*g, 1*g,22*g, 0*g,23*g];

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){

                    //determine which card this cell belongs to:
                    cardIndex = parseInt( this.channelNames[i].slice(3,5) ,10);
                    cellKey = this.channelNames[i].slice(5);

                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: cellCoords[cellKey],
                        fill: '#000000',
                        fillPatternImage: this.errorPattern,
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    //this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    //this.cells[this.channelNames[i]].on('mousemove', this.moveTooltip.bind(this) );
                    //this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //set up onclick listeners:
                    //this.cells[this.channelNames[i]].on('click', this.clickCell.bind(this, this.channelNames[i]) );

                    //add the cell to the appropriate main layer
                    console.log(this.mainLayer[cardIndex].add(this.cells[this.channelNames[i]]));
                }

                //add the layers to the stage
                for(i=0; i<17; i++){
                    this.stage[i].add(this.mainLayer[i]);
                    this.stage[i].add(this.tooltipLayer[i]);
                }
                
            }
        }
    });

})();

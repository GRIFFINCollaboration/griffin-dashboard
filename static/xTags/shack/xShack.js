(function(){  
	/*widget-Shack originally from Lisa Morrison, https://github.com/GRIFFINCollaboration/GRIFFINshackStatus*/
    xtag.register('widget-Shack', {
        extends: 'div',
        lifecycle: {
            created: function() {
            	var title = document.createElement('h1'),
            		shackWrap = document.createElement('div'),
            		tooltip = document.createElement('div'),
            		i;

            	shackWrap.setAttribute('id', 'shackStatusWrap');
            	this.appendChild(shackWrap);

            	title.innerHTML = 'Shack Status';
            	shackWrap.appendChild(title);

            	tooltip.setAttribute('id', 'tooltip');
            	this.appendChild(tooltip);

            	///////////////////////////////////////////////////////////////////
            	// tooltipContent is a table of objects for populating the tooltip.
            	// each array element is a simple object ala: {key: value, ...}
            	// indices 0-4: top temperature sensors
            	// 5-9: bottom temperature sensors
            	///////////////////////////////////////////////////////////////////

            	this.tooltipContent = [];
            	this.flag = [];

        
            	this.renderRacks();
                this.update();
            },

            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 

        events: { 
        },

        accessors: {
            'SOH':{
                attribute: {} //this just needs to be declared
            }
        }, 

        methods: {

			////////////////////////////////////////////////////////////////////////
			// This function constructs the GRIFFIN electronics shack web interface.
			////////////////////////////////////////////////////////////////////////

			'renderRacks' : function(){

				var width = document.getElementById('shackStatusWrap').offsetWidth,
					height = 0.8*window.innerHeight,
					grid = Math.min(width/100, height/62),  //20*5 wide, 56+2+2+2 tall
					label = {},
					leftmargin = (width - 100*grid)/2,
					topmargin = (height - 62*grid)/2,
					i;

				this.rackImage = {};
				this.cells = {};
				this.parameters = {	label:{
										font: 'Arial',
										fontcolour: 'black',
										maxFontSize: 2*grid
									},

									sensors:{
				    					width: 16*grid,
										height: 2*grid,
										stroke: 'black',
										strokeW: 2,
										fill: 'lightgray',
										opacity: 0.6									
									},

									hv:{
										width: 20*grid,
										height: 8*grid,
										fill: 'lightslategray',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.6										
									},

									nim:{
										width: 20*grid,
										height: 5*grid,
										fill: 'lightsteelblue',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.77
									},

									vme:{
										width: 20*grid,
										height: 8*grid,
										fill: 'powderblue',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.6										
									},

									dsa:{
										width: 20*grid,
										height: 6*grid,
										fill: 'silver',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.7										
									},

									net:{
										width: 20*grid,
										height: 1*grid,
										fill: 'slategray',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.7
									},

									comp:{
										width: 20*grid,
										height: 2*grid,
										fill: 'steelblue',
										stroke: 'black',
										strokeW: 2,
										opacity: 0.6										
									},

									widthlab: 8*grid
				};

			    /////////////////////////////////////////////////////////
			    // Kinetic.js is setup to create the initial environment.
			    /////////////////////////////////////////////////////////

				this.rackImage.stage = new Kinetic.Stage({
			        container: 'shackStatusWrap',
			        width: width,
			        height: height
			    });

				////////////////////////////////////////////////////////
				// The main layer is made which will contain all of the
				// fixed racks and crates for the shack.
			    ////////////////////////////////////////////////////////

				this.rackImage.mainLayer = new Kinetic.Layer();
				this.rackImage.stage.add(this.rackImage.mainLayer);

			    ////////////////////////////////////////////
				// The this.cells.racks loop sets up the 5 racks.
			    ////////////////////////////////////////////

			   	this.cells.racks = [];

			    for (i = 0; i < 5; i++){
					this.cells.racks[i] = new Kinetic.Rect({
						x: leftmargin+20*i*grid,
						y: topmargin+4*grid,
						width: 20*grid,
						height: 56*grid,
						fill: 'white',
						stroke: 'black',
						strokeWidth: 2,
						opacity: 1
					});
				}    

				/////////////////////////////////////////////////////////
				// Setting the content of the temperature sensor tooltip.
				/////////////////////////////////////////////////////////				

				this.cells.sensorstop = [];
				this.cells.sensorsbottom = [];

			    for (i = 0; i < 5; i++){

					this.cells.sensorstop[i] = new Kinetic.Rect({
						x: leftmargin+(2+20*i)*grid,
						y: topmargin + 2*grid,
						width: this.parameters.sensors.width,
						height: this.parameters.sensors.height,
						fill: this.parameters.sensors.fill,
						stroke: this.parameters.sensors.stroke,
						strokeWidth: this.parameters.sensors.strokeW,
						opacity: this.parameters.sensors.opacity,
					}),

					this.cells.sensorstop[i].on('mouseover', this.writeTooltip.bind(this, i ) );
					this.cells.sensorstop[i].on('mousemove', this.moveTooltip);
					this.cells.sensorstop[i].on('mouseout', this.writeTooltip.bind(this, -1) );

					this.cells.sensorsbottom[i] = new Kinetic.Rect({
						x: leftmargin+(2+20*i)*grid,
						y: topmargin+60*grid,
						width: this.parameters.sensors.width,
						height: this.parameters.sensors.height,
						fill: this.parameters.sensors.fill,
						stroke: this.parameters.sensors.stroke,
						strokeWidth: this.parameters.sensors.strokeW,
						opacity: this.parameters.sensors.opacity,
					}),

					this.cells.sensorsbottom[i].on('mouseover', this.writeTooltip.bind(this, i+5 ) );
					this.cells.sensorsbottom[i].on('mousemove', this.moveTooltip);
					this.cells.sensorsbottom[i].on('mouseout', this.writeTooltip.bind(this, -1) );

				}

			    ///////////////////////////////////////
			    // Cable management sections are added.
			    ///////////////////////////////////////

			   	this.cells.widthcableman = 20*grid;
			   	this.cells.heightcableman = 1*grid;
			   	this.cells.fillcableman = 'dimgray';
			   	this.cells.strokecableman = 'black';
			   	this.cells.strokeWcableman = 2;
			   	this.cells.opacitycableman = 0.6;

			   	this.cells.cableman = [];

				for (i = 0; i < 4; i++){
			        this.cells.cableman[i] = new Kinetic.Rect({
			            x: leftmargin+20*i*grid,
			            y: topmargin+19*grid,
						width: this.cells.widthcableman,
						height: this.cells.heightcableman,
						fill: this.cells.fillcableman,
						stroke: this.cells.strokeWcableman,
						strokeWidth: this.cells.strokeWcableman,
						opacity: this.cells.opacitycableman
					});
				}   

				for (i = 4; i < 8; i++){
			        this.cells.cableman[i] = new Kinetic.Rect({
			            x: leftmargin+20*(i-4)*grid,
			            y: topmargin+28*grid,
						width: this.cells.widthcableman,
						height: this.cells.heightcableman,
						fill: this.cells.fillcableman,
						stroke: this.cells.strokecableman,
						strokeWidth: this.cells.strokeWcableman,
						opacity: this.cells.opacitycableman
					});
				} 

				for (i = 8; i < 10; i++){
			        this.cells.cableman[i] = new Kinetic.Rect({
			            x: leftmargin+(40+20*(i-8))*grid,
			            y: topmargin+32*grid,
						width: this.cells.widthcableman,
						height: this.cells.heightcableman,
						fill: this.cells.fillcableman,
						stroke: this.cells.strokecableman,
						strokeWidth: this.cells.strokeWcableman,
						opacity: this.cells.opacitycableman
					});
				} 

				for (i = 10; i < 12; i++){
			        this.cells.cableman[i] = new Kinetic.Rect({
			            x: leftmargin+(40+20*(i-10))*grid,
			            y: topmargin+41*grid,
						width: this.cells.widthcableman,
						height: this.cells.heightcableman,
						fill: this.cells.fillcableman,
						stroke: this.cells.strokecableman,
						strokeWidth: this.cells.strokeWcableman,
						opacity: this.cells.opacitycableman
					});
				} 

				for (i = 12; i < 14; i++){
			        this.cells.cableman[i] = new Kinetic.Rect({
			            x: leftmargin+40*grid,
			            y: topmargin+(43+9*(i-12))*grid,
						width: this.cells.widthcableman,
						height: this.cells.heightcableman,
						fill: this.cells.fillcableman,
						stroke: this.cells.strokecableman,
						strokeWidth: this.cells.strokeWcableman,
						opacity: this.cells.opacitycableman
					});
				} 

				this.cells.cableman14 = new Kinetic.Rect({
					x: leftmargin+40*grid,
					y: topmargin+30*grid,
					width: this.cells.widthcableman,
					height: this.cells.heightcableman,
					fill: this.cells.fillcableman,
					stroke: this.cells.strokecableman,
					strokeWidth: this.cells.strokeWcableman,
					opacity: this.cells.opacitycableman
				});

				this.cells.hv0 = new Kinetic.Rect({
					x: leftmargin + 20*grid,
					y: topmargin+4*grid,
					width: this.parameters.hv.width,
					height: this.parameters.hv.height,
					fill: this.parameters.hv.fill,
					stroke: this.parameters.hv.stroke,
					strokeWidth: this.parameters.hv.strokeW,
					opacity: this.parameters.hv.opacity
				});

			    label.hv0 = new Kinetic.Text({
			   		x: leftmargin + 20*grid,
			       	y: topmargin+4*grid,
			       	width: this.parameters.hv.width,
			      	text: 'HV 1',
			       	fontSize: this.parameters.label.maxFontSize,
			       	fontFamily: this.parameters.label.font,
			       	fill: this.parameters.label.fontcolour,
			       	padding: this.parameters.hv.height*0.3,
			        align: 'center',
			        listening: false
			   	});

				this.cells.hv0.on('mouseover', this.writeTooltip.bind(this, 10 ) );
				this.cells.hv0.on('mousemove', this.moveTooltip);
				this.cells.hv0.on('mouseout', this.writeTooltip.bind(this, -1) );
			   	squishFont(label.hv0, 18*grid);

				this.cells.hv = [];
				label.hv = [];

				for (i = 1; i < 3; i++){
			        this.cells.hv[i] = new Kinetic.Rect({
			            x: leftmargin+(60+20*(i-1))*grid,
			            y: topmargin+4*grid,
						width: this.parameters.hv.width,
						height: this.parameters.hv.height,
						fill: this.parameters.hv.fill,
						stroke: this.parameters.hv.stroke,
						strokeWidth: this.parameters.hv.strokeW,
						opacity: this.parameters.hv.opacity
					}),

			        label.hv[i] = new Kinetic.Text({
			            x: leftmargin+(60+20*(i-1))*grid,
			            y: topmargin+4*grid,
			            width: this.parameters.hv.width,
			            text: 'HV '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.hv.height*0.3,
			            align: 'center',
			            listening: false
			      	});

			      	this.cells.hv[i].on('mouseover', this.writeTooltip.bind(this, i+10) );
					this.cells.hv[i].on('mousemove', this.moveTooltip);
					this.cells.hv[i].on('mouseout', this.writeTooltip.bind(this, -1) );
					squishFont(label.hv[i], 18*grid);
				}

				//////////////////////////////////////////////////////////////////////////////
				// NIM crates are included next and numbered in the same way as the HV crates.
				//////////////////////////////////////////////////////////////////////////////

				this.cells.nim = [];
				label.nim =[];

				for (i = 0; i < 5; i++){
			        this.cells.nim[i] = new Kinetic.Rect({
			            x: leftmargin+20*i*grid,
			            y: topmargin+13*grid,
						width: this.parameters.nim.width,
						height: this.parameters.nim.height,
						fill: this.parameters.nim.fill,
						stroke: this.parameters.nim.stroke,
						strokeWidth: this.parameters.nim.strokeW,
						opacity: this.parameters.nim.opacity
					}),

					label.nim[i] = new Kinetic.Text({
			            x: leftmargin+20*i*grid,
			            y: topmargin+13*grid,
			            width: this.parameters.nim.width,
			            text: 'NIM '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.nim.height*0.25,
			            align: 'center',
			            listening: false
			        });

			        this.cells.nim[i].on('mouseover', this.writeTooltip.bind(this, i+13 ) );
					this.cells.nim[i].on('mousemove', this.moveTooltip);
					this.cells.nim[i].on('mouseout', this.writeTooltip.bind(this, -1) );
			        squishFont(label.nim[i], 18*grid);
				} 

				for (i = 5; i < 7; i++){
					this.cells.nim[i] = new Kinetic.Rect({
						x: leftmargin+60*grid,
						y: topmargin+(47+8*(i-5))*grid,
						width: this.parameters.nim.width,
						height: this.parameters.nim.height,
						fill: this.parameters.nim.fill,
						stroke: this.parameters.nim.stroke,
						strokeWidth: this.parameters.nim.strokeW,
						opacity: this.parameters.nim.opacity
					}),

			        label.nim[i] = new Kinetic.Text({
			            x: leftmargin+60*grid,
			            y: topmargin+(47+8*(i-5))*grid,
			            width: this.parameters.nim.width,
			            text: 'NIM '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.nim.height*0.25,
			            align: 'center',
			            listening: false
			      	});

			      	this.cells.nim[i].on('mouseover', this.writeTooltip.bind(this, i+13 ) );
					this.cells.nim[i].on('mousemove', this.moveTooltip);
					this.cells.nim[i].on('mouseout', this.writeTooltip.bind(this, -1) );
			      	squishFont(label.nim[i], 18*grid);
				}

				////////////////////////////////////////////////////
				// VME crates are added next and numbered as before.
				////////////////////////////////////////////////////	

				this.cells.vme = [];
				label.vme = [];

				for (i = 0; i < 4; i++){
					this.cells.vme[i] = new Kinetic.Rect({
						x: leftmargin+20*i*grid,
						y: topmargin+20*grid,
						width: this.parameters.vme.width,
						height: this.parameters.vme.height,
						fill: this.parameters.vme.fill,
						stroke: this.parameters.vme.stroke,
						strokeWidth: this.parameters.vme.strokeW,
						opacity: this.parameters.vme.opacity
					}),

				    label.vme[i] = new Kinetic.Text({
			            x: leftmargin+20*i*grid,
			            y: topmargin+20*grid,
			            width: this.parameters.vme.width,
			            text: 'VME '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.vme.height*0.3,
			       		align: 'center',
			       		listening: false
			      	});

			      	this.cells.vme[i].on('mouseover', this.writeTooltip.bind(this, i+20 ) );
					this.cells.vme[i].on('mousemove', this.moveTooltip);
					this.cells.vme[i].on('mouseout', this.writeTooltip.bind(this, -1) );
			      	squishFont(label.vme[i], 18*grid);
				}   

				for (i = 4; i < 6; i++){
					this.cells.vme[i] = new Kinetic.Rect({
						x: leftmargin+(40+20*(i-4))*grid,
						y: topmargin+33*grid,
						width: this.parameters.vme.width,
						height: this.parameters.vme.height,
						fill: this.parameters.vme.fill,
						stroke: this.parameters.vme.stroke,
						strokeWidth: this.parameters.vme.strokeW,
						opacity: this.parameters.vme.opacity
					}),

				    label.vme[i] = new Kinetic.Text({
			            x: leftmargin+(40+20*(i-4))*grid,
			            y: topmargin+33*grid,
			            width: this.parameters.vme.width,
			            text: 'VME '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.vme.height*0.3,
			       		align: 'center',
			       		listening: false
			     	 });

				    this.cells.vme[i].on('mouseover', this.writeTooltip.bind(this, i+20 ) );
					this.cells.vme[i].on('mousemove', this.moveTooltip);
					this.cells.vme[i].on('mouseout', this.writeTooltip.bind(this, -1) );
				    squishFont(label.vme[i], 18*grid);
				}   

				this.cells.vme[6] = new Kinetic.Rect({
					x: leftmargin+40*grid,
					y: topmargin+44*grid,
					width: this.parameters.vme.width,
					height: this.parameters.vme.height,
					fill: this.parameters.vme.fill,
					stroke: this.parameters.vme.stroke,
					strokeWidth: this.parameters.vme.strokeW,
					opacity: this.parameters.vme.opacity
				});

			   	label.vme[6] = new Kinetic.Text({
			   		x: leftmargin+40*grid,
			       	y: topmargin+44*grid,
			       	width: this.parameters.vme.width,
			      	text: 'VME 7',
			       	fontSize: this.parameters.label.maxFontSize,
			       	fontFamily: this.parameters.label.font,
			       	fill: this.parameters.label.fontcolour,
			       	padding: this.parameters.vme.height*0.3,
			       	align: 'center',
			       	listening: false
			   	});

 		      	this.cells.vme[6].on('mouseover', this.writeTooltip.bind(this, 26 ) );
				this.cells.vme[6].on('mousemove', this.moveTooltip);
				this.cells.vme[6].on('mouseout', this.writeTooltip.bind(this, -1) );
			   	squishFont(label.vme[6], 18*grid);

			   	for(i=0; i<this.cells.vme.length; i++){
			   		this.cells.vme[i].on('click', function(index){
			   			var evt,
			   				shackSidebar = document.querySelectorAll('widget-shackControl')[0];

 						evt = new CustomEvent('postVME', {'detail': {'VME' : index} });
                    	shackSidebar.dispatchEvent(evt);
			   		}.bind(this, i+1));
			   	}


				/////////////////////////////////////////////////////////
				// Data storage arrays are added, all numbered as before.
				/////////////////////////////////////////////////////////

				this.cells.dsa = [];
			   	label.dsa = [];

				this.cells.dsa0 = new Kinetic.Rect({
					x: leftmargin,
					y: topmargin+47*grid,
					width: this.parameters.dsa.width,
					height: this.parameters.dsa.height,
					fill: this.parameters.dsa.fill,
					stroke: this.parameters.dsa.stroke,
					strokeWidth: this.parameters.dsa.strokeW,
					opacity: this.parameters.dsa.opacity
				});	

			   	label.dsa0 = new Kinetic.Text({
			   		x: leftmargin,
			       	y: topmargin+47*grid,
			       	width: this.parameters.dsa.width,
			      	text: 'Data Storage Array 1',
			       	fontSize: this.parameters.label.maxFontSize,
			       	fontFamily: this.parameters.label.font,
			       	fill: this.parameters.label.fontcolour,
			       	padding: this.parameters.dsa.height*0.25,
			        align: 'center',
			        listening: false
			   	});

			    this.cells.dsa0.on('mouseover', this.writeTooltip.bind(this, 29 ) );
				this.cells.dsa0.on('mousemove', this.moveTooltip);
				this.cells.dsa0.on('mouseout', this.writeTooltip.bind(this, -1) );
			   	squishFont(label.dsa0, 18*grid);

				for (i = 1; i < 4; i++){
					this.cells.dsa[i] = new Kinetic.Rect({
						x: leftmargin+20*(i-1)*grid,
						y: topmargin+54*grid,
						width: this.parameters.dsa.width,
						height: this.parameters.dsa.height,
						fill: this.parameters.dsa.fill,
						stroke: this.parameters.dsa.stroke,
						strokeWidth: this.parameters.dsa.strokeW,
						opacity: this.parameters.dsa.opacity
					}),

				    label.dsa[i] = new Kinetic.Text({
			            x: leftmargin+20*(i-1)*grid,
			            y: topmargin+54*grid,
			            width: this.parameters.dsa.width,
			            text: 'Data Storage Array ' + (i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.dsa.height*0.25,
			            align: 'center',
			            listening: false
			        });

			        this.cells.dsa[i].on('mouseover', this.writeTooltip.bind(this, i+29 ) );
					this.cells.dsa[i].on('mousemove', this.moveTooltip);
					this.cells.dsa[i].on('mouseout', this.writeTooltip.bind(this, -1) );
			        squishFont(label.dsa[i], 18*grid);
				}     

				//////////////////////////////////////////////////////////////////
				// The network switches are added and numbered from left to right.
				//////////////////////////////////////////////////////////////////

				this.cells.net = [];
				label.net = [];

				for (i = 0; i < 4; i++){
					this.cells.net[i] = new Kinetic.Rect({
						x: leftmargin+(20+20*i)*grid,
						y: topmargin+53*grid,
						width: this.parameters.net.width,
						height: this.parameters.net.height,
						fill: this.parameters.net.fill,
						stroke: this.parameters.net.stroke,
						strokeWidth: this.parameters.net.strokeW,
						opacity: this.parameters.net.opacity
					}),

				    label.net[i] = new Kinetic.Text({
			            x: leftmargin+(20+20*i)*grid,
			            y: topmargin+53*grid,
			            width: this.parameters.net.width,
			            text: 'Network Switch '+(i+1),
			            fontSize: this.parameters.label.maxFontSize/2,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            align: 'center',
			            listening: false
			        });

			        squishFont(label.net[i], 18*grid);
				}   

				/////////////////////////////////////////
				// The 2 computers are added into rack 1.
				/////////////////////////////////////////

				this.cells.comp = [];
			   	label.comp = [];

				for (i = 0; i < 2; i++){
					this.cells.comp[i] = new Kinetic.Rect({
						x: leftmargin,
						y: topmargin+(40+3*i)*grid,
						width: this.parameters.comp.width,
						height: this.parameters.comp.height,
						fill: this.parameters.comp.fill,
						stroke: this.parameters.comp.stroke,
						strokeWidth: this.parameters.comp.strokeW,
						opacity: this.parameters.comp.opacity
					}),

				    label.comp[i] = new Kinetic.Text({
			            x: leftmargin,
			            y: topmargin+(40+3.1*i)*grid,
			            width: this.parameters.comp.width,
			            text: 'Computer '+(i+1),
			            fontSize: this.parameters.label.maxFontSize,
			            fontFamily: this.parameters.label.font,
			            fill: this.parameters.label.fontcolour,
			            padding: this.parameters.comp.height*0.03,
			            align: 'center',
			            listening: false
			        });

			        this.cells.comp[i].on('mouseover', this.writeTooltip.bind(this, i+27 ) );
					this.cells.comp[i].on('mousemove', this.moveTooltip);
					this.cells.comp[i].on('mouseout', this.writeTooltip.bind(this, -1) );
			        squishFont(label.comp[i], 18*grid);
				}   

				/////////////////////////////////////////////////////////////////////////
				// In order to make this interface user-friendly, each rack is given a
				// label so that it is clear what crates, switches and cables are located
				// where. The interface visualises how the shack looks from the front and 
				// the racks are correspondingly labelled from left to right (1 to 5).
				/////////////////////////////////////////////////////////////////////////

				this.cells.labels = [];
				label.racks = [];

				for (i = 0; i < 5; i++){

					label.racks[i] = new Kinetic.Text({
						x: leftmargin+(6+20*i)*grid,
						y: topmargin,
						width: this.parameters.widthlab,
						text: 'Rack '+(i+1),
						fontSize: this.parameters.label.maxFontSize,
						fontFamily: this.parameters.label.font,
						fill: '#EEEEEE',
						align: 'center'
					});

					squishFont(label.racks[i], 18*grid);
				}

			    //////////////////////////////////////////////////////////////////////
			    // rackImage.mainLayer.add(...) adds the newly created objects and the 
			    // corresponding text to the main layer within the stage (rackImage)
			    // set out in the conditions at the beginning of the code.
			    //////////////////////////////////////////////////////////////////////

				for (i = 0; i < 5; i++)
					this.rackImage.mainLayer.add(this.cells.racks[i]);

				for (i = 0; i < 5; i++)
					this.rackImage.mainLayer.add(this.cells.sensorstop[i]),
					this.rackImage.mainLayer.add(this.cells.sensorsbottom[i]);

				for (i = 0; i < 14; i++)
					this.rackImage.mainLayer.add(this.cells.cableman[i]);

				this.rackImage.mainLayer.add(this.cells.cableman14);

				this.rackImage.mainLayer.add(this.cells.hv0);
			    this.rackImage.mainLayer.add(label.hv0);

				for (i = 1; i < 3; i++)
					this.rackImage.mainLayer.add(this.cells.hv[i]),
					this.rackImage.mainLayer.add(label.hv[i]);

				for (i = 0; i < 7; i++)
					this.rackImage.mainLayer.add(this.cells.nim[i]),
					this.rackImage.mainLayer.add(label.nim[i]);

				for (i = 0; i < 6; i++)
					this.rackImage.mainLayer.add(this.cells.vme[i]),
				    this.rackImage.mainLayer.add(label.vme[i]);

				this.rackImage.mainLayer.add(this.cells.vme[6]);
			    this.rackImage.mainLayer.add(label.vme[6]);

				this.rackImage.mainLayer.add(this.cells.dsa0);
			    this.rackImage.mainLayer.add(label.dsa0);

				for (i = 1; i < 4; i++)
					this.rackImage.mainLayer.add(this.cells.dsa[i]),
					this.rackImage.mainLayer.add(label.dsa[i]);

				for (i = 0; i < 4; i++)
					this.rackImage.mainLayer.add(this.cells.net[i]),
				    this.rackImage.mainLayer.add(label.net[i]);

				for (i = 0; i < 2; i++)
					this.rackImage.mainLayer.add(this.cells.comp[i]),
					this.rackImage.mainLayer.add(label.comp[i]);

				for (i = 0; i < 5; i++)
					this.rackImage.mainLayer.add(label.racks[i]);

				///////////////////////////////////////////////////////////////////////////
				// The final command draws all of the objects and text onto the main layer.
				///////////////////////////////////////////////////////////////////////////

				this.rackImage.mainLayer.draw();
			},

            //move the tooltip around
            'moveTooltip' : function(evt){
                var tt = document.getElementById('tooltip');

                tt.setAttribute('style', 'display:block; z-index:10; position: absolute; left:' + evt.pageX + '; top:' + evt.pageY  + ';');
            },

			'writeTooltip' : function(i){

				var tt = document.getElementById('tooltip'),
					content = document.createElement('p'),
					value, text;

				if(i == -1){
					tt.setAttribute('style', 'display:none');
				} else {
					text = ''
					for(key in this.tooltipContent[i]){
						text += key + ': ' + this.tooltipContent[i][key] + '<br>';
					}

				content.innerHTML = text;
				tt.innerHTML = '';
				tt.appendChild(content);

				}
			},

			'update' : function(){

				XHR(this.SOH+'/?cmd=jcopy&odb0=Equipment/&encoding=json-nokeys', this.routeData.bind(this), false, true);				
			
			}, 

			'routeData' : function(response){

				var data = JSON.parse(response),
					i;

				data = data[0];

				for(i = 0; i < 10; i++){
					this.tooltipContent[i] = {'Temperature' : (data.Agilent34970A.Variables.DATA[i]).toFixed(1)};

					if (data.Agilent34970A.Variables.DATA[i] > 32){
						this.flag[i] = 1
					} else {
						this.flag[i] = 0
					}
				}

				for (i = 10; i < 13; i++){
					this.tooltipContent[i] = {'HV Crate ' : (i-9)};
				}

				for (i = 13; i < 20; i++){
					this.tooltipContent[i] = {'NIM Crate' : (i-12)};
				}

				for (i = 20; i < 27; i++){
					this.tooltipContent[i] = {'VME Crate' : (i-19)};
				}

				for (i = 27; i < 29; i++){
					this.tooltipContent[i] = {'Computer' : (i-26)};
				}

				for (i = 29; i < 33; i++){
					this.tooltipContent[i] = {'Data Storage Array' : (i-30)};
				}

				this.updateRacks();

			},

			///////////////////////////////////////////////////////////////////////////
			// The 'updateRacks' function changes the colour of the temperature sensors
			// if the warning or alarms are triggered to alert the user. They are set
			// so that if the warning alarm is triggered, the this.cells change colour.
			///////////////////////////////////////////////////////////////////////////

			'updateRacks' : function(){

				for (i = 0; i < 5; i++){
				
					if (this.flag[i] == 1){
						this.cells.sensorstop[i].setAttr('fill', 'red');
					} else {
						this.cells.sensorstop[i].setAttr('fill', 'lightgray');
					}

					if (this.flag[i+5] == 1){
						this.cells.sensorsbottom[i].setAttr('fill', 'red');
					} else {
						this.cells.sensorsbottom[i].setAttr('fill', 'lightgray');
					}
				}

				this.rackImage.mainLayer.draw();
			}
		}
    });

})();

(function(){  

    xtag.register('widget-shackControl', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i;                  

                this.introTitle = document.createElement('h2');
                this.wrap = document.createElement('form');
                this.pw = document.createElement('input');
                this.pwLabel = document.createElement('label');
                this.powerCycle = document.createElement('button');
                this.VMEindex = document.createElement('input');
                this.SOHhost = document.createElement('input');

                this.introTitle.innerHTML = 'Click on a VME to get started.'
                this.appendChild(this.introTitle)

                this.wrap.setAttribute('style', 'display:none');
                this.wrap.setAttribute('method', 'POST')
                this.wrap.setAttribute('action', 'powerCycleVME')
                this.appendChild(this.wrap);

                this.pwLabel.innerHTML = 'VME Pass:';
                this.wrap.appendChild(this.pwLabel);

                this.pw.setAttribute('type', 'password');
                this.pw.setAttribute('class', 'stdin');
                this.pw.setAttribute('name', 'pw');
                this.wrap.appendChild(this.pw);

                this.powerCycle.innerHTML = 'Power Cycle VME';
                this.powerCycle.setAttribute('class', 'stdin');
                this.wrap.appendChild(this.powerCycle);

                this.VMEindex.setAttribute('type', 'number');
                this.VMEindex.setAttribute('name', 'VMEindex');
                this.VMEindex.setAttribute('style', 'display:none');
                this.wrap.appendChild(this.VMEindex);

                this.SOHhost.setAttribute('type', 'text');
                this.SOHhost.setAttribute('name', 'host');
                this.SOHhost.setAttribute('style', 'display:none');
                this.SOHhost.value = this.SOH;
                this.wrap.appendChild(this.SOHhost);

                this.addEventListener('postVME', function(evt){
                    this.updateForm(evt.detail);
                }, false);
                
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'SOH':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
        	'updateForm' : function(payload){
        		this.wrap.setAttribute('style', 'display:block');

        		this.introTitle.innerHTML = 'VME ' + payload.VME;

        		this.VMEindex.value = payload.VME;
        	}
        }
    });

})();
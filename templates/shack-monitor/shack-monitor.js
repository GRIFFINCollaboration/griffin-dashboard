///////////
// setup
///////////

window.onerror = function(message, source, lineno, colno, error){
    // need to remind people to log in

    if(message == 'Script error.'){
        window.alert("An external script didn't load correctly; a likely cause is that you may need to log into MIDAS if security is enabled. Visit " + dataStore.SOHhost + " (or wherever your MIDAS experiment is), log in, then try coming back here.")
    }
}

function registerODB(payload){
    dataStore.ODB.DAQ = payload;

    detectDetectors();
}

function registerSOHODB(payload){
    dataStore.SOH.ODB.Equipment = payload;
}

function drawShack(){
    // set up the kinetic context and draw the shack for the first time

    var width = document.getElementById('shackMonitor').offsetWidth,
        height = 0.8*window.innerHeight,
        grid = Math.min(width/105, height/62),  //21*5 wide, 56+2+2+2 tall
        label = {},
        leftmargin = (width - 100*grid)/2,
        topmargin = (height - 62*grid)/2,
        i, VMEtitle,
        VMELabels = ['A', 'B', 'C'];

    dataStore.SOH.rackImage = {};
    dataStore.SOH.cells = {};
    dataStore.SOH.parameters = { label:{
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

                        cableman:{
                            width: 20*grid,
                            height: 1*grid,
                            fill: 'dimgray',
                            stroke: 'black',
                            strokeW: 2,
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

    dataStore.SOH.rackImage.stage = new Kinetic.Stage({
        container: 'shackDisplay',
        width: width,
        height: height
    });

    ////////////////////////////////////////////////////////
    // The main layer is made which will contain all of the
    // fixed racks and crates for the shack.
    ////////////////////////////////////////////////////////

    dataStore.SOH.rackImage.mainLayer = new Kinetic.Layer();
    dataStore.SOH.rackImage.stage.add(dataStore.SOH.rackImage.mainLayer);

    ////////////////////////////////////////////
    // The dataStore.SOH.cells.racks loop sets up the 5 racks.
    ////////////////////////////////////////////

    dataStore.SOH.cells.racks = [];

    for (i = 0; i < 5; i++){
        dataStore.SOH.cells.racks[i] = new Kinetic.Rect({
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

    dataStore.SOH.cells.sensorstop = [];
    dataStore.SOH.cells.sensorsbottom = [];

    for (i = 0; i < 5; i++){

        dataStore.SOH.cells.sensorstop[i] = new Kinetic.Rect({
            x: leftmargin+(2+20*i)*grid,
            y: topmargin + 2*grid,
            width: dataStore.SOH.parameters.sensors.width,
            height: dataStore.SOH.parameters.sensors.height,
            fill: dataStore.SOH.parameters.sensors.fill,
            stroke: dataStore.SOH.parameters.sensors.stroke,
            strokeWidth: dataStore.SOH.parameters.sensors.strokeW,
            opacity: dataStore.SOH.parameters.sensors.opacity,
        })

        dataStore.SOH.cells.sensorstop[i].on('mouseover', writeTooltip.bind(null, i) );
        dataStore.SOH.cells.sensorstop[i].on('mousemove', moveTooltip);
        dataStore.SOH.cells.sensorstop[i].on('mouseout', hideTooltip);

        dataStore.SOH.cells.sensorsbottom[i] = new Kinetic.Rect({
            x: leftmargin+(2+20*i)*grid,
            y: topmargin+60*grid,
            width: dataStore.SOH.parameters.sensors.width,
            height: dataStore.SOH.parameters.sensors.height,
            fill: dataStore.SOH.parameters.sensors.fill,
            stroke: dataStore.SOH.parameters.sensors.stroke,
            strokeWidth: dataStore.SOH.parameters.sensors.strokeW,
            opacity: dataStore.SOH.parameters.sensors.opacity,
        })

        dataStore.SOH.cells.sensorsbottom[i].on('mouseover', writeTooltip.bind(null, i+5) );
        dataStore.SOH.cells.sensorsbottom[i].on('mousemove', moveTooltip);
        dataStore.SOH.cells.sensorsbottom[i].on('mouseout', hideTooltip);

    }

    ///////////////////////////////////////
    // Cable management sections are added.
    ///////////////////////////////////////

    dataStore.SOH.cells.cableman = [];

    for (i = 0; i < 4; i++){
        dataStore.SOH.cells.cableman[i] = new Kinetic.Rect({
            x: leftmargin+20*i*grid,
            y: topmargin+19*grid,
            width: dataStore.SOH.parameters.cableman.width,
            height: dataStore.SOH.parameters.cableman.height,
            fill: dataStore.SOH.parameters.cableman.fill,
            stroke: dataStore.SOH.parameters.cableman.strokeW,
            strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
            opacity: dataStore.SOH.parameters.cableman.opacity
        });
    }   

    for (i = 4; i < 8; i++){
        dataStore.SOH.cells.cableman[i] = new Kinetic.Rect({
            x: leftmargin+20*(i-4)*grid,
            y: topmargin+28*grid,
            width: dataStore.SOH.parameters.cableman.width,
            height: dataStore.SOH.parameters.cableman.height,
            fill: dataStore.SOH.parameters.cableman.fill,
            stroke: dataStore.SOH.parameters.cableman.stroke,
            strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
            opacity: dataStore.SOH.parameters.cableman.opacity
        });
    } 

    for (i = 8; i < 10; i++){
        dataStore.SOH.cells.cableman[i] = new Kinetic.Rect({
            x: leftmargin+(40+20*(i-8))*grid,
            y: topmargin+32*grid,
            width: dataStore.SOH.parameters.cableman.width,
            height: dataStore.SOH.parameters.cableman.height,
            fill: dataStore.SOH.parameters.cableman.fill,
            stroke: dataStore.SOH.parameters.cableman.stroke,
            strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
            opacity: dataStore.SOH.parameters.cableman.opacity
        });
    } 

    for (i = 10; i < 12; i++){
        dataStore.SOH.cells.cableman[i] = new Kinetic.Rect({
            x: leftmargin+(40+20*(i-10))*grid,
            y: topmargin+41*grid,
            width: dataStore.SOH.parameters.cableman.width,
            height: dataStore.SOH.parameters.cableman.height,
            fill: dataStore.SOH.parameters.cableman.fill,
            stroke: dataStore.SOH.parameters.cableman.stroke,
            strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
            opacity: dataStore.SOH.parameters.cableman.opacity
        });
    } 

    for (i = 12; i < 14; i++){
        dataStore.SOH.cells.cableman[i] = new Kinetic.Rect({
            x: leftmargin+40*grid,
            y: topmargin+(43+9*(i-12))*grid,
            width: dataStore.SOH.parameters.cableman.width,
            height: dataStore.SOH.parameters.cableman.height,
            fill: dataStore.SOH.parameters.cableman.fill,
            stroke: dataStore.SOH.parameters.cableman.stroke,
            strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
            opacity: dataStore.SOH.parameters.cableman.opacity
        });
    } 

    dataStore.SOH.cells.cableman[14] = new Kinetic.Rect({
        x: leftmargin+40*grid,
        y: topmargin+30*grid,
        width: dataStore.SOH.parameters.cableman.width,
        height: dataStore.SOH.parameters.cableman.height,
        fill: dataStore.SOH.parameters.cableman.fill,
        stroke: dataStore.SOH.parameters.cableman.stroke,
        strokeWidth: dataStore.SOH.parameters.cableman.strokeW,
        opacity: dataStore.SOH.parameters.cableman.opacity
    });

    //////////////////////////////////////////////////////////////////////////////
    // HV crates are included here.
    //////////////////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.hv = [];
    label.hv = [];

    // create all of the rectangles and text boxes
    for (i = 0; i < 3; i++){
        dataStore.SOH.cells.hv[i] = new Kinetic.Rect({
            x: leftmargin+(60+20*(i-1))*grid,
            y: topmargin+4*grid,
            width: dataStore.SOH.parameters.hv.width,
            height: dataStore.SOH.parameters.hv.height,
            fill: dataStore.SOH.parameters.hv.fill,
            stroke: dataStore.SOH.parameters.hv.stroke,
            strokeWidth: dataStore.SOH.parameters.hv.strokeW,
            opacity: dataStore.SOH.parameters.hv.opacity
        }),

        label.hv[i] = new Kinetic.Text({
            x: leftmargin+(60+20*(i-1))*grid,
            y: topmargin+4*grid,
        height: dataStore.SOH.parameters.hv.height,
            width: dataStore.SOH.parameters.hv.width,
            text: 'HV-'+(i),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            padding: dataStore.SOH.parameters.hv.height*0.3,
            align: 'center',
            listening: false
        });

        squishFont(label.hv[i], 18*grid);
    }

    // ...then modify all the x-positions.
    dataStore.SOH.cells.hv[0].setX(leftmargin+20*grid);
    label.hv[0].setX(leftmargin+20*grid);
    dataStore.SOH.cells.hv[1].setX(leftmargin+80*grid);
    label.hv[1].setX(leftmargin+80*grid);
    dataStore.SOH.cells.hv[2].setX(leftmargin+40*grid);
    label.hv[2].setX(leftmargin+40*grid);

    //////////////////////////////////////////////////////////////////////////////
    // NIM crates are included next and numbered in the same way as the HV crates.
    //////////////////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.nim = [];
    label.nim =[];

    for (i = 0; i < 5; i++){
        dataStore.SOH.cells.nim[i] = new Kinetic.Rect({
            x: leftmargin+20*i*grid,
            y: topmargin+13*grid,
            width: dataStore.SOH.parameters.nim.width,
            height: dataStore.SOH.parameters.nim.height,
            fill: dataStore.SOH.parameters.nim.fill,
            stroke: dataStore.SOH.parameters.nim.stroke,
            strokeWidth: dataStore.SOH.parameters.nim.strokeW,
            opacity: dataStore.SOH.parameters.nim.opacity
        }),

        label.nim[i] = new Kinetic.Text({
            x: leftmargin+20*i*grid,
            y: topmargin+13*grid,
            width: dataStore.SOH.parameters.nim.width,
            text: 'NIM '+(i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            padding: dataStore.SOH.parameters.nim.height*0.25,
            align: 'center',
            listening: false
        });

        squishFont(label.nim[i], 18*grid);
    } 

    for (i = 5; i < 7; i++){
        dataStore.SOH.cells.nim[i] = new Kinetic.Rect({
            x: leftmargin+60*grid,
            y: topmargin+(47+8*(i-5))*grid,
            width: dataStore.SOH.parameters.nim.width,
            height: dataStore.SOH.parameters.nim.height,
            fill: dataStore.SOH.parameters.nim.fill,
            stroke: dataStore.SOH.parameters.nim.stroke,
            strokeWidth: dataStore.SOH.parameters.nim.strokeW,
            opacity: dataStore.SOH.parameters.nim.opacity
        }),

        label.nim[i] = new Kinetic.Text({
            x: leftmargin+60*grid,
            y: topmargin+(47+8*(i-5))*grid,
            width: dataStore.SOH.parameters.nim.width,
            text: 'NIM '+(i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            padding: dataStore.SOH.parameters.nim.height*0.25,
            align: 'center',
            listening: false
        });

        squishFont(label.nim[i], 18*grid);
    }

    ////////////////////////////////////////////////////
    // VME crates are added next and numbered as before.
    ////////////////////////////////////////////////////    

    dataStore.SOH.cells.vme = [];
    label.vme = [];

    for (j = 0; j < 3; j++){
        for (i = 0; i < 5; i++){
            VMEtitle = 'VME-'+i+VMELabels[j];

            dataStore.SOH.cells.vme[j*5+i] = new Kinetic.Rect({
                x: leftmargin+20*i*grid,
                y: topmargin+(j*9+20)*grid,
                width: dataStore.SOH.parameters.vme.width,
                height: dataStore.SOH.parameters.vme.height,
                fill: dataStore.SOH.parameters.vme.fill,
                stroke: dataStore.SOH.parameters.vme.stroke,
                strokeWidth: dataStore.SOH.parameters.vme.strokeW,
                opacity: dataStore.SOH.parameters.vme.opacity
            }),

            label.vme[j*5+i] = new Kinetic.Text({
                x: leftmargin+20*i*grid,
                y: topmargin+(j*9+20)*grid,
                width: dataStore.SOH.parameters.vme.width,
                text: VMEtitle,
                fontSize: dataStore.SOH.parameters.label.maxFontSize,
                fontFamily: dataStore.SOH.parameters.label.font,
                fill: dataStore.SOH.parameters.label.fontcolour,
                padding: dataStore.SOH.parameters.vme.height*0.3,
                align: 'center',
                listening: false
            });

            dataStore.SOH.cells.vme[j*5+i].on('mouseover', writeTooltip.bind(null, 'vme') );
            dataStore.SOH.cells.vme[j*5+i].on('mousemove', moveTooltip);
            dataStore.SOH.cells.vme[j*5+i].on('mouseout', hideTooltip);
            squishFont(label.vme[j*5+i], 18*grid);

            dataStore.SOH.cells.vme[j*5+i].on('click', function(vme){

                document.getElementById('controlsidebar').innerHTML = Mustache.to_html(
                    dataStore.templates['vme-cycle'], 
                    {
                        'title': vme,
                    }
                );

            }.bind(null, VMEtitle));
            
        }
    }   

    /////////////////////////////////////////////////////////
    // Data storage arrays are added, all numbered as before.
    /////////////////////////////////////////////////////////

    dataStore.SOH.cells.dsa = [];
    label.dsa = [];

    dataStore.SOH.cells.dsa[0] = new Kinetic.Rect({
        x: leftmargin,
        y: topmargin+47*grid,
        width: dataStore.SOH.parameters.dsa.width,
        height: dataStore.SOH.parameters.dsa.height,
        fill: dataStore.SOH.parameters.dsa.fill,
        stroke: dataStore.SOH.parameters.dsa.stroke,
        strokeWidth: dataStore.SOH.parameters.dsa.strokeW,
        opacity: dataStore.SOH.parameters.dsa.opacity
    }); 

    label.dsa0 = new Kinetic.Text({
        x: leftmargin,
        y: topmargin+47*grid,
        width: dataStore.SOH.parameters.dsa.width,
        text: 'Data Storage Array 1',
        fontSize: dataStore.SOH.parameters.label.maxFontSize,
        fontFamily: dataStore.SOH.parameters.label.font,
        fill: dataStore.SOH.parameters.label.fontcolour,
        padding: dataStore.SOH.parameters.dsa.height*0.25,
        align: 'center',
        listening: false
    });

    squishFont(label.dsa0, 18*grid);

    for (i = 1; i < 4; i++){
        dataStore.SOH.cells.dsa[i] = new Kinetic.Rect({
            x: leftmargin+20*(i-1)*grid,
            y: topmargin+54*grid,
            width: dataStore.SOH.parameters.dsa.width,
            height: dataStore.SOH.parameters.dsa.height,
            fill: dataStore.SOH.parameters.dsa.fill,
            stroke: dataStore.SOH.parameters.dsa.stroke,
            strokeWidth: dataStore.SOH.parameters.dsa.strokeW,
            opacity: dataStore.SOH.parameters.dsa.opacity
        }),

        label.dsa[i] = new Kinetic.Text({
            x: leftmargin+20*(i-1)*grid,
            y: topmargin+54*grid,
            width: dataStore.SOH.parameters.dsa.width,
            text: 'Data Storage Array ' + (i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            padding: dataStore.SOH.parameters.dsa.height*0.25,
            align: 'center',
            listening: false
        });

        squishFont(label.dsa[i], 18*grid);
    }     

    //////////////////////////////////////////////////////////////////
    // The network switches are added and numbered from left to right.
    //////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.net = [];
    label.net = [];

    for (i = 0; i < 4; i++){
        dataStore.SOH.cells.net[i] = new Kinetic.Rect({
            x: leftmargin+(20+20*i)*grid,
            y: topmargin+53*grid,
            width: dataStore.SOH.parameters.net.width,
            height: dataStore.SOH.parameters.net.height,
            fill: dataStore.SOH.parameters.net.fill,
            stroke: dataStore.SOH.parameters.net.stroke,
            strokeWidth: dataStore.SOH.parameters.net.strokeW,
            opacity: dataStore.SOH.parameters.net.opacity
        }),

        label.net[i] = new Kinetic.Text({
            x: leftmargin+(20+20*i)*grid,
            y: topmargin+53*grid,
            width: dataStore.SOH.parameters.net.width,
            text: 'Network Switch '+(i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize/2,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            align: 'center',
            listening: false
        });

        squishFont(label.net[i], 18*grid);
    }   

    /////////////////////////////////////////
    // The 2 computers are added into rack 1.
    /////////////////////////////////////////

    dataStore.SOH.cells.comp = [];
    label.comp = [];

    for (i = 0; i < 2; i++){
        dataStore.SOH.cells.comp[i] = new Kinetic.Rect({
            x: leftmargin,
            y: topmargin+(40+3*i)*grid,
            width: dataStore.SOH.parameters.comp.width,
            height: dataStore.SOH.parameters.comp.height,
            fill: dataStore.SOH.parameters.comp.fill,
            stroke: dataStore.SOH.parameters.comp.stroke,
            strokeWidth: dataStore.SOH.parameters.comp.strokeW,
            opacity: dataStore.SOH.parameters.comp.opacity
        }),

        label.comp[i] = new Kinetic.Text({
            x: leftmargin,
            y: topmargin+(40+3.1*i)*grid,
            width: dataStore.SOH.parameters.comp.width,
            text: 'Computer '+(i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
            fill: dataStore.SOH.parameters.label.fontcolour,
            padding: dataStore.SOH.parameters.comp.height*0.03,
            align: 'center',
            listening: false
        });

        squishFont(label.comp[i], 18*grid);
    }   

    /////////////////////////////////////////////////////////////////////////
    // In order to make dataStore.SOH interface user-friendly, each rack is given a
    // label so that it is clear what crates, switches and cables are located
    // where. The interface visualises how the shack looks from the front and 
    // the racks are correspondingly labelled from left to right (1 to 5).
    /////////////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.labels = [];
    label.racks = [];

    for (i = 0; i < 5; i++){

        label.racks[i] = new Kinetic.Text({
            x: leftmargin+(6+20*i)*grid,
            y: topmargin,
            width: dataStore.SOH.parameters.widthlab,
            text: 'Rack '+(i+1),
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            fontFamily: dataStore.SOH.parameters.label.font,
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
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.racks[i]);

    for (i = 0; i < 5; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.sensorstop[i]),
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.sensorsbottom[i]);

    for (i = 0; i < 14; i++)
    {
        if (i==8 || i==9) continue;
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.cableman[i]);
    }

    //              dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.cableman[14]);

    for (i = 0; i < 3; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.hv[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.hv[i]);

    for (i = 0; i < 7; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.nim[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.nim[i]);

    // At some point, we should be able to use dataStore.SOH loop fully. Until then...
    for (i = 0; i < 10; i++)
    {
        if (i==2 || i==5 || i==6) continue;
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.vme[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.vme[i]);
    }

    dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.dsa[0]);
    dataStore.SOH.rackImage.mainLayer.add(label.dsa0);

    for (i = 1; i < 4; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.dsa[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.dsa[i]);

    for (i = 0; i < 4; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.net[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.net[i]);

    for (i = 0; i < 2; i++)
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.comp[i]),
        dataStore.SOH.rackImage.mainLayer.add(label.comp[i]);

    for (i = 0; i < 5; i++)
        dataStore.SOH.rackImage.mainLayer.add(label.racks[i]);

    ///////////////////////////////////////////////////////////////////////////
    // The final command draws all of the objects and text onto the main layer.
    ///////////////////////////////////////////////////////////////////////////

    dataStore.SOH.rackImage.mainLayer.draw();
}


//////////////////////
// updating
//////////////////////

function dataUpdate(payload){
    // update the display based on the current contents of dataStore.SOH.ODB.Equipment

    updateRunStatus();
    updateThermometerFlags();
    dataStore.SOH.rackImage.mainLayer.draw();
    if(dataStore.tooltip.currentTooltipTarget)
        writeTooltip(dataStore.tooltip.currentTooltipTarget);
}

function updateThermometerFlags(){
    // color thermometers red if things are too hot

    var critTemp = 32,
        i;

    for(i=0; i<5; i++){
        if(dataStore.SOH.ODB.Equipment[0].Agilent34970A.Variables.DATA[i] > critTemp)
            dataStore.SOH.cells.sensorstop[i].setAttr('fill', 'red');
        else
            dataStore.SOH.cells.sensorstop[i].setAttr('fill', 'lightgray');

        if(dataStore.SOH.ODB.Equipment[0].Agilent34970A.Variables.DATA[i+5] > critTemp)
            dataStore.SOH.cells.sensorsbottom[i].setAttr('fill', 'red');
        else
            dataStore.SOH.cells.sensorsbottom[i].setAttr('fill', 'lightgray');
    }

}

function writeTooltip(channel){
    // write the tooltip contents for temperature <channel>, or remind the user they can click on a vme to power cycle

    var tooltip = document.getElementById('tooltip'),
        text;

    dataStore.tooltip.currentTooltipTarget = channel;

    if(channel == 'vme')
        text = 'Click to power cycle this VME.'
    else{
        text = 'Temperature: ' + dataStore.SOH.ODB.Equipment[0].Agilent34970A.Variables.DATA[channel].toFixed(1) + ' C'
    }

    tooltip.innerHTML = text;
}

function powerCycleVME(target){
    // power cycle the target vme:
    // enable power cycle bit, power down, wait 65 seconds, power up, disable power cycle bit.

        promiseScript('http://' + dataStore.SOHhost + '/?cmd=jset&odb=Equipment/' + target + '/Settings/EnableControl&value=1').then(function(){
            promiseScript('http://' + dataStore.SOHhost + '/?cmd=jset&odb=Equipment/' + target + '/Settings/mainSwitch&value=0').then(function(){
                window.setTimeout(function(){
                    promiseScript('http://' + dataStore.SOHhost + '/?cmd=jset&odb=Equipment/' + target + '/Settings/mainSwitch&value=1').then(function(){
                        promiseScript('http://' + dataStore.SOHhost + '/?cmd=jset&odb=Equipment/' + target + '/Settings/EnableControl&value=0')
                    })
                }, 65000)
            })
        });


}



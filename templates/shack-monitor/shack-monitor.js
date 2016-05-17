///////////
// setup
///////////

// window.onerror = function(message, source, lineno, colno, error){
//     // need to remind people to log in

//     if(message == 'Script error.'){
//         window.alert("An external script didn't load correctly; a likely cause is that you may need to log into MIDAS if security is enabled. Visit " + dataStore.SOHhost + " (or wherever your MIDAS experiment is), log in, then try coming back here.")
//     }
// }

function registerODB(payload){
    dataStore.ODB.DAQ = payload;

    detectDetectors();
}

function registerSOHODB(payload){
    dataStore.SOH.ODB.Equipment = payload;
}

function drawShack(){
    // set up the context and draw the shack for the first time

    var width = document.getElementById('shackMonitor').offsetWidth,
        height = 0.8*window.innerHeight,
        grid = Math.min(width/105, height/62),  //21*5 wide, 56+2+2+2 tall
        label = {},
        leftmargin = (width - 100*grid)/2,
        topmargin = (height - 62*grid)/2,
        i, VMEtitle, x,y,w,h, path,
        VMELabels = ['A', 'B', 'C'];

    dataStore.SOH.rackImage = {};
    dataStore.SOH.cells = {};
    dataStore.SOH.parameters = { 
                        label:{
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
    // setup drawing stage
    /////////////////////////////////////////////////////////

    dataStore.SOH.rackImage.stage = new quickdraw(width, height);
    document.getElementById('shackDisplay').appendChild(dataStore.SOH.rackImage.stage.canvas)

    ////////////////////////////////////////////////////////
    // The main layer is made which will contain all of the
    // fixed racks and crates for the shack.
    ////////////////////////////////////////////////////////

    dataStore.SOH.rackImage.mainLayer = new qdlayer('mainLayer');
    dataStore.SOH.rackImage.stage.add(dataStore.SOH.rackImage.mainLayer);

    ////////////////////////////////////////////
    // The dataStore.SOH.cells.racks loop sets up the 5 racks.
    ////////////////////////////////////////////

    dataStore.SOH.cells.racks = [];

    for (i = 0; i < 5; i++){
        x = leftmargin+20*i*grid;
        y = topmargin+4*grid;
        w = 20*grid;
        h = 56*grid;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.racks[i] = new qdshape(path, {
            id: 'rack'+i,
            fillStyle: '#FFFFFF',
            strokeStyle: '#000000',
            lineWidth: 2,
            z: 1
        });
    }    

    /////////////////////////////////////////////////////////
    // Setting the content of the temperature sensor tooltip.
    /////////////////////////////////////////////////////////               

    dataStore.SOH.cells.sensorstop = [];
    dataStore.SOH.cells.sensorsbottom = [];

    for (i = 0; i < 5; i++){
        x = leftmargin+(2+20*i)*grid;
        y = topmargin + 2*grid;
        w = dataStore.SOH.parameters.sensors.width;
        h = dataStore.SOH.parameters.sensors.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.sensorstop[i] = new qdshape(path, {
            id: 'sensorstop'+i,
            fillStyle: dataStore.SOH.parameters.sensors.fill,
            strokeStyle: dataStore.SOH.parameters.sensors.stroke,
            lineWidth: dataStore.SOH.parameters.sensors.strokeW,
            z: 1
        });

        dataStore.SOH.cells.sensorstop[i].mouseover = writeTooltip.bind(null, i);
        dataStore.SOH.cells.sensorstop[i].mousemove = moveTooltip;
        dataStore.SOH.cells.sensorstop[i].mouseout = hideTooltip;

        y = topmargin + 60*grid;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.sensorsbottom[i] = new qdshape(path, {
            id: 'sensorsbottom'+i,
            fillStyle: dataStore.SOH.parameters.sensors.fill,
            strokeStyle: dataStore.SOH.parameters.sensors.stroke,
            lineWidth: dataStore.SOH.parameters.sensors.strokeW,
            z: 1
        });

        dataStore.SOH.cells.sensorsbottom[i].mouseover = writeTooltip.bind(null, i+5);
        dataStore.SOH.cells.sensorsbottom[i].mousemove = moveTooltip;
        dataStore.SOH.cells.sensorsbottom[i].mouseout = hideTooltip;

    }

    ///////////////////////////////////////
    // Cable management sections are added.
    ///////////////////////////////////////

    dataStore.SOH.cells.cableman = [];

    for (i = 0; i < 4; i++){
        x = leftmargin+20*i*grid;
        y = topmargin+19*grid;
        w = dataStore.SOH.parameters.cableman.width;
        h = dataStore.SOH.parameters.cableman.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.cableman[i] = new qdshape(path, {
            id: 'cableman'+i,
            fillStyle: dataStore.SOH.parameters.cableman.fill,
            strokeStyle: dataStore.SOH.parameters.cableman.stroke,
            lineWidth: dataStore.SOH.parameters.cableman.strokeW,
            z: 1
        });
    }   

    for (i = 4; i < 8; i++){
        x = leftmargin+20*(i-4)*grid;
        y = topmargin+28*grid;
        w = dataStore.SOH.parameters.cableman.width;
        h = dataStore.SOH.parameters.cableman.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.cableman[i] = new qdshape(path, {
            id: 'cableman'+i,
            fillStyle: dataStore.SOH.parameters.cableman.fill,
            strokeStyle: dataStore.SOH.parameters.cableman.stroke,
            lineWidth: dataStore.SOH.parameters.cableman.strokeW,
            z: 1
        });
    } 

    for (i = 8; i < 10; i++){
        x = leftmargin+(40+20*(i-8))*grid;
        y = topmargin+32*grid;
        w = dataStore.SOH.parameters.cableman.width;
        h = dataStore.SOH.parameters.cableman.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.cableman[i] = new qdshape(path, {
            id: 'cableman'+i,
            fillStyle: dataStore.SOH.parameters.cableman.fill,
            strokeStyle: dataStore.SOH.parameters.cableman.stroke,
            lineWidth: dataStore.SOH.parameters.cableman.strokeW,
            z: 1
        });
    } 

    for (i = 10; i < 12; i++){
        x = leftmargin+(40+20*(i-10))*grid;
        y = topmargin+41*grid;
        w = dataStore.SOH.parameters.cableman.width;
        h = dataStore.SOH.parameters.cableman.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.cableman[i] = new qdshape(path, {
            id: 'cableman'+i,
            fillStyle: dataStore.SOH.parameters.cableman.fill,
            strokeStyle: dataStore.SOH.parameters.cableman.stroke,
            lineWidth: dataStore.SOH.parameters.cableman.strokeW,
            z: 1
        });
    } 

    for (i = 12; i < 14; i++){
        x = leftmargin+40*grid;
        y = topmargin+(43+9*(i-12))*grid;
        w = dataStore.SOH.parameters.cableman.width;
        h = dataStore.SOH.parameters.cableman.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.cableman[i] = new qdshape(path, {
            id: 'cableman'+i,
            fillStyle: dataStore.SOH.parameters.cableman.fill,
            strokeStyle: dataStore.SOH.parameters.cableman.stroke,
            lineWidth: dataStore.SOH.parameters.cableman.strokeW,
            z: 1
        });
    } 

    x = leftmargin+40*grid;
    y = topmargin+30*grid;
    w = dataStore.SOH.parameters.cableman.width;
    h = dataStore.SOH.parameters.cableman.height;
    path = generatePath([0,0, w,0, w,h, 0,h], x, y);

    dataStore.SOH.cells.cableman[i] = new qdshape(path, {
        id: 'cableman14',
        fillStyle: dataStore.SOH.parameters.cableman.fill,
        strokeStyle: dataStore.SOH.parameters.cableman.stroke,
        lineWidth: dataStore.SOH.parameters.cableman.strokeW,
        z: 1
    });


    //////////////////////////////////////////////////////////////////////////////
    // HV crates are included here.
    //////////////////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.hv = [];
    dataStore.SOH.cells.hv_x = [leftmargin+20*grid,leftmargin+80*grid,leftmargin+40*grid];
    label.hv = [];

    // create all of the rectangles and text boxes
    for (i = 0; i < 3; i++){
        x = dataStore.SOH.cells.hv_x[i];
        y = topmargin+4*grid;
        w = dataStore.SOH.parameters.hv.width;
        h = dataStore.SOH.parameters.hv.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.hv[i] = new qdshape(path, {
            id: 'hv'+i,
            fillStyle: dataStore.SOH.parameters.hv.fill,
            strokeStyle: dataStore.SOH.parameters.hv.stroke,
            lineWidth: dataStore.SOH.parameters.hv.strokeW,
            z: 1
        });

        label.hv[i] = new qdtext('HV-'+i, {
            x: x + dataStore.SOH.parameters.label.maxFontSize,
            y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.hv[i].squishFont(18*grid);
    }

    //////////////////////////////////////////////////////////////////////////////
    // NIM crates are included next and numbered in the same way as the HV crates.
    //////////////////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.nim = [];
    label.nim =[];

    for (i = 0; i < 5; i++){
        x = leftmargin+20*i*grid;
        y = topmargin+13*grid;
        w = dataStore.SOH.parameters.nim.width;
        h = dataStore.SOH.parameters.nim.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.nim[i] = new qdshape(path, {
            id: 'nim'+i,
            fillStyle: dataStore.SOH.parameters.nim.fill,
            strokeStyle: dataStore.SOH.parameters.nim.stroke,
            lineWidth: dataStore.SOH.parameters.nim.strokeW,
            z: 1
        });

        label.nim[i] = new qdtext('NIM '+(i+1), {
            x: x + dataStore.SOH.parameters.label.maxFontSize,
            y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.nim[i].squishFont(18*grid);
    } 

    for (i = 5; i < 7; i++){
        x = leftmargin+60*grid;
        y = topmargin+(47+8*(i-5))*grid;
        w = dataStore.SOH.parameters.nim.width;
        h = dataStore.SOH.parameters.nim.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.nim[i] = new qdshape(path, {
            id: 'nim'+i,
            fillStyle: dataStore.SOH.parameters.nim.fill,
            strokeStyle: dataStore.SOH.parameters.nim.stroke,
            lineWidth: dataStore.SOH.parameters.nim.strokeW,
            z: 1
        });

        label.nim[i] = new qdtext('NIM '+(i+1), {
            x: x + dataStore.SOH.parameters.label.maxFontSize,
            y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.nim[i].squishFont(18*grid);
    }

    ////////////////////////////////////////////////////
    // VME crates are added next and numbered as before.
    ////////////////////////////////////////////////////    

    dataStore.SOH.cells.vme = [];
    label.vme = [];

    for (j = 0; j < 3; j++){
        for (i = 0; i < 5; i++){
            VMEtitle = 'VME-'+i+VMELabels[j];

            x = leftmargin+20*i*grid;
            y = topmargin+(j*9+20)*grid;
            w = dataStore.SOH.parameters.vme.width;
            h = dataStore.SOH.parameters.vme.height;
            path = generatePath([0,0, w,0, w,h, 0,h], x, y);

            dataStore.SOH.cells.vme[j*5+i] = new qdshape(path, {
                id: 'vme'+i,
                fillStyle: dataStore.SOH.parameters.vme.fill,
                strokeStyle: dataStore.SOH.parameters.vme.stroke,
                lineWidth: dataStore.SOH.parameters.vme.strokeW,
                z: 1
            });

            label.vme[j*5+i] = new qdtext(VMEtitle, {
                x: x + dataStore.SOH.parameters.label.maxFontSize,
                y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
                fontSize: dataStore.SOH.parameters.label.maxFontSize,
                typeface: dataStore.SOH.parameters.label.font,
                fillStyle: dataStore.SOH.parameters.label.fontcolour
            });

            dataStore.SOH.cells.vme[j*5+i].mouseover = writeTooltip.bind(null, 'vme');
            dataStore.SOH.cells.vme[j*5+i].mousemove = moveTooltip;
            dataStore.SOH.cells.vme[j*5+i].mouseout = hideTooltip;
            label.vme[j*5+i].squishFont(18*grid);

            dataStore.SOH.cells.vme[j*5+i].click = function(vme){

                document.getElementById('controlsidebar').innerHTML = Mustache.to_html(
                    dataStore.templates['vme-cycle'], 
                    {
                        'title': vme
                    }
                );

            }.bind(null, VMEtitle);
            
        }
    }   

    /////////////////////////////////////////////////////////
    // Data storage arrays are added, all numbered as before.
    /////////////////////////////////////////////////////////

    dataStore.SOH.cells.dsa = [];
    label.dsa = [];

    x = leftmargin;
    y = topmargin+47*grid;
    w = dataStore.SOH.parameters.dsa.width;
    h = dataStore.SOH.parameters.dsa.height;
    path = generatePath([0,0, w,0, w,h, 0,h], x, y);

    dataStore.SOH.cells.dsa[0] = new qdshape(path, {
        id: 'dsa0',
        fillStyle: dataStore.SOH.parameters.dsa.fill,
        strokeStyle: dataStore.SOH.parameters.dsa.stroke,
        lineWidth: dataStore.SOH.parameters.dsa.strokeW,
        z: 1
    });

    label.dsa0 = new qdtext('Data Storage Array 1', {
        x: x + dataStore.SOH.parameters.label.maxFontSize/2,
        y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
        fontSize: dataStore.SOH.parameters.label.maxFontSize,
        typeface: dataStore.SOH.parameters.label.font,
        fillStyle: dataStore.SOH.parameters.label.fontcolour
    });

    label.dsa0.squishFont(18*grid);

    for (i = 1; i < 4; i++){
        x = leftmargin+20*(i-1)*grid;
        y = topmargin+54*grid;
        w = dataStore.SOH.parameters.dsa.width;
        h = dataStore.SOH.parameters.dsa.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.dsa[i] = new qdshape(path, {
            id: 'dsa'+i,
            fillStyle: dataStore.SOH.parameters.dsa.fill,
            strokeStyle: dataStore.SOH.parameters.dsa.stroke,
            lineWidth: dataStore.SOH.parameters.dsa.strokeW,
            z: 1
        });

        label.dsa[i] = new qdtext('Data Storage Array '+(i+1), {
            x: x + dataStore.SOH.parameters.label.maxFontSize/2,
            y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.dsa[i].squishFont(18*grid);
    }     

    //////////////////////////////////////////////////////////////////
    // The network switches are added and numbered from left to right.
    //////////////////////////////////////////////////////////////////

    dataStore.SOH.cells.net = [];
    label.net = [];

    for (i = 0; i < 4; i++){
        x = leftmargin+(20+20*i)*grid;
        y = topmargin+53*grid;
        w = dataStore.SOH.parameters.net.width;
        h = dataStore.SOH.parameters.net.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.net[i] = new qdshape(path, {
            id: 'net'+i,
            fillStyle: dataStore.SOH.parameters.net.fill,
            strokeStyle: dataStore.SOH.parameters.net.stroke,
            lineWidth: dataStore.SOH.parameters.net.strokeW,
            z: 1
        });

        label.net[i] = new qdtext('Network Switch '+(i+1), {
            x: x + dataStore.SOH.parameters.label.maxFontSize/2,
            y: y + 0.9*h,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.net[i].squishFont(8*grid);
    }   

    /////////////////////////////////////////
    // The 2 computers are added into rack 1.
    /////////////////////////////////////////

    dataStore.SOH.cells.comp = [];
    label.comp = [];

    for (i = 0; i < 2; i++){
        x = leftmargin;
        y = topmargin+(40+3*i)*grid;
        w = dataStore.SOH.parameters.comp.width;
        h = dataStore.SOH.parameters.comp.height;
        path = generatePath([0,0, w,0, w,h, 0,h], x, y);

        dataStore.SOH.cells.comp[i] = new qdshape(path, {
            id: 'comp'+i,
            fillStyle: dataStore.SOH.parameters.comp.fill,
            strokeStyle: dataStore.SOH.parameters.comp.stroke,
            lineWidth: dataStore.SOH.parameters.comp.strokeW,
            z: 1
        });

        label.comp[i] = new qdtext('Computer '+(i+1), {
            x: x + dataStore.SOH.parameters.label.maxFontSize/2,
            y: y + h/2 + dataStore.SOH.parameters.label.maxFontSize/2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: dataStore.SOH.parameters.label.fontcolour
        });

        label.comp[i].squishFont(18*grid);
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

        label.racks[i] = new qdtext('Rack '+(i+1), {
            x: leftmargin+(6+20*i)*grid,
            y: topmargin + dataStore.SOH.parameters.label.maxFontSize-2,
            fontSize: dataStore.SOH.parameters.label.maxFontSize,
            typeface: dataStore.SOH.parameters.label.font,
            fillStyle: '#EEEEEE'
        });

        label.racks[i].squishFont(18*grid);
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

    //dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.cableman[14]);

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
        dataStore.SOH.rackImage.mainLayer.add(dataStore.SOH.cells.vme[i])
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

    dataStore.SOH.rackImage.stage.render();
}


//////////////////////
// updating
//////////////////////

function dataUpdate(payload){
    // update the display based on the current contents of dataStore.SOH.ODB.Equipment

    updateRunStatus();
    updateThermometerFlags();
    dataStore.SOH.rackImage.stage.render();
    if(dataStore.tooltip.currentTooltipTarget)
        writeTooltip(dataStore.tooltip.currentTooltipTarget);
}

function updateThermometerFlags(){
    // color thermometers red if things are too hot

    var critTemp = 32,
        i;

    for(i=0; i<5; i++){
        if(dataStore.SOH.ODB.Equipment[0].Agilent34970A.Variables.DATA[i] > critTemp)
            dataStore.SOH.cells.sensorstop[i].fillStyle = 'red';
        else
            dataStore.SOH.cells.sensorstop[i].fillStyle = 'lightgray';

        if(dataStore.SOH.ODB.Equipment[0].Agilent34970A.Variables.DATA[i+5] > critTemp)
            dataStore.SOH.cells.sensorsbottom[i].fillStyle = 'red';
        else
            dataStore.SOH.cells.sensorsbottom[i].fillStyle = 'lightgray';
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




function configGRIFFINclover(index, suppressors){
    var names = [],
        MSC = [],
        masterChan = (index<9) ? 0 : 1,

        // This commented out version is for when there are sufficient digitizers for two modules per GRIFFIN HPGe position
        //  firstCollectorChan = ((index-1)%8)*2, //ie, collector channel is first of 2 GRIF-16s for this position
        firstCollectorChan = Math.floor((index-1)/4), //ie, collector channel

        collectorChan,  
        ADC,
        name, address,
        crystalPrefix = 'GRG' + ((index<10) ? '0'+index : index),
        color = ['B', 'G', 'R', 'W'],
        crystalSuffix = ['N00A', 'N00B'],
        vetoPrefix = 'GRS' + ((index<10) ? '0'+index : index),
        i,j,k;

    if(suppressors){
        //HPGe
        for(i=0; i<crystalSuffix.length; i++){
            for(j=0; j<color.length; j++){
                name = crystalPrefix + color[j] + crystalSuffix[i];

                collectorChan = firstCollectorChan + i;
                ADC = j;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;

                names.push(name);
                MSC.push(address);
            }
        }

        //BGO
        for(j=0; j<color.length; j++){
            for(i=0; i<5; i++){
                name = vetoPrefix + color[j] + 'N0' + i + 'X';

                collectorChan = firstCollectorChan + ((j<2) ? 0 : 1);
                ADC = 5 + (j%2)*5+i;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;

                names.push(name);
                MSC.push(address);
            }
        }

    } else{
        /*
        // This commented out version is for when there are sufficient digitizers for two modules per GRIFFIN HPGe position
        for(i=0; i<crystalSuffix.length; i++){
            for(j=0; j<color.length; j++){
                name = crystalPrefix + color[j] + crystalSuffix[i];

                collectorChan = firstCollectorChan;
                ADC = j + 4*i;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;

                names.push(name);
                MSC.push(address);
            }
        }
        */  
        // Temporary version while we do not have enough digitizers, see above
        i=0; // only enough digitizers for one contact
        for(j=0; j<color.length; j++){
            name = crystalPrefix + color[j] + crystalSuffix[i];

            collectorChan = firstCollectorChan;
            ADC = j + 4*((index-1)%4);
            masterChan=0;
            address = (masterChan << 12) | (collectorChan << 8) | ADC;
            names.push(name);
            MSC.push(address);
        }
                
    }

    return [names, MSC];
}

function configSCEPTAR(US, DS, ZDS){
    var names = [],
        MSC = [],
        i;

    if(DS){
        for(i=1; i<11; i++){
            names.push('SEP' + ((i<10) ? '0'+i : i) + 'XN00X');
            MSC.push((2 << 12) | ( (4+Math.floor((i-1)/4)) << 8) | (i-1)%4);
        }
    } else if(ZDS){
        names.push('ZDS01XN00X');
        MSC.push(0x2601);
        names.push('ZDS01XT00X');
        MSC.push(0x2208);
    }

    if(US){
        for(i=11; i<21; i++){
            names.push('SEP' + i + 'XN00X');
            MSC.push((2 << 12) | ( ( 6 + Math.floor((i - 11 + 2)/4) ) << 8) | (i+3)%4);
        }
    }

    return [names, MSC];
}

function configDANTE(US, DS){
    var names = [],
        MSC = [],
        i, j, min, max, suppressorMSC;

    if(!US && !DS) return [names, MSC]; //do nothing

    if(DS)
        min = 0;
    else
        min = 4;

    if(US)
        max = 8;
    else
        max = 4;

    //LaBr - energy
    for(i=min; i<max; i++){
        names.push('DAL0'+(1+i)+'XN00X');
        MSC.push((2 << 12) | ( 1 << 8) | i);
    }
    //LaBr - TAC
    for(i=min; i<max; i++){
        names.push('DAL0'+(1+i)+'XT00X');
        MSC.push((2 << 12) | ( 2 << 8) | i);
    }
    //Suppressors
    for(i=min; i<max; i++){
        for(j=0; j<3; j++){
            names.push('DAS0'+(1+i)+'XN0'+j+'X');
            //first 8 go in the bottom of 0x2100
            if(i<2 || (i==2 && j<2))
                MSC.push((2 << 12) | ( 1 << 8) | (3*i+j + 8) );
            //rest stack up in 0x2300
            else
                MSC.push((2 << 12) | ( 3 << 8) | (3*i+j - 8) );
        }
    }   

    return [names, MSC];

}

function configPACES(){
    var names = ['PAC01XN00X', 'PAC02XN00X', 'PAC03XN00X', 'PAC04XN00X', 'PAC05XN00X'],
        MSC = [0x2000, 0x2001, 0x2002, 0x2003, 0x2004];

        return [names, MSC];
}

function configSPICE(){
    var names = [],
        MSC = [],
        i, index;

    for(i=0; i<120; i++){
        index = i;
        if(index < 10) index = '00'+index;
        else if(index < 100) index = '0'+index;

        names.push('SPI00XN'+index);
        MSC.push(0x4000 + 256*Math.floor(i/16) + (i%16) );
    }

    return [names, MSC];
}

function configS2S3(type){
    var names = [],
        MSC = [],
        radial = 24, azimuthal, typeCode,
        i;

    if(type == 2){
        typeCode = 'E';
        azimuthal = 16;
    } else if(type == 3){
        typeCode = 'Z';
        azimuthal = 32;
    }
    //radial first: first 8 finishes off last digitizer, other 16 fill the next; then azimuthal channels fill 1 or 2 more grif16s
    for(i=0; i<radial; i++){
        names.push('SP'+typeCode+'00DP'+((i<10)? '0'+i : i)+'X');

        if(i<8){
            MSC.push(0x4708 + i);
        } else{
            MSC.push(0x4800 + i-8);
        }
    }

    for(i=0; i<azimuthal; i++){
        names.push('SP'+typeCode+'00DN'+((i<10)? '0'+i : i)+'X');

        MSC.push(0x4900 + Math.floor(i/16)*0x100 + (i%16) );
    }

    return [names, MSC];
}

function configDESCANT(){
    var names = [],
        MSC = [],
        cableBundles = [],
        i, j;

    //weird ordering thanks to cable bundling constraints:
    cableBundles = [
        [46, 65, 66, 67],
        [13, 27, 26, 45],
        [28, 47, 48, 68],
        [5, 14, 15, 29],
        [0, 49, 69],
        [1, 6, 30],
        [16, 31, 50, 51],
        [7, 17, 18, 32],
        [33, 52, 53, 54],

        [43, 44, 63, 64],
        [25, 42, 62],
        [4, 11, 12, 24],
        [23, 41, 40, 61],
        [10, 22, 39, 60],
        [2, 3, 8, 9],
        [21, 38, 59],
        [20, 37, 57, 58],
        [19, 36, 56],
        [34, 35, 55]
    ]

    for(i=0; i<cableBundles.length; i++){
        for(j=0; j<cableBundles[i].length; j++){
            names.push('DSC' + ((cableBundles[i][j] < 10) ? '0'+cableBundles[i][j] : cableBundles[i][j]) + 'XN00X');

            //first three cable bundles are on collector 0x2, rest are on 0x3
            if(i<3){
                MSC.push(0x2000 | ((9+i)<<8) | j )
            } else{
                MSC.push(0x3000 | ((i-3)<<8) | j )
            }
        }
    }

    return [names, MSC];
}
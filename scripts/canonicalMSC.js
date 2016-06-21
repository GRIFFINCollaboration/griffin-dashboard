hackMode = true  // hackMode = true rearranges GRIFFIN cabling to fit in 4 digitizers, while we wait for the others to arrive.

canonicalMSC = {
    GRIFFIN: {
        unsuppressed: {
            M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
            S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
        },
        suppressed: {
            crystals: {
                //A-channel
                A: {
                    M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
                    S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
                },
                //B-channel
                B: {
                    M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
                    S: [null, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15]
                }
            },
            suppressors: {
                //blue and green quads
                BG: {
                    M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
                    S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
                },
                //red and white quads
                RW: {
                    M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
                    S: [null, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15]
                }
            }
        }
    }
}

if(hackMode)
    canonicalMSC.GRIFFIN.unsuppressed = {
            M: [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            S: [null, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] 
        }

function configGRIFFINclover(index, suppressors){

    var crystals = hackMode ? ['A'] : ['A', 'B'],
        quads = ['B', 'G', 'R', 'W'],
        names = [], MSC = [],
        crystalPrefix = 'GRG' + ((index<10) ? '0'+index : index),
        vetoPrefix = 'GRS' + ((index<10) ? '0'+index : index),
        name, quadKey, ADC, masterChan, collectorChan, address, i, j;

    if(suppressors){
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                masterChan = canonicalMSC.GRIFFIN.suppressed.crystals[crystals[i]].M[index];
                collectorChan = canonicalMSC.GRIFFIN.suppressed.crystals[crystals[i]].S[index];
                ADC = j;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;
                names.push(name);
                MSC.push(address);
            }
        }

        // BGO
        for(j=0; j<quads.length; j++){
            for(i=0; i<5; i++){
                name = vetoPrefix + quads[j] + 'N0' + i + 'X';
                quadKey = (j<2) ? 'BG' : 'RW';
                masterChan = canonicalMSC.GRIFFIN.suppressed.suppressors[quadKey].M[index];
                collectorChan = canonicalMSC.GRIFFIN.suppressed.suppressors[quadKey].S[index];
                ADC = 5 + (j%2)*5+i;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;
                names.push(name);
                MSC.push(address);
            }
        }
    } else {
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                masterChan = canonicalMSC.GRIFFIN.unsuppressed.M[index];
                collectorChan = canonicalMSC.GRIFFIN.unsuppressed.S[index];
                ADC = hackMode ? j + 4*((index-1)%4) : j + 4*i;
                address = (masterChan << 12) | (collectorChan << 8) | ADC;
                names.push(name);
                MSC.push(address);
            }
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

function configLaBr3(US, DS){
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
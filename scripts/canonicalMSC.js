hackMode = false  // hackMode = true rearranges GRIFFIN cabling to fit in 4 digitizers, while we wait for the others to arrive.

canonicalMSC = {
    // GRIFFIN arrays of positions indexed by array position
    GRIFFIN: {
        M: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
        unsuppressed: {
            S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
        },
        suppressed: {
            crystals: {
                //A-channel
                A: {
                    S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
                },
                //B-channel
                B: {
                    S: [null, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15]
                }
            },
            suppressors: {
                //blue and green quads
                BG: {
                    S: [null, 0, 2, 4, 6, 8, 10, 12, 14, 0, 2, 4, 6, 8, 10, 12, 14]
                },
                //red and white quads
                RW: {
                    S: [null, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15]
                }
            }
        }
    },

    SCEPTAR: {
        ZDS: {
            energy: 0x2601,
            time:   0x2208
        },
        M: 2,
        S: [4,5,6,7,8] // channels divided into 5 groups of 4: 1-4, 5-8, 9-12, 13-16, 17-20
    },

    LaBr3: {
        M: 2,
        energy: {
            S: 1
        },
        time: {
            S: 2
        },
        suppressors: {
            S: [1,3]  // first 12 in 0x-1--, last 12 in 0x-3--
        }
    },

    PACES: {
        M: 2,
        S: 0
    },

    SPICE: {
        M: 4,
        S: [0,1,2,3,4,5,6,7]
    },

    S2S3: {
        M: 4,
        S: [7, 8, 9, 10]
    },

    //DESCANT arrays of positions indexed by cable bundle
    DESCANT: { 
        M: [2, 2,  2,  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  3,  3,  3,  3,  3],
        S: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    }
}

function configGRIFFINclover(index, suppressors){

    var crystals = hackMode ? ['A'] : ['A', 'B'],
        quads = ['B', 'G', 'R', 'W'],
        names = [], MSC = [],
        crystalPrefix = 'GRG' + ((index<10) ? '0'+index : index),
        vetoPrefix = 'GRS' + ((index<10) ? '0'+index : index),
        name, quadKey, ADC, masterChan, collectorChan, i, j;

    if(hackMode){
        canonicalMSC.GRIFFIN.M = [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        canonicalMSC.GRIFFIN.unsuppressed = {
                S: [null, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] 
            }
    }

    if(suppressors){
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                masterChan = canonicalMSC.GRIFFIN.M[index];
                collectorChan = canonicalMSC.GRIFFIN.suppressed.crystals[crystals[i]].S[index];
                ADC = j;
                MSC.push({
                    chan: name, 
                    M:masterChan, 
                    S:collectorChan, 
                    C:ADC
                });
            }
        }

        // BGO
        for(j=0; j<quads.length; j++){
            for(i=0; i<5; i++){
                name = vetoPrefix + quads[j] + 'N0' + i + 'X';
                quadKey = (j<2) ? 'BG' : 'RW';
                masterChan = canonicalMSC.GRIFFIN.M[index];
                collectorChan = canonicalMSC.GRIFFIN.suppressed.suppressors[quadKey].S[index];
                ADC = 5 + (j%2)*5+i;
                MSC.push({
                    chan: name, 
                    M:masterChan, 
                    S:collectorChan, 
                    C:ADC
                });
            }
        }
    } else {
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                masterChan = canonicalMSC.GRIFFIN.M[index];
                collectorChan = canonicalMSC.GRIFFIN.unsuppressed.S[index];
                ADC = hackMode ? j + 4*((index-1)%4) : j + 4*i;
                MSC.push({
                    chan: name, 
                    M:masterChan, 
                    S:collectorChan, 
                    C:ADC
                });
            }
        }
    }

    return MSC;
}

function configSCEPTAR(US, DS, ZDS){

    var names = [], MSC = [], masterChan, collectorChan, ADC, address, i;

    if(ZDS){
        names.push('ZDS01XN00X');
        MSC.push(canonicalMSC.SCEPTAR.ZDS.energy);
        names.push('ZDS01XT00X');
        MSC.push(canonicalMSC.SCEPTAR.ZDS.time);
    } else if(DS){
        for(i=1; i<11; i++){
            names.push('SEP' + ((i<10) ? '0'+i : i) + 'XN00X');

            masterChan = canonicalMSC.SCEPTAR.M;
            collectorChan = canonicalMSC.SCEPTAR.S[Math.floor((i-1)/4)];
            ADC = (i-1)%4
            address = (masterChan << 12) | (collectorChan << 8) | ADC;
            MSC.push(address);
        }
    }

    if(US){
        for(i=11; i<21; i++){
            names.push('SEP' + i + 'XN00X');

            masterChan = canonicalMSC.SCEPTAR.M;
            collectorChan = canonicalMSC.SCEPTAR.S[Math.floor((i-1)/4)];
            ADC = (i-1)%4
            address = (masterChan << 12) | (collectorChan << 8) | ADC;
            MSC.push(address);
        }
    }

    return [names, MSC];
}

function configLaBr3(US, DS){

    var names = [], MSC = [], masterChan, collectorChan, ADC, address, min, max, i;

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
        masterChan = canonicalMSC.LaBr3.M;
        collectorChan = canonicalMSC.LaBr3.energy.S
        MSC.push((masterChan << 12) | ( collectorChan << 8) | i);
    }
    //LaBr - TAC
    for(i=min; i<max; i++){
        names.push('DAL0'+(1+i)+'XT00X');
        masterChan = canonicalMSC.LaBr3.M;
        collectorChan = canonicalMSC.LaBr3.time.S
        MSC.push((masterChan << 12) | ( collectorChan << 8) | i);
    }
    //Suppressors
    for(i=min; i<max; i++){
        for(j=0; j<3; j++){
            names.push('DAS0'+(1+i)+'XN0'+j+'X');
            masterChan = canonicalMSC.LaBr3.M;
            if(i<2 || (i==2 && j<2)){ // first 12
                collectorChan = canonicalMSC.LaBr3.suppressors.S[0];
                MSC.push((masterChan << 12) | ( collectorChan << 8) | (3*i+j + 8));
            }else{ // last 12
                collectorChan = canonicalMSC.LaBr3.suppressors.S[1];
                MSC.push((masterChan << 12) | ( collectorChan << 8) | (3*i+j - 8));
            }
        }
    }   

    return [names, MSC];
}

function configPACES(){
    var names = ['PAC01XN00X', 'PAC02XN00X', 'PAC03XN00X', 'PAC04XN00X', 'PAC05XN00X'],
        MSC = [], masterChan, collectorChan, ADC, i;

    for(i=0; i<5; i++){
        masterChan = canonicalMSC.PACES.M;
        collectorChan = canonicalMSC.PACES.S;
        ADC = i;
        MSC.push({
            chan: names[i], 
            M:masterChan, 
            S:collectorChan, 
            C:ADC
        });
    }

    return MSC;
}

function configSPICE(){
    var names = [], MSC = [], masterChan, collectorChan, ADC, address, i;

    for(i=0; i<120; i++){
        names.push('SPI00XN' + ((i>=100) ? i : ((i>=10) ? '0'+i : '00'+i)) );
        masterChan = canonicalMSC.SPICE.M;
        collectorChan = canonicalMSC.SPICE.S[Math.floor(i/16)];
        ADC = i%16;
        address = (masterChan << 12) | (collectorChan << 8) | ADC;
        MSC.push(address);     
    }

    return [names, MSC];
}

function configS2S3(type){
    var names = [],
        MSC = [],
        radial = 24, 
        azimuthal, typeCode, masterChan, collectorChan, ADC, address, i;

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
        masterChan = canonicalMSC.S2S3.M;
        if(i<8){
            collectorChan = canonicalMSC.S2S3.S[0];
            ADC = 8+i;
        }else{
            collectorChan = canonicalMSC.S2S3.S[1];
            ADC = i-8;
        }
        address = (masterChan << 12) | (collectorChan << 8) | ADC;
        MSC.push(address);
    }

    for(i=0; i<azimuthal; i++){
        names.push('SP'+typeCode+'00DN'+((i<10)? '0'+i : i)+'X');
        masterChan = canonicalMSC.S2S3.M;
        collectorChan = canonicalMSC.S2S3.S[2 + Math.floor(i/16)];
        ADC = i%16;
        address = (masterChan << 12) | (collectorChan << 8) | ADC;
        MSC.push(address);
    }

    return [names, MSC];
}

function configDESCANT(){
    var names = [],
        MSC = [],
        cableBundles = [],
        masterChan, collectorChan, address,
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
            masterChan = canonicalMSC.DESCANT.M[i];
            collectorChan = canonicalMSC.DESCANT.S[i];
            address = (masterChan << 12) | (collectorChan << 8) | j;
            MSC.push(address);
        }
    }

    return [names, MSC];
}
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
            energy: {
                M: 2,
                S: 0, // ZDS in same GRIF-16 as downstream sceptar
                C: 15
            }//,
           // time: {
           //     M: 2,
            //    S: 2,
            //    C: 8
           // }
        },
        M: 2,
       // S: [4,5,6,7,8] // If using GRIF-4G: channels divided into 5 groups of 4: 1-4, 5-8, 9-12, 13-16, 17-20
        S: [0,1] // If using GRIF-16:  channels divided into 2 groups of 10: 1-10, 11-20
    },

    PACES: {
        M: 2,
        S: 1, // PACES in same GRIF-16 as Upstream sceptar
	C: 11
    },

    LaBr3: {
        M: 2,
        energy: {
            S: [2,3] // energies split in two groups of 4
        },
        time: {
            S: 4
        },
        suppressors: {
            S: [2,3]  // first 12 in 0x-3--, last 12 in 0x-4--
        }
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
        cableBundles: [
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
        ],
        M: [2, 2,  2,  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  3,  3,  3,  3,  3],
        S: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    },

    datatypes: {
        griffin_low_gain: 0,
        griffin_high_gain: 1,
        sceptar: 2,
        labr3_energy: 3,
        labr3_time: 4,
        paces: 5,
        descant: 6,
        griffin_suppressors: 7,
        labr3_suppressors: 8,
        zds: 9
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
                    C:ADC,
                    addr: stringAddress(masterChan,collectorChan,ADC),
                    datatype: canonicalMSC.datatypes.griffin_low_gain
                });
            }
        }

        // BGO
        for(j=0; j<quads.length; j++){
            for(i=1; i<6; i++){
                name = vetoPrefix + quads[j] + 'N0' + i + 'X';
                quadKey = (j<2) ? 'BG' : 'RW';
                masterChan = canonicalMSC.GRIFFIN.M[index];
                collectorChan = canonicalMSC.GRIFFIN.suppressed.suppressors[quadKey].S[index];
                ADC = 4 + (j%2)*5+i;
                MSC.push({
                    chan: name, 
                    M:masterChan, 
                    S:collectorChan, 
                    C:ADC,
                    addr: stringAddress(masterChan,collectorChan,ADC),
                    datatype: canonicalMSC.datatypes.griffin_suppressors
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
                    C:ADC,
                    addr: stringAddress(masterChan,collectorChan,ADC),
                    datatype:canonicalMSC.datatypes.griffin_low_gain
                });
            }
        }
    }

    return MSC;
}

function configSCEPTAR(US, DS, ZDS){

    var name, MSC = [], masterChan, collectorChan, ADC, i;

    if(ZDS){
        MSC.push({
            chan: 'ZDS01XN00X', 
            M: canonicalMSC.SCEPTAR.ZDS.energy.M, 
            S: canonicalMSC.SCEPTAR.ZDS.energy.S, 
            C: canonicalMSC.SCEPTAR.ZDS.energy.C,
            addr: stringAddress(canonicalMSC.SCEPTAR.ZDS.energy.M,canonicalMSC.SCEPTAR.ZDS.energy.S,canonicalMSC.SCEPTAR.ZDS.energy.C),
            datatype: canonicalMSC.datatypes.zds
        });
      //  MSC.push({
      //      chan: 'ZDS01XT00X', 
      //      M: canonicalMSC.SCEPTAR.ZDS.time.M, 
      //      S: canonicalMSC.SCEPTAR.ZDS.time.S, 
      //      C: canonicalMSC.SCEPTAR.ZDS.time.C,
      //      addr: stringAddress(canonicalMSC.SCEPTAR.ZDS.time.M,canonicalMSC.SCEPTAR.ZDS.time.S,canonicalMSC.SCEPTAR.ZDS.time.C),
      //      datatype: canonicalMSC.datatypes.zds
      //  });
    } else if(DS){
        for(i=1; i<11; i++){
            name = 'SEP' + ((i<10) ? '0'+i : i) + 'XN00X';
            masterChan = canonicalMSC.SCEPTAR.M;
            collectorChan = canonicalMSC.SCEPTAR.S[0];
            ADC = (i-1)%10;
            MSC.push({
                chan: name, 
                M: masterChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(masterChan,collectorChan,ADC),
                datatype: canonicalMSC.datatypes.sceptar
            });
        }
    }
    if(US){
        for(i=11; i<21; i++){
            name = 'SEP' + i + 'XN00X';
            masterChan = canonicalMSC.SCEPTAR.M;
            collectorChan = canonicalMSC.SCEPTAR.S[1];
            ADC = (i-1)%10;
            MSC.push({
                chan: name, 
                M: masterChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(masterChan,collectorChan,ADC),
                datatype: canonicalMSC.datatypes.sceptar
            });
        }
    }

    return MSC;
}

function configPACES(){
    var names = ['PAC01XN00X', 'PAC02XN00X', 'PAC03XN00X', 'PAC04XN00X', 'PAC05XN00X'],
        MSC = [], masterChan, collectorChan, ADC, i;

    for(i=0; i<5; i++){
        masterChan = canonicalMSC.PACES.M;
        collectorChan = canonicalMSC.PACES.S;
        ADC = canonicalMSC.PACES.C+i;
        MSC.push({
            chan: names[i], 
            M:masterChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: canonicalMSC.datatypes.paces
        });
    }

    return MSC;
}

function configLaBr3(US, DS){

    var name, MSC = [], masterChan, collectorChan, ADC, min, max, i, secondary;

    if(!US && !DS) return [names, MSC]; //do nothing

    if(DS && !US){
        min = 0;
        max = 4;
        secondary=0;
    }
    else if(US && !DS){
	min = 4;
        max = 8;
        secondary=1;
    } 
    else {
	min = 0;
	max = 8;
        secondary = 0;
    }
	
    //LaBr - energy
    for(i=min; i<max; i++){
        name = 'LBL'+((i < 10)? '0'+(i+1) : i+1)+'XN00X';
        masterChan = canonicalMSC.LaBr3.M;
	if (i < 4) { secondary = 0; }
	else { secondary = 1; }
        collectorChan = canonicalMSC.LaBr3.energy.S[secondary];
        ADC = (i-min) % 4;
        MSC.push({
            chan: name, 
            M: masterChan, 
            S: collectorChan, 
            C: ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: canonicalMSC.datatypes.labr3_energy
        });
    }
	
    //LaBr - TAC
    for(i=min; i<max; i++){
        name = 'LBT0'+(1+i)+'XT00X';
        masterChan = canonicalMSC.LaBr3.M;
        collectorChan = canonicalMSC.LaBr3.time.S
        ADC = i*2;
        MSC.push({
            chan: name, 
            M: masterChan, 
            S: collectorChan, 
            C: ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: canonicalMSC.datatypes.labr3_time
        });
    }

    //Suppressors
    for(i=min; i<max; i++){
        for(j=0; j<3; j++){
	    if (j == 0) {
            	name = 'LBS'+((i < 10)? '0'+(i+1) : (i+1))+'A'+'N00X';
	    } else if (j == 1) {
		name = 'LBS'+((i < 10)? '0'+(i+1) : (i+1))+'B'+'N00X';
	    } else {
		name = 'LBS'+((i < 10)? '0'+(i+1) : (i+1))+'C'+'N00X';
	    }
            masterChan = canonicalMSC.LaBr3.M;
	    if (i < 4) { secondary = 0; }
	    else { secondary = 1; }
            collectorChan = canonicalMSC.LaBr3.energy.S[secondary];
            ADC = ((((i - min) % 4) + 1) * 3 + (j + 1)) % 16;
            MSC.push({
                chan: name, 
                M: masterChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(masterChan,collectorChan,ADC),
                datatype: canonicalMSC.datatypes.labr3_suppressors
            });  
        }
    }   

    return MSC;
}

function configSPICE(){
    var name, MSC = [], masterChan, collectorChan, ADC, i;

    for(i=0; i<120; i++){
        name = 'SPI00XN' + ((i>=100) ? i : ((i>=10) ? '0'+i : '00'+i));
        masterChan = canonicalMSC.SPICE.M;
        collectorChan = canonicalMSC.SPICE.S[Math.floor(i/16)];
        ADC = i%16;
        MSC.push({
            chan: name, 
            M:masterChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: 99
        });     
    }

    return MSC;
}

function configS2S3(type){
    var MSC = [],
        radial = 24, 
        name, azimuthal, typeCode, masterChan, collectorChan, ADC, address, i;

    if(type == 2){
        typeCode = 'E';
        azimuthal = 16;
    } else if(type == 3){
        typeCode = 'Z';
        azimuthal = 32;
    }
    //radial first: first 8 finishes off last digitizer, other 16 fill the next; then azimuthal channels fill 1 or 2 more grif16s
    for(i=0; i<radial; i++){
        name = 'SP'+typeCode+'00DP'+((i<10)? '0'+i : i)+'X';
        masterChan = canonicalMSC.S2S3.M;
        if(i<8){
            collectorChan = canonicalMSC.S2S3.S[0];
            ADC = 8+i;
        }else{
            collectorChan = canonicalMSC.S2S3.S[1];
            ADC = i-8;
        }
        MSC.push({
            chan: name, 
            M:masterChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: 99
        }); 
    }

    for(i=0; i<azimuthal; i++){
        name = 'SP'+typeCode+'00DN'+((i<10)? '0'+i : i)+'X';
        masterChan = canonicalMSC.S2S3.M;
        collectorChan = canonicalMSC.S2S3.S[2 + Math.floor(i/16)];
        ADC = i%16;
        MSC.push({
            chan: name, 
            M:masterChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(masterChan,collectorChan,ADC),
            datatype: 99
        }); 
    }

    return MSC;
}

function configDESCANT(){
    var MSC = [],
        cableBundles = [],
        name, masterChan, collectorChan,
        cableBundles = canonicalMSC.DESCANT.cableBundles,
        i, j;

    for(i=0; i<cableBundles.length; i++){
        for(j=0; j<cableBundles[i].length; j++){
            name = 'DSC' + ((cableBundles[i][j] < 10) ? '0'+cableBundles[i][j] : cableBundles[i][j]) + 'XN00X';
            masterChan = canonicalMSC.DESCANT.M[i];
            collectorChan = canonicalMSC.DESCANT.S[i];
            MSC.push({
                chan: name, 
                M:masterChan, 
                S:collectorChan, 
                C:j,
                addr: stringAddress(masterChan,collectorChan,j),
                datatype: canonicalMSC.datatypes.descant
            }); 
        }
    }

    return MSC;
}

function stringAddress(M,S,C){
    // return a string representation of the address described by numerical M, S and C

    return '0x' + (M==0?'0':'') + ((M << 12) | (S << 8) | C).toString(16);  
}

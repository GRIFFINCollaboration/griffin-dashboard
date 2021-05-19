hackMode = false  // hackMode = true rearranges GRIFFIN cabling to fit in 4 digitizers, while we wait for the others to arrive.

canonicalPSC = {
    // GRIFFIN arrays of positions indexed by array position
    GRIFFIN: {
        P: [null, 0, 0, 0, 0, 0, 0,  0,  0,  1, 1, 1, 1, 1, 1,  1,  1],
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
                P: 2,
                S: 0, // ZDS in same GRIF-16 as downstream sceptar
                C: 15
            }//,
           // time: {
           //     P: 2,
            //    S: 2,
            //    C: 8
           // }
        },
        P: 2,
       // S: [4,5,6,7,8] // If using GRIF-4G: channels divided into 5 groups of 4: 1-4, 5-8, 9-12, 13-16, 17-20
        S: [0,1] // If using GRIF-16:  channels divided into 2 groups of 10: 1-10, 11-20
    },

    PACES: {
        P: 2,
        S: 1, // PACES in same GRIF-16 as Upstream sceptar
	C: 11
    },

    LaBr3: {
        P: 2,
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
        P: 4,
        S: [0,1,2,3,4,5,6,7]
    },

    S2S3: {
        P: 4,
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
        P: [2, 2,  2,  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  3,  3,  3,  3,  3],
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
        names = [], PSC = [],
        crystalPrefix = 'GRG' + ((index<10) ? '0'+index : index),
        vetoPrefix = 'GRS' + ((index<10) ? '0'+index : index),
        name, quadKey, ADC, primaryChan, collectorChan, i, j;

    if(hackMode){
        canonicalPSC.GRIFFIN.P = [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        canonicalPSC.GRIFFIN.unsuppressed = {
                S: [null, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] 
            }
    }

    if(suppressors){
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                primaryChan = canonicalPSC.GRIFFIN.P[index];
                collectorChan = canonicalPSC.GRIFFIN.suppressed.crystals[crystals[i]].S[index];
                ADC = j;
                PSC.push({
                    chan: name, 
                    P:primaryChan, 
                    S:collectorChan, 
                    C:ADC,
                    addr: stringAddress(primaryChan,collectorChan,ADC),
                    datatype: canonicalPSC.datatypes.griffin_low_gain
                });
            }
        }

        // BGO
        for(j=0; j<quads.length; j++){
            for(i=1; i<6; i++){
                name = vetoPrefix + quads[j] + 'N0' + i + 'X';
                quadKey = (j<2) ? 'BG' : 'RW';
                primaryChan = canonicalPSC.GRIFFIN.P[index];
                collectorChan = canonicalPSC.GRIFFIN.suppressed.suppressors[quadKey].S[index];
                ADC = 4 + (j%2)*5+i;
                PSC.push({
                    chan: name, 
                    P:primaryChan, 
                    S:collectorChan, 
                    C:ADC,
                    addr: stringAddress(primaryChan,collectorChan,ADC),
                    datatype: canonicalPSC.datatypes.griffin_suppressors
                });
            }
        }
    } else {
        // HPGe
        for(i=0; i<crystals.length; i++){
            for(j=0; j<quads.length; j++){
                name = crystalPrefix + quads[j] + 'N00' + crystals[i];
                primaryChan = canonicalPSC.GRIFFIN.P[index];
                collectorChan = canonicalPSC.GRIFFIN.unsuppressed.S[index];
                ADC = hackMode ? j + 4*((index-1)%4) : j + 4*i;
                PSC.push({
                    chan: name, 
                    P:primaryChan, 
                    S:collectorChan, 
                    C:ADC,
                    addr: stringAddress(primaryChan,collectorChan,ADC),
                    datatype:canonicalPSC.datatypes.griffin_low_gain
                });
            }
        }
    }

    return PSC;
}

function configSCEPTAR(US, DS, ZDS){

    var name, PSC = [], primaryChan, collectorChan, ADC, i;

    if(ZDS){
        PSC.push({
            chan: 'ZDS01XN00X', 
            P: canonicalPSC.SCEPTAR.ZDS.energy.P, 
            S: canonicalPSC.SCEPTAR.ZDS.energy.S, 
            C: canonicalPSC.SCEPTAR.ZDS.energy.C,
            addr: stringAddress(canonicalPSC.SCEPTAR.ZDS.energy.P,canonicalPSC.SCEPTAR.ZDS.energy.S,canonicalPSC.SCEPTAR.ZDS.energy.C),
            datatype: canonicalPSC.datatypes.zds
        });
      //  PSC.push({
      //      chan: 'ZDS01XT00X', 
      //      P: canonicalPSC.SCEPTAR.ZDS.time.P, 
      //      S: canonicalPSC.SCEPTAR.ZDS.time.S, 
      //      C: canonicalPSC.SCEPTAR.ZDS.time.C,
      //      addr: stringAddress(canonicalPSC.SCEPTAR.ZDS.time.P,canonicalPSC.SCEPTAR.ZDS.time.S,canonicalPSC.SCEPTAR.ZDS.time.C),
      //      datatype: canonicalPSC.datatypes.zds
      //  });
    } else if(DS){
        for(i=1; i<11; i++){
            name = 'SEP' + ((i<10) ? '0'+i : i) + 'XN00X';
            primaryChan = canonicalPSC.SCEPTAR.P;
            collectorChan = canonicalPSC.SCEPTAR.S[0];
            ADC = (i-1)%10;
            PSC.push({
                chan: name, 
                P: primaryChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(primaryChan,collectorChan,ADC),
                datatype: canonicalPSC.datatypes.sceptar
            });
        }
    }
    if(US){
        for(i=11; i<21; i++){
            name = 'SEP' + i + 'XN00X';
            primaryChan = canonicalPSC.SCEPTAR.P;
            collectorChan = canonicalPSC.SCEPTAR.S[1];
            ADC = (i-1)%10;
            PSC.push({
                chan: name, 
                P: primaryChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(primaryChan,collectorChan,ADC),
                datatype: canonicalPSC.datatypes.sceptar
            });
        }
    }

    return PSC;
}

function configPACES(){
    var names = ['PAC01XN00X', 'PAC02XN00X', 'PAC03XN00X', 'PAC04XN00X', 'PAC05XN00X'],
        PSC = [], primaryChan, collectorChan, ADC, i;

    for(i=0; i<5; i++){
        primaryChan = canonicalPSC.PACES.P;
        collectorChan = canonicalPSC.PACES.S;
        ADC = canonicalPSC.PACES.C+i;
        PSC.push({
            chan: names[i], 
            P:primaryChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: canonicalPSC.datatypes.paces
        });
    }

    return PSC;
}

function configLaBr3(US, DS){

    var name, PSC = [], primaryChan, collectorChan, ADC, min, max, i, secondary;

    if(!US && !DS) return [names, PSC]; //do nothing

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
        primaryChan = canonicalPSC.LaBr3.P;
	if (i < 4) { secondary = 0; }
	else { secondary = 1; }
        collectorChan = canonicalPSC.LaBr3.energy.S[secondary];
        ADC = (i-min) % 4;
        PSC.push({
            chan: name, 
            P: primaryChan, 
            S: collectorChan, 
            C: ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: canonicalPSC.datatypes.labr3_energy
        });
    }
	
    //LaBr - TAC
    for(i=min; i<max; i++){
        name = 'LBT0'+(1+i)+'XT00X';
        primaryChan = canonicalPSC.LaBr3.P;
        collectorChan = canonicalPSC.LaBr3.time.S
        ADC = i*2;
        PSC.push({
            chan: name, 
            P: primaryChan, 
            S: collectorChan, 
            C: ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: canonicalPSC.datatypes.labr3_time
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
            primaryChan = canonicalPSC.LaBr3.P;
	    if (i < 4) { secondary = 0; }
	    else { secondary = 1; }
            collectorChan = canonicalPSC.LaBr3.energy.S[secondary];
            ADC = ((((i - min) % 4) + 1) * 3 + (j + 1)) % 16;
            PSC.push({
                chan: name, 
                P: primaryChan, 
                S: collectorChan, 
                C: ADC,
                addr: stringAddress(primaryChan,collectorChan,ADC),
                datatype: canonicalPSC.datatypes.labr3_suppressors
            });  
        }
    }   

    return PSC;
}

function configSPICE(){
    var name, PSC = [], primaryChan, collectorChan, ADC, i;

    for(i=0; i<120; i++){
        name = 'SPI00XN' + ((i>=100) ? i : ((i>=10) ? '0'+i : '00'+i));
        primaryChan = canonicalPSC.SPICE.P;
        collectorChan = canonicalPSC.SPICE.S[Math.floor(i/16)];
        ADC = i%16;
        PSC.push({
            chan: name, 
            P:primaryChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: 99
        });     
    }

    return PSC;
}

function configS2S3(type){
    var PSC = [],
        radial = 24, 
        name, azimuthal, typeCode, primaryChan, collectorChan, ADC, address, i;

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
        primaryChan = canonicalPSC.S2S3.P;
        if(i<8){
            collectorChan = canonicalPSC.S2S3.S[0];
            ADC = 8+i;
        }else{
            collectorChan = canonicalPSC.S2S3.S[1];
            ADC = i-8;
        }
        PSC.push({
            chan: name, 
            P:primaryChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: 99
        }); 
    }

    for(i=0; i<azimuthal; i++){
        name = 'SP'+typeCode+'00DN'+((i<10)? '0'+i : i)+'X';
        primaryChan = canonicalPSC.S2S3.P;
        collectorChan = canonicalPSC.S2S3.S[2 + Math.floor(i/16)];
        ADC = i%16;
        PSC.push({
            chan: name, 
            P:primaryChan, 
            S:collectorChan, 
            C:ADC,
            addr: stringAddress(primaryChan,collectorChan,ADC),
            datatype: 99
        }); 
    }

    return PSC;
}

function configDESCANT(){
    var PSC = [],
        cableBundles = [],
        name, primaryChan, collectorChan,
        cableBundles = canonicalPSC.DESCANT.cableBundles,
        i, j;

    for(i=0; i<cableBundles.length; i++){
        for(j=0; j<cableBundles[i].length; j++){
            name = 'DSC' + ((cableBundles[i][j] < 10) ? '0'+cableBundles[i][j] : cableBundles[i][j]) + 'XN00X';
            primaryChan = canonicalPSC.DESCANT.P[i];
            collectorChan = canonicalPSC.DESCANT.S[i];
            PSC.push({
                chan: name, 
                P:primaryChan, 
                S:collectorChan, 
                C:j,
                addr: stringAddress(primaryChan,collectorChan,j),
                datatype: canonicalPSC.datatypes.descant
            }); 
        }
    }

    return PSC;
}

function stringAddress(P,S,C){
    // return a string representation of the address described by numerical P, S and C

    return '0x' + (P==0?'0':'') + ((P << 12) | (S << 8) | C).toString(16);  
}

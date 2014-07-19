///////////////////////////////////////
//get requests
///////////////////////////////////////

app.get('/HV', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)

	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('detectors/GRIFFIN.jade');
});

app.get('/SPICE', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	//scrape the MSC table to decide which if any auxiliaries are present
	exec('odbedit -c "ls /DAQ/MSC/chan"', function(error, stdout, stderr){
		var cells = stdout.split('\n'),
			i;

		for(i=0; i<cells.length; i++){
			if(cells[i].indexOf('SPZ') != -1)
				return res.render('detectors/SPICE.jade', {"SPICEaux": "S2"});
			else if(cells[i].indexOf('SPE') != -1)
				return res.render('detectors/SPICE.jade', {"SPICEaux": "S3"});				
		}

		return res.render('detectors/SPICE.jade', {"SPICEaux": "S2"});  //S2 hardcoded in for testing, should be null
	});

	
});

app.get('/PACES', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('detectors/PACES.jade');
});

app.get('/DESCANT', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('detectors/DESCANT.jade');
});

app.get('/SCEPTAR', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('detectors/SCEPTAR.jade');
});

app.get('/DAQ', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/DAQ.jade');
});

app.get('/PPG', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/PPG.jade');
});

app.get('/Clocks', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/Clock.jade');
});

app.get('/Filter', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/Filter.jade');
});

app.get('/Shack', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/Shack.jade');
});

app.get('/MSCbuilder', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('widgets/MSCbuilder.jade');
});

///////////////////////////////////////
//post routes
///////////////////////////////////////

app.post('/postHV', function(req, res){

	spawn('odbedit', ['-c', "set /Equipment/HV-"+req.body.crateIndex+"/Variables/Demand["+req.body.chIndex+"] " + req.body.demandVoltage]);

	if(req.body.powerSwitch == 'off')
		spawn('odbedit', ['-c', "set /Equipment/HV-"+req.body.crateIndex+"/Settings/ChState["+req.body.chIndex+"] 0"]);
	else
		spawn('odbedit', ['-c', "set /Equipment/HV-"+req.body.crateIndex+"/Settings/ChState["+req.body.chIndex+"] 1"]);

	return res.redirect('/HV?crate=0&channel='+req.body.chName);
});

app.post('/registerCycle', function(req, res){
	var cycle = (req.body.cycleString) ? JSON.parse(req.body.cycleString) : null,
		i,
		steps = [],
		durations = [];

	//just load an existing cycle
	if(req.body.loadTarget != 'null'){
		spawn('odbedit', ['-c', "set /PPG/Current " + req.body.loadTarget]);
		return res.redirect('/PPG');
	}

	//delete an existing cycle
	if(req.body.deleteTarget != 'null'){
		spawn('odbedit', ['-c', "rm /PPG/Cycles/" + req.body.deleteTarget]);
		return res.redirect('/PPG');
	}

	//register a new cycle
	for(i=0; i<cycle.length; i++){
		steps[i] = parseInt(cycle[i].PPGcode, 10);
		durations[i] = parseInt(cycle[i].duration, 10);
	}

	spawn('odbedit', ['-c', "rm /PPG/Cycles/" + req.body.cycleName]);
	spawn('odbedit', ['-c', "mkdir /PPG/Cycles/" + req.body.cycleName]);
	
	spawn('odbedit', ['-c', "create int /PPG/Cycles/" + req.body.cycleName + "/PPGcodes[" + steps.length + "]"]);
	spawn('odbedit', ['-c', "create int /PPG/Cycles/" + req.body.cycleName + "/durations[" + steps.length + "]"]);
	for(i=0; i<cycle.length; i++){
		spawn('odbedit', ['-c', "set /PPG/Cycles/" + req.body.cycleName + "/PPGcodes["+ i +"]  " + Math.round(steps[i]) ]);
		spawn('odbedit', ['-c', "set /PPG/Cycles/" + req.body.cycleName + "/durations["+ i +"]  " + Math.round(durations[i]) ]);
	}

	if(req.body.applyCycle == 'on'){
		spawn('odbedit', ['-c', "set /PPG/Current " + req.body.cycleName]);
	}

	return res.redirect('/PPG');
});

app.post('/registerFilter', function(req, res){
	var filter = (req.body.filterString) ? JSON.parse(req.body.filterString) : null,
		odbManipulationFile = '',
		i, j,
		steps = [],
		durations = [];


	//just load an existing cycle
	if(req.body.loadTarget != 'null'){
		spawn('odbedit', ['-c', "set /Filter/Current " + req.body.loadTarget]);
		return res.redirect('/Filter');
	}

	//delete an existing cycle
	if(req.body.deleteTarget != 'null'){
		spawn('odbedit', ['-c', "rm /Filter/Filters/" + req.body.deleteTarget]);
		return res.redirect('/Filter');
	}

	//register a new filter - build file and run with execFile for most robust execution (spawn seems to create a race condition, consider removing).
	odbManipulationFile += 'odbedit -c "rm /Filter/Filters/' + req.body.filterName + '"\n';
	odbManipulationFile += 'odbedit -c "mkdir /Filter/Filters/' + req.body.filterName + '"\n';
	for(i=0; i<filter.length; i++){
		odbManipulationFile += 'odbedit -c "create string /Filter/Filters/' + req.body.filterName + '/orCondition'+i+'[' + filter[i].length + ']"\n'; 
		for(j=0; j<filter[i].length; j++){
			odbManipulationFile += 'odbedit -c "set /Filter/Filters/' + req.body.filterName + '/orCondition'+i + '['+j+'] ' + filter[i][j] + '"\n';
		}
	}

	fs.writeFile('odbManipulation.sh', odbManipulationFile, function(){
		fs.chmod('./odbManipulation.sh', '777', function(){
			execFile('./odbManipulation.sh', function(error, stdout, stderr){
				console.log('Writing ' + req.body.filterName + ' filter to ODB, process [error, stdout, stderr]:'); 
				console.log([error, stdout, stderr]);

				if(req.body.applyFilter == 'on'){
					spawn('odbedit', ['-c', "set /Filter/Current " + req.body.filterName]);
				}
			});			
		});
	});
	
	return res.redirect('/Filter');

});

app.post('/updateClock', function(req, res){
	var ClockEnB = 0,
		powerOn,
		stepdown = parseInt(req.body.freqStepdown,10);

	//channel on / off
	for(i=0; i<6; i++){
		powerOn = req.body['eSATAtoggle' + i] == 1
		ClockEnB = ClockEnB | ((powerOn) ? (0xF << 4*i) : 0);
	}
	spawn('odbedit', ['-c', "set /Equipment/GRIF-Clk" + req.body.clockIndex + "/Variables/Output[0] " + ClockEnB]);

	//freq. stepdown
	if(stepdown && req.body.isMaster=='1'){
		for(i=0; i<8; i++){
			spawn('odbedit', ['-c', "set /Equipment/GRIF-Clk" + req.body.clockIndex + "/Variables/Output[" + (11+4*i) + "] " + stepdown]);
			spawn('odbedit', ['-c', "set /Equipment/GRIF-Clk" + req.body.clockIndex + "/Variables/Output[" + (12+4*i) + "] " + stepdown]);		
		}
	}

	return res.redirect('/Clocks');
});

/*
app.post('/toggleClock', function(req, res){
	spawn('odbedit', ['-c', "set /Equipment/GRIF-Clk" + req.body.clockIndex + "/Variables/Output[1] " + req.body['radio'+req.body.clockIndex] ]);

	return res.redirect('/Clocks');
});
*/

app.post('/toggleClock', function(req, res){
	var isMaster = req.body['radio'+req.body.clockIndex] == 1,
		configScript = '';

console.log(isMaster)


	configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[1] ' + req.body['radio'+req.body.clockIndex] + '"\n';

	if(isMaster){
		//Master has NIM in
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[2] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[3] 1" \n';
		//Master does not bypass any channel
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[13] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[17] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[21] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[25] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[29] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[33] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[37] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[41] 0" \n';
	}else{
		//Slave has eSATS in
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[2] 0" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[3] 0" \n';
		//Slave bypasses all channels
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[13] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[17] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[21] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[25] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[29] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[33] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[37] 1" \n';
		configScript += 'odbedit -c "set /Equipment/GRIF-Clk' + req.body.clockIndex + '/Variables/Output[41] 1" \n';
	}

	fs.writeFile('configureClockMode.sh', configScript, function(){
		fs.chmod('./configureClockMode.sh', '777', function(){
			
			execFile('./configureClockMode.sh', function(error, stdout, stderr){
				console.log('Setting GRIF-Clk' + req.body.clockIndex + ' to ' + ((isMaster) ? 'Master' : 'Slave') ); 
				console.log([error, stdout, stderr]);

				return res.redirect('/Clocks');
			});
						
		});
	});
});

app.post('/powerCycleVME', function(req, res){
	console.log([req.body.VMEindex, req.body.pw, req.body.host])

/*
	if(req.body.pw != 'pixel')
		return res.redirect('/Shack');

	//enable writing, power down the crate, wait 30 seconds, power up the crate, disable writing.
	exec("curl 'http://grifsoh00.triumf.ca:8081/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/EnableControl&value=1'", function(error, stdout, stderr){
		exec("curl 'http://grifsoh00.triumf.ca:8081/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/mainSwitch&value=0'", function(error, stdout, stderr){
			setTimeout(function(){
				exec("curl 'http://grifsoh00.triumf.ca:8081/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/mainSwitch&value=1'", function(error, stdout, stderr){
					exec("curl 'http://grifsoh00.triumf.ca:8081/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/EnableControl&value=0'", function(error, stdout, stderr){})
				})
			}, 30000);
		}
	});
*/

	return res.redirect('/Shack');
});









app.post('/buildMSC', function(req, res){
	var names = [],
		MSC = [],
		table, i,
		rebuildScript = '';

	//GRIFFIN
	for(i=1; i<17; i++){
		if(req.body['crystal' + i] == 'on'){
			table = configGRIFFINclover(i, req.body['suppressor'+i] == 'on');
			names = names.concat(table[0]);
			MSC = MSC.concat(table[1]);
		}
	}

	//SCEPTAR + ZDS
	table = configSCEPTAR(	req.body.USC == 'USCSE',
							req.body.DSC == 'DSCSE',
							req.body.DSC == 'DSCZD');
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//DANTE
	table = configDANTE();
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//PACES
	if(req.body.USC == 'USCPA'){
		table = configPACES();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);		
	}

	//SPICE
	if(req.body.USC == 'USCSP'){
		table = configSPICE();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//DESCANT
	if(req.body.USC == 'DSCDS'){
		table = configDESCANT();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//S2
	if(req.body.DSC == 'DSCS2'){
		table = configS2S3(2);
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//S3
	if(req.body.DSC == 'DSCS3'){
		table = configS2S3(3);
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}
/*
	var test = configSPICE();
	for(var i=0; i<test[0].length; i++){
		console.log([ test[0][i], test[1][i].toString(16) ]);
	}
*/

	//generate a script to re-create MSC table in DAQ:
	rebuildScript += 'odbedit -c "rm /DAQ/MSC"\n';
	rebuildScript += 'odbedit -c "mkdir /DAQ/MSC"\n';
	rebuildScript += 'odbedit -c "create SHORT /DAQ/MSC/MSC[' + MSC.length + ']"\n';
	rebuildScript += 'odbedit -c "create STRING /DAQ/MSC/chan[' + MSC.length + ']"\n';
	rebuildScript += 'odbedit -c "create BYTE /DAQ/MSC/datatype[' + MSC.length + ']"\n';
	rebuildScript += 'odbedit -c "create INT /DAQ/MSC/gain[' + MSC.length + ']"\n';
	rebuildScript += 'odbedit -c "create INT /DAQ/MSC/offset[' + MSC.length + ']"\n';

	for(i=0; i<MSC.length; i++){
		rebuildScript += 'odbedit -c "set /DAQ/MSC/MSC[' + i + '] ' + MSC[i] + '"\n';
		rebuildScript += 'odbedit -c "set /DAQ/MSC/chan[' + i + '] ' + names[i] + '"\n';
	}

	fs.writeFile('rebuildMSC.sh', rebuildScript, function(){
		fs.chmod('./rebuildMSC.sh', '777', function(){
			
			execFile('./rebuildMSC.sh', function(error, stdout, stderr){
				console.log('Writing MSC table to ODB, process [error, stdout, stderr]:'); 
				console.log([error, stdout, stderr]);

				return res.redirect('/DAQ');
			});
						
		});
	});

	function configGRIFFINclover(index, suppressors){
		var names = [],
			MSC = [],
			masterChan = (index<9) ? 0 : 1,
			firstCollectorChan = ((index-1)%8)*2, //ie, collector channel of first (of 2) GRIF16s used for this clover.
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

	function configDANTE(){
		var names = [],
			MSC = [],
			i;

		for(i=0; i<8; i++){
			names.push('DAL0'+(1+i)+'XN00X');
			MSC.push((2 << 12) | ( 1 << 8) | i);
		}

		for(i=0; i<8; i++){
			names.push('DAL0'+(1+i)+'XT00X');
			MSC.push((2 << 12) | ( 2 << 8) | i);
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

		//weird ordering 'thanks' to cable bundling constraints:
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

});


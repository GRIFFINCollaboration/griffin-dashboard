///////////////////////////////////////
//get requests
///////////////////////////////////////

app.get('/', function(req, res){
	res.render('detectors/GRIFFIN.jade', {MIDAS:MIDAS});
});

app.get('/HV', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)

	res.render('widgets/HV.jade', {MIDAS:MIDAS});
});

app.get('/GRIFFIN', function(req, res){
//	if(!req.cookies.midas_pwd) res.redirect('http://'+MIDAS)
	
	res.render('detectors/GRIFFIN.jade', {MIDAS:MIDAS});
});

app.get('/SPICE', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	//scrape the MSC table to decide which if any auxiliaries are present
	exec('odbedit -c "ls /DAQ/MSC/chan"', function(error, stdout, stderr){
		var cells = stdout.split('\n'),
			i;

		for(i=0; i<cells.length; i++){
			if(cells[i].indexOf('SPZ') != -1)
				return res.render('detectors/SPICE.jade', {"SPICEaux": "S2", MIDAS:MIDAS});
			else if(cells[i].indexOf('SPE') != -1)
				return res.render('detectors/SPICE.jade', {"SPICEaux": "S3", MIDAS:MIDAS});				
		}

		return res.render('detectors/SPICE.jade', {"SPICEaux": null, MIDAS:MIDAS});  //S2 hardcoded in for testing, should be null
	});

	
});

app.get('/PACES', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/PACES.jade', {MIDAS:MIDAS});
});

app.get('/DESCANT', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/DESCANT.jade', {MIDAS:MIDAS});
});

app.get('/DANTE-Energy', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/DANTE.jade', {MIDAS:MIDAS, readout:'Energy'});
});

app.get('/DANTE-TAC', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/DANTE.jade', {MIDAS:MIDAS, readout:'TAC'});
});

app.get('/SCEPTAR', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/SCEPTAR.jade', {MIDAS:MIDAS});
});

app.get('/ZDS-Energy', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/ZDS.jade', {MIDAS:MIDAS, readout:'Energy'});
});

app.get('/ZDS-TAC', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('detectors/ZDS.jade', {MIDAS:MIDAS, readout:'TAC'});
});

app.get('/DAQ', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/DAQ.jade', {MIDAS:MIDAS});
});

app.get('/PPG', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/PPG.jade', {MIDAS:MIDAS});
});

app.get('/Clocks', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/Clock.jade', {MIDAS:MIDAS});
});

app.get('/Filter', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/Filter.jade', {MIDAS:MIDAS});
});

app.get('/Shack', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/Shack.jade', {MIDAS:MIDAS, SOH:SOH});
});

app.get('/MSCbuilder', function(req, res){
//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	res.render('widgets/MSCbuilder.jade', {MIDAS:MIDAS});
});

app.get('/canonicalMSC', function(req, res){
	var MSC = [], table, names = [];

//	if(!req.cookies.midas_pwd) return res.redirect('http://'+MIDAS)
	
	//GRIFFIN
	for(i=1; i<17; i++){
			table = MSCbuilders.configGRIFFINclover(i, true);
			names = names.concat(table[0]);
			MSC = MSC.concat(table[1]);
	}

	//SCEPTAR
	table = MSCbuilders.configSCEPTAR(true, true, false);
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//ZDS
	table = MSCbuilders.configSCEPTAR(false, false, true);
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);	

	//DANTE
	table = MSCbuilders.configDANTE(true, true);
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//PACES
	table = MSCbuilders.configPACES();
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);	

	//SPICE
	table = MSCbuilders.configSPICE();
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);		

	//DESCANT
	table = MSCbuilders.configDESCANT();
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);	

	//S2
	table = MSCbuilders.configS2S3(2);
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);	

	//S2
	table = MSCbuilders.configS2S3(3);
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);		

	res.render('widgets/MSC.jade', {MSC:JSON.stringify([names, MSC])});
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

//	return res.redirect('/HV?crate=0&channel='+req.body.chName);
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
		coincWindows = (req.body.coincString) ? JSON.parse(req.body.coincString) : null,
		detsAllowed = (req.body.detsAllowed) ? JSON.parse(req.body.detsAllowed) : null,
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
		odbManipulationFile += 'odbedit -c "create int /Filter/Filters/' + req.body.filterName + '/coincWindow' + i + '"\n';
		odbManipulationFile += 'odbedit -c "set /Filter/Filters/' + req.body.filterName + '/coincWindow' + i + ' ' + coincWindows[i] + '"\n';
	}
	odbManipulationFile += 'odbedit -c "create int /Filter/Filters/' + req.body.filterName + '/EnabledDetTypes"\n';
	odbManipulationFile += 'odbedit -c "set /Filter/Filters/' + req.body.filterName + '/EnabledDetTypes ' + detsAllowed + '"\n';

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


	if(req.body.pw != 'pixel')
		return res.redirect('/Shack');

	//enable writing, power down the crate, wait 30 seconds, power up the crate, disable writing.
	exec("curl '"+req.body.host+"/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/EnableControl&value=1'", function(error, stdout, stderr){
		exec("curl '"+req.body.host+"/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/mainSwitch&value=0'", function(error, stdout, stderr){
			setTimeout(function(){
				exec("curl '"+req.body.host+"/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/mainSwitch&value=1'", function(error, stdout, stderr){
					setTimeout(function(){
						exec("curl '"+req.body.host+"/?cmd=jset&odb=Equipment/VME-0"+req.body.VMEindex+"/Settings/EnableControl&value=0'", function(error, stdout, stderr){});
					}, 1000);
				})
			}, 65000);
		})
	});


	return res.redirect('/Shack');
});

app.post('/buildMSC', function(req, res){
	console.log("POST:"+req.body.USC+', '+req.body.DSC+', '+req.body.USL+', '+req.body.DSL);

	var names = [],
		MSC = [],
		table, i,
		rebuildScript = '';

	//GRIFFIN
	for(i=1; i<17; i++){
		if(req.body['crystal' + i] == 'on'){
			table = MSCbuilders.configGRIFFINclover(i, req.body['suppressor'+i] == 'on');
			names = names.concat(table[0]);
			MSC = MSC.concat(table[1]);
		}
	}

	//SCEPTAR + ZDS
	table = MSCbuilders.configSCEPTAR(	req.body.USC == 'USCSE',
							req.body.DSC == 'DSCSE',
							req.body.DSC == 'DSCZD');
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//DANTE
	table = MSCbuilders.configDANTE(req.body.USL == 'USLGRDA',
						req.body.DSL == 'DSLGRDA');
	names = names.concat(table[0]);
	MSC = MSC.concat(table[1]);

	//PACES
	if(req.body.USC == 'USCPA'){
		table = MSCbuilders.configPACES();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);		
	}

	//SPICE
	if(req.body.USC == 'USCSP'){
		table = MSCbuilders.configSPICE();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//DESCANT
	if(req.body.DSL == 'DSLDS'){
		table = MSCbuilders.configDESCANT();
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//S2
	if(req.body.DSC == 'DSCS2'){
		table = MSCbuilders.configS2S3(2);
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}

	//S3
	if(req.body.DSC == 'DSCS3'){
		table = MSCbuilders.configS2S3(3);
		names = names.concat(table[0]);
		MSC = MSC.concat(table[1]);
	}
/*
	var test = MSCbuilders.configDANTE(true, true);
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
});


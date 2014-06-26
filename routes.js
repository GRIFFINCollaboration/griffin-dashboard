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

///////////////////////////////////////
//post routes
///////////////////////////////////////

app.post('/postHV', function(req, res){

	spawn('odbedit', ['-c', "set /Equipment/HV-"+req.body.crateIndex+"/Variables/Demand["+req.body.chIndex+"] " + req.body.demandVoltage]);
	spawn('odbedit', ['-c', "set '/Equipment/HV-"+req.body.crateIndex+"/Settings/Ramp Up Speed["+req.body.chIndex+"]' " + req.body.voltageUp]);
	spawn('odbedit', ['-c', "set '/Equipment/HV-"+req.body.crateIndex+"/Settings/Ramp Down Speed["+req.body.chIndex+"]' " + req.body.voltageDown]);

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
	
/*
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
*/
	//register a new filter
	/*
	for(i=0; i<cycle.length; i++){
		steps[i] = parseInt(cycle[i].PPGcode, 10);
		durations[i] = parseInt(cycle[i].duration, 10);
	}
	*/

	/*
	spawn('odbedit', ['-c', "rm /Filter/Filters/" + req.body.filterName]);
	spawn('odbedit', ['-c', "mkdir /Filter/Filters/" + req.body.filterName]);

	for(i=0; i<filter.length; i++){
		spawn('odbedit', ['-c', "create string /Filter/Filters/" + req.body.filterName + "/orCondition"+i+"[" + filter[i].length + "]" ]);
		for(j=0; j<filter[i].length; j++){
			spawn('odbedit', ['-c', "set /Filter/Filters/" + req.body.filterName + "/orCondition"+i + '['+j+'] ' + filter[i][j] ]);	
		}
	}
	*/

	//exec('odbedit -c rm /Filter/Filters/' + req.body.filterName, function(){});
	//exec('odbedit -c mkdir /Filter/Filters/' + req.body.filterName, function(){});

	/*
	for(i=0; i<filter.length; i++){
		exec('odbedit -c create string /Filter/Filters/' + req.body.filterName + '/orCondition'+i+'[' + filter[i].length + "]", function(){});
		for(j=0; j<filter[i].length; j++){
			exec('odbedit -c set /Filter/Filters/' + req.body.filterName + '/orCondition'+i + '['+j+'] ' + filter[i][j], function(){} );	
		}
	}
	*/

	odbManipulationFile += 'odbedit -c "rm /Filter/Filters/' + req.body.filterName + '"\n';
	odbManipulationFile += 'odbedit -c "mkdir /Filter/Filters/' + req.body.filterName + '"\n';
	for(i=0; i<filter.length; i++){
		odbManipulationFile += 'odbedit -c "create string /Filter/Filters/' + req.body.filterName + '/orCondition'+i+'[' + filter[i].length + ']"\n'; 
		for(j=0; j<filter[i].length; j++){
			odbManipulationFile += 'odbedit -c "set /Filter/Filters/' + req.body.filterName + '/orCondition'+i + '['+j+'] ' + filter[i][j] + '"\n';
		}
	}

	fs.writeFile('odbManipulation.sh', odbManipulationFile, function(){
		fs.chmod('./odbManipulation.sh', '777', function(){});
	});

/*
	execFile('./test.sh', function(error, stdout, stderr){
		console.log([error, stdout, stderr]);
	})
*/
	/*
	if(req.body.applyCycle == 'on'){
		spawn('odbedit', ['-c', "set /PPG/Current " + req.body.cycleName]);
	}
	*/
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

app.post('/toggleClock', function(req, res){
	spawn('odbedit', ['-c', "set /Equipment/GRIF-Clk" + req.body.clockIndex + "/Variables/Output[1] " + req.body['radio'+req.body.clockIndex] ]);

	return res.redirect('/Clocks');
})




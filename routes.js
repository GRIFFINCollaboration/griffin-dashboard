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

/*
app.get('/rawMSC', function(req, res){
	if(!req.cookies.midas_pwd) res.redirect(MIDAS)
	
	res.render('scratchTools/dumpMSC.jade');
});
*/

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
	var cycle = JSON.parse(req.body.cycleString),
		i,
		steps = [],
		durations = [];

	for(i=0; i<cycle.length; i++){
		steps[i] = parseInt(cycle[i].PPGcode, 10);
		durations[i] = parseInt(cycle[i].duration, 10);
	}

	spawn('odbedit', ['-c', "mkdir /PPG/Cycles/" + req.body.cycleName]);
	spawn('odbedit', ['-c', "create int /PPG/Cycles/" + req.body.cycleName + "/PPGcodes[" + steps.length + "]"]);
	spawn('odbedit', ['-c', "create int /PPG/Cycles/" + req.body.cycleName + "/durations[" + steps.length + "]"]);
	for(i=0; i<cycle.length; i++){
		spawn('odbedit', ['-c', "set /PPG/Cycles/" + req.body.cycleName + "/PPGcodes["+ i +"] " + steps[i]]);
		spawn('odbedit', ['-c', "set /PPG/Cycles/" + req.body.cycleName + "/durations["+ i +"] " + durations[i]]);
	}

	if(req.body.applyCycle){
		spawn('odbedit', ['-c', "set /PPG/Cycles/Current " + req.body.cycleName);
	}

	return res.redirect('/PPG');
});
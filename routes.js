app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});



app.post('/postHV', function(req, res){

	spawn('odbedit', ['-c', "set /Equipment/HV-"+req.body.crateIndex+"/Variables/Demand["+req.body.chIndex+"] " + req.body.demandVoltage]);
	spawn('odbedit', ['-c', "set '/Equipment/HV-"+req.body.crateIndex+"/Settings/Ramp Up Speed["+req.body.chIndex+"]' " + req.body.voltageUp]);
	spawn('odbedit', ['-c', "set '/Equipment/HV-"+req.body.crateIndex+"/Settings/Ramp Down Speed["+req.body.chIndex+"]' " + req.body.voltageDown]);



/*
	var ls = spawn('ls', ['-lh', '/usr']);
	ls.stdout.on('data', function(data){
		console.log('stdout: ' + data);
	})
*/
	//var cmdString;

	//cmdString = '?cmd=jset&odb=/Equipment/HV-'+req.body.crateIndex+'/Variables/Demand['+req.body.chIndex+']'
	//cmdString += '&value='+req.body.demandVoltage

	//console.log(cmdString)

	return res.redirect('/HV');
});
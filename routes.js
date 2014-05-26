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

	console.log(req.body)

	return res.redirect('/HV');
});
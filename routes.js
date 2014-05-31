app.get('/login', function(req, res){
	res.render('site/login.jade')
});

app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});

app.post('/submitLogin', function(req, res){
    //res.redirect('http://grsmid00.triumf.ca:8082?pwd='+req.body.pwd);
    app.get('http://grsmid00.triumf.ca:8082?pwd='+req.body.pwd, function(req, res){
    	console.log(res.cookie)
    });
});

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
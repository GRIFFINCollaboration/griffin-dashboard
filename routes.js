app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});


app.post('/postHV', function(req, res){

	console.log(req.body)
/*
	console.log(req.body.chName);
	console.log(req.body.powerSwitch);
	console.log(req.body.demandVoltage);
	console.log(req.body.voltageUp);
	console.log(req.body.voltageDown);
*/
});
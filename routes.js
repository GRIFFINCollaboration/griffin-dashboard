app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});



app.post('/postHV', function(req, res){

	var writeODB = spawn("odbedit -c 'set /Equipment/HV-0/Variables/Demand[1] 990'");
	//ls.stdout.on('data', function(data){
	//	console.log('stdout: ' + data);
	//})

	//var cmdString;

	//cmdString = '?cmd=jset&odb=/Equipment/HV-'+req.body.crateIndex+'/Variables/Demand['+req.body.chIndex+']'
	//cmdString += '&value='+req.body.demandVoltage

	//console.log(cmdString)

	return res.redirect('/HV');
});
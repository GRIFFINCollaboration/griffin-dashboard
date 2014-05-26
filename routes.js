app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});



app.post('/postHV', function(req, res){

	var writeODB = spawn('odbedit', ['-c', "'set /Equipment/HV-0/Variables/Demand[1] 990'"])
	//odbedit -c 'set /Equipment/HV-0/Variables/Demand[1] 990'

writeODB.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

writeODB.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

writeODB.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

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
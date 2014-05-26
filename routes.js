app.get('/HV', function(req, res){
	res.render('widgets/HV.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});


app.post('/postHV', function(req, res){

	console.log(req.body)

	return res.redirect('/HV');
});
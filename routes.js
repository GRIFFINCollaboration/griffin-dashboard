app.get('/', function(req, res){
	res.render('HW.jade');
});

app.get('/GRIFFIN', function(req, res){
	res.render('detectors/GRIFFIN.jade');
});
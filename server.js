var express = require('express');
var sqlite3 = require('sqlite3');

var app = express();
var dbName = typeof process.argv[2] == 'string' ? process.argv[2] : 'l4d2-logger.db';
var portNum = typeof process.argv[3] != 'undefined' ? parseInt(process.argv[3]) : 55555;

console.log("Starting server with database '" + dbName + "'");

var loggerTable = (function (dbName) {
	// constructor
	var db = new sqlite3.Database(dbName),
		stmt = db.prepare("INSERT INTO log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
	
	// public functions
	return { 
		destroy: function () {
			stmt.finalze();
			db.close();
		},
		insert: function (data) {
			stmt.run(new Date(),
					data.mapname, 
					data.configname,
					data.alivesurvs,
					data.maxdist,
					data.survcompletion[0],
					data.survcompletion[1],
					data.survcompletion[2],
					data.survcompletion[3],
					data.survhealth[0],
					data.survhealth[1],
					data.survhealth[2],
					data.survhealth[3],
					data.itemCount[0],
					data.itemCount[1],
					data.itemCount[2],
					data.bossflow[0],
					data.bossflow[1],
					data.roundtime);
		},
	};
})(dbName);

// Log round end
app.get('/lre', function(req, res) {
		var data = {};
		
		console.log("/lre called with " + req.query['data']);
		try {
			data = JSON.parse(req.query['data']);
			console.log("object parsed");
			loggerTable.insert(data);
			console.log("data inserted");
			res.send("Thanks for the data!");
		}
		catch (e)
		{
			res.send("Failed to validate and insert data. Sorry.");
			console.error("Parsing data failed with exception " + e);
		}
});


process.on('exit', function () {
	loggerTable.destroy();
});

app.listen(portNum);
console.log('Listening on port ' + portNum);

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
url = require("url"), path = require("path");
var mysql = require('mysql');
var app = express();
var bp = require('body-parser');
var fb;
var app = express();
var router = express.Router();
var http = require('http');
var fs = require('fs');
var path = require('path');
app.use(bp.json());
var filePath = path.join(__dirname, 'code.json');
var obj, states;
var connection = mysql.createConnection(
        {
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'accidentopedia', multipleStatements: true
        }
);
var express = require('express');
url = require("url"), path = require("path");
var mysql = require('mysql');
var app = express();
var bp = require('body-parser');
var fb;
app.listen(process.env.PORT || 3412);
app.use(bp.urlencoded({
  extended: true
}));
app.use(bp.json());

app.get('/', function(req, res) {
	res.json("Welcome to the jungle!!!");
});
// accident/

app
		.get(
				'/accident',
				function(req, res) {
					console.log("A GET request was made from: ",
							req.connection.remoteAddress);
					res
							.json("This is GET request. Do a post using curl or something like that !!!");
				});
app.get('/data', function(req, res) {
	var urlp = url.parse(req.url, true);
	var query = urlp.query;
	// res.json(query);

	var callback = function(err, result) {
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});
		// console.log('json:', result);
		res.end(result);
	};

	getSQL(callback, query);
});

app.post('/accident', function(req, res, next) {
	req.setEncoding('utf-8');

	var fullBody = "";
	var resu = "";
	var d = {
		statecode : "",
		countycode : "",
		city : ""
	};

	req.on('data', function(chunk) {
		// fullBody += chunk;
		// fb=fullBody;
		
		var strop = "0";
		var o = JSON.parse(chunk);
		if (o.ddr !== undefined) {
			d.ddr = o.ddr;
		} else {
			d.ddr = 0;
		}

		if (o.limit !== undefined) {
			d.limit = o.limit;
		} else {
			d.limit = 0;
		}

		console.log("Input request data:", chunk);
		if (o.statecode !== undefined) {
			strop = "1";
			d.statecode = o.statecode;
			if (o.countycode !== undefined) {
				strop = "2";
				d.countycode = o.countycode;
				if (o.citycode !== undefined) {
					d.countycode = o.countycode;
					strop = "3";
				} else {
					d.citycode = "";
				}
			} else {
				d.countycode = "";
				d.citycode = "";
			}
		} else {
			d.statecode = "";
			d.countycode = "";
			d.citycode = "";
		}
		d.op = strop;

		var callback = function(err, result) {
			resu = result;
			// console.log(resu);
			// res.write(result);
			res.end(resu);
		};
		getaccidents(callback, d);
	});

	req.on('end', function() {
		res.writeHead(200, "OK", {
			'Content-Type' : 'text/html'
		});
		// console.log("Result is ",resu);

		console.log("A POST request was made from: ",
				req.connection.remoteAddress);

	});
});

app.post('/report',
		function(req, res, next) {
			req.setEncoding('utf-8');
			var resu = "";

			console.log("A POST request was made from: ",
					req.connection.remoteAddress);

			req.on('data', function(chunk) {
				console.log("On Data", "We do this");
				var callback = function(err, result) {
					resu = result;
					res.end(resu);
				};
				reportaccident(callback, chunk);
			});

			req.on('end', function() {
				res.writeHead(200, "OK", {
					'Content-Type' : 'text/html'
				});
				console.log("A POST request was made from: ",
						req.connection.remoteAddress);

			});

		});

function reportaccident(callback, d) {

	var o = JSON.parse(d);
	var points = [ {
		lat : o.lat,
		long : o.long
	} ];
	
	
	var json = '';
	var params = "'" + o.ddr + "', '" + o.fatal + "', '" + o.month + "', '"
			+ o.weather + "', '" + o.hour + "', '" + o.state + "', '" + o.day
			+ "', '" + o.week + "', '" + o.city + "', '" + o.year + "','"
			+ o.minute + "','" + o.county + "',GeomFromText('POINT(" + o.lat
			+ " " + o.long + ")')";
	console.log(JSON.stringify(o));
	console.log(JSON.stringify(params));

	console.log(JSON.stringify(points));

	var query = "call reportaccidents(" + params + ")";

	connection.query(query, [ points ], function(err, results, fields) {
		if (err) {
			console.log('This is error point: ');
			console.log(err);
			return callback(err, null);
		}
		json = JSON.stringify(results);
		console.log(json);
		
		callback(null, json);
	});

}

function getaccidents(callback, d) {

	

	// console.log('This is first point: ',d.statecode ,d.op);
	var json = '';
	var params = "'" + d.statecode + "', '" + d.countycode + "', '" + d.city
			+ "','" + d.op + "','" + d.ddr + "','" + d.limit + "'";
	var query = "call getallaccidents(" + params + ")";
	console.log('This is first point: ', query);

	connection.query(query, function(err, results, fields) {
		if (err) {
			console.log('This is error point: ');
			return callback(err, null);
		}
		json = JSON.stringify(results);
		
		callback(null, json);
	});
}

function getSQL(callback, querystring) {

	
	// console.log(querystring);
	var o = JSON.parse(JSON.stringify(querystring));
	// parameters
	console.log(o.p1);
	console.log(o.p2);

	var operation;
	if (o.p1 == undefined) {
		o.p1 = "";
		o.p2 = "";
		operation = "1";
	} else if (o.p2 == undefined) {
		o.p2 = "";
		operation = "2";
	} else {
		operation = "3";
	}

	var json = '';
	var params = "'" + o.p1 + "', '" + o.p2 + "','" + operation + "'";
	var query = "call getall(" + params + ")";
	connection.query(query, function(err, results, fields) {
		if (err)
			return callback(err, null);

		// console.log('The query-result is: ', results[0]);
		json = JSON.stringify(results);
		
		// console.log('JSON-result:', json);
		callback(null, json);
	});
}
fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        obj = JSON.parse(data);

    } else {
        // console.log(err);
    }

});
var filePath2 = path.join(__dirname, 'states.json');
fs.readFile(filePath2, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        states = JSON.parse(data);
//console.log(states);
    } else {
        console.log(err);
    }

});
var mysql = require('mysql');


router.get('/county/histogram/:state/:year/:month', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            // console.log(rows[i]);
        }

        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/barchart/:state/:year/:month', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by county';


    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        console.log(data);
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/piechart/:state/:year/:month', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by county';


    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});









router.get('/county/histogram/:state/:year', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/barchart/:state/:year', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/piechart/:state/:year', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' and year=' + req.params.year + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/histogram/:state', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            //console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/barchart/:state', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].county.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/county/piechart/:state', function (req, res) {
    var queryString = 'select  county,count(*) as count from Accidents where state =' + req.params.state + ' group by county';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["County", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].county.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/histogram', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents group by state;';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/barchart', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents group by state;';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/piechart', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents group by state;';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //   console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/histogram/:year', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/barchart/:year', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/piechart/:year', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
//var queryString = 'select STATE, count(*) as count from Accidents where YEAR='+req.params.year +' and MONTH='+req.params.month+' group by state' ;
router.get('/states/histogram/:year/:month', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' and MONTH=' + req.params.month + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/barchart/:year/:month', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' and MONTH=' + req.params.month + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            //      console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/states/piechart/:year/:month', function (req, res) {
    var queryString = 'select STATE, count(*) as count from Accidents where YEAR=' + req.params.year + ' and MONTH=' + req.params.month + ' group by state';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["State", "Count"]);
        for (var i in rows) {
            data.push([states[rows[i].STATE.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/accidents/:lat/:long', function (req, res) {
    var lat = req.params.lat;
    var long = req.params.long;
    var query = "SELECT astext(location) as location, (3959 * acos (cos ( radians(" + long + ") ) * cos( radians( y(location) ) )" +
            "* cos( radians(  x(location) ) - radians(" + lat + ") ) + sin ( radians(" + long + ") )  * sin( radians( y(location) ) )  )" +
            ") AS distance FROM Accidents HAVING distance < 30 ORDER BY distance ;";
    console.log(query);
    connection.query(query, function (err, rows, fields) {
        if (err)
            throw err;


        res.json(rows);
    });
});


router.get('/city/drunk/:city', function (req, res) {
    var queryString = 'Select count(*) as count,year from Accidents where DRUNK_DR>0 and city=' + req.params.city + ' group by year;';
    var queryString2 = 'Select count(*) as count,year from Accidents where DRUNK_DR=0 and city=' + req.params.city + '  group by year;';
    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = '{'


        //data.Drunk={};
        for (var i in rows) {
            data = data + '"'+rows[i].year.toString() +'"'+ ':' + rows[i].count + ',';
        }
        data = data.substring(0, data.length - 1);
        data = data + "}";

        connection.query(queryString2, function (err, rows, fields) {
            if (err)
                throw err;
            var data2 = "{";


            //data.Drunk={};
            for (var i in rows) {
                data2 = data2 + '"'+rows[i].year.toString() +'"'+ ':' + rows[i].count + ',';

            }
            data2 = data2.substring(0, data2.length - 1);
            data2 = data2 + "}";
           // console.log(data2);
            var aux = [];
            aux.push(['Year', 'Drunk', 'Non Drunk']);
            if(data.length>1)
            {
            var dat=JSON.parse(data);
            var dat2=JSON.parse(data2);
            console.log(dat);
             console.log(dat2);
            for (var key in dat) {
                var ar = new Array();
                ar.push(key);
                if (dat.hasOwnProperty(key)) {
                    ar.push(dat[key]);
                } else {
                    ar.push(0);
                }
                if (dat2.hasOwnProperty(key)) {
                    ar.push(dat2[key]);
                } else {
                    ar.push(0);
                }
                aux.push(ar);
            }

           res.render('pages/drunk.ejs', {
            aux: JSON.stringify(aux)
        });
            }else{
               res.json("No data found");
            }
        });
    });
});
var months=["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];

router.get('/city/drunk/:city/:year', function (req, res) {
    var queryString = 'Select count(*) as count,month as year from Accidents where DRUNK_DR>0 and city=' + req.params.city + ' and year='+req.params.year+' group by month;';
    var queryString2 = 'Select count(*) as count,month as year from Accidents where DRUNK_DR=0 and city=' + req.params.city + ' and year='+req.params.year+' group by month;';
    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = '{';


        //data.Drunk={};
        for (var i in rows) {
            data = data + '"'+getMonth(rows[i].year-1).toString() +'"'+ ':' + rows[i].count + ',';

        }
        data = data.substring(0, data.length - 1);
        data = data + "}";
       // console.log(data);

        connection.query(queryString2, function (err, rows, fields) {
            if (err)
                throw err;
            var data2 = "{"


            //data.Drunk={};
            for (var i in rows) {
                data2 = data2 + '"'+getMonth(rows[i].year-1).toString() +'"'+ ':' + rows[i].count + ',';

            }
            data2 = data2.substring(0, data2.length - 1);
            data2 = data2 + "}";
           // console.log(data2);
            var aux = [];
            aux.push(['Month', 'Drunk', 'Non Drunk']);
            if(data.length>1)
            {
           var dat=JSON.parse(data);
            var dat2=JSON.parse(data2);
            console.log(dat);
             console.log(dat2);
            for (var key in months) {
                var ar = new Array();
                ar.push(months[key]);
                console.log(months[key]);
                if (dat.hasOwnProperty(months[key])) {
                    ar.push(dat[months[key]]);
                } else {
                    ar.push(0);
                }
                if (dat2.hasOwnProperty(months[key])) {
                    ar.push(dat2[months[key]]);
                } else {
                    ar.push(0);
                }
                aux.push(ar);
            }

           res.render('pages/drunk.ejs', {
            aux: JSON.stringify(aux)
        });
            }else{
                res.json("No data found");
            }
        });
    });
});
var months=["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];
function getMonth(month)
{
    return months[month];
}

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
router.get('/city/histogram/:county/:year/:month', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            // console.log(rows[i]);
        }

        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/barchart/:county/:year/:month', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by city';


    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        console.log(data);
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/piechart/:county/:year/:month', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' and month=' + req.params.month + ' group by city';


    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});









router.get('/city/histogram/:county/:year', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/barchart/:county/:year', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            //  console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/piechart/:county/:year', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' and year=' + req.params.year + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/histogram/:county', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            //console.log(rows[i]);
        }
        res.render('pages/histogram.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/barchart/:county', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/barchart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.get('/city/piechart/:county', function (req, res) {
    var queryString = 'select  city,count(*) as count from Accidents where county =' + req.params.county + ' group by city';

    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        var data = new Array();
        data.push(["city", "Count"]);
        for (var i in rows) {
            data.push([obj[rows[i].city.toString()], rows[i].count]);
            // console.log(rows[i]);
        }
        res.render('pages/piechart.ejs', {
            aux: JSON.stringify(data)
        });
    });
});
router.post('/register',function(req,res){
    //console.log(req);
    var queryString = 'INSERT INTO `accidentopedia`.`users`'+
'( `username`,`password`,`firstname`,`lastname`) VALUES ("'+req.body.username+'","'+req.body.password+'","'+req.body.firstname+'","'+ req.body.lastname+'")';
//console.log(queryString);
    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        
        res.json(rows);
    });
});
router.post('/login',function(req,res){
    //console.log(req);
   //console.log(queryString);
   var queryString="SELECT `users`.`userid` FROM `users`  where username='"+req.body.username+"' and password ='"+req.body.password+"'";
    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        
        res.json(rows);
    });
});
router.post('/prefs',function(req,res){
    var queryString="insert into userprefs (userid,drunk,`limi`) values("+req.body.userid+","+req.body.drunk+","+req.body.limi+") on duplicate key update drunk=VALUES(drunk), limi=VALUES(limi);";
   console.log(queryString);
    connection.query(queryString, function (err, rows, fields) {
        if (err)
            throw err;
        
        res.json(rows);
    });
});
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(8090);

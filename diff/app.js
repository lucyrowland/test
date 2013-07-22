var link = 'https://reports.us.pulseenergy.biz/validation/pgeAlphaCohort/2/summary/all.json?date=';
var express = require('express');
var jd = require('json-diff');
var request = require('request');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    var query = require('url').parse(req.url,true).query;
    var FirstDate = query.date1;
    var SecondDate = query.date2;
    var response = {};
    var fields = [];
    request.get({url: link + FirstDate, json: true}, function (err, body, a) {
        if (err) {
            return res.send(500);
        }
        request.get({url: link + SecondDate, json: true}, function (err, body, b) {
            if (err) {
                return res.send(500);
            }
            for (var i = 0; i < a.length; i++) {
                var report = a[i];
                var otherReport = null;
                for (var j = 0; j < b.length; j++) {
                    var report2 = b[j];
                    var sameRep = report2.site == report.site;
                    if ( sameRep ) {
                        otherReport = report2;
                        break;
                    }
                }
                if (otherReport) {
                    var output = jd.diff(report, otherReport);
                    fields = Object.keys(otherReport);
                    if (output == undefined) {
                        response[report.site] = "same";
                    } else {
                        console.log(JSON.stringify(output, null, 1));
                        response[report.site] = output;
                    }
                } else {
                    response[report.site] = "does not exist in both";
                }
            }
            res.render('table', { json: response, fields: fields, date1: FirstDate, date2: SecondDate });
        });
    });


});


var number = 7000;
app.listen(number);
console.log("Listening at " + number);

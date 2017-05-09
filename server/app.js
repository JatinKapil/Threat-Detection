module.exports = function(app, multer, fs) {

    var fs = require('fs');
    var http = require('http');

    function analyzeLogs(fs, logFile) {
        var outputdata = "";
        var outputline = "";
        var outputs = [];
        var outputlines = [];
        var originheaders = [];
        var logs = logFile.data.toString().split('\r');

        for (logline of logs) {
            if (logline == '\n') logs.splice(logs.indexOf('\n'), 1);
        }
        //console.log(logs);
        for (logline of logs) {

            var fields = logline.split('"');
            var origin_header = fields[2].toString();
            var rest = fields[3].toString();
            //console.log(rest);
            outputline = logline.trim();
            outputlines.push(outputline);
            originheaders.push(origin_header);

            //IP Check

            var client_ip = rest.split(' ')[5];
            client_ip = client_ip.split(':')[0].toString();
            var body = '';
            var parsedbody = ''; // Will contain the final response
            http.get("http://ip-api.com/json/" + client_ip, function(res) {
                    // Received data is a buffer.
                    // Adding it to our body
                    res.on('data', function(data) {
                        body = data;

                    });
                    // After the response is completed, parse it and log it to the console
                    res.on('end', function() {
                        parsedbody = JSON.parse(body);
                        //console.log(logline);
                        if (parsedbody.country != "India") {
                            outputs.push("Yes");
                        } else {
                            outputs.push("No");
                            //console.log(outputs);
                        }
                        if (outputs.length == logs.length) {
                            for (var i = 0; i < outputs.length; i++) {
                                if (originheaders[i] == "MATLAB R2013a") outputs[i] = "Yes";
                                outputdata += outputs[i] + outputlines[i] + '\n';
                            }
                            var path = logFile.path.slice(0, logFile.path.lastIndexOf('\\'));
                            fs.writeFile(path + '\\' + 'output_' + logFile.originalname, outputdata, (err) => {
                                if (err) throw err;
                                console.log('The file has been saved!');
                                return outputdata;
                            });
                        }
                    });
                })
                .on('error', function(e) { // If any error has occured, log error to console
                    console.log("Error: " + e.message);
                });
        }
    }

    var upload = multer({
        dest: __dirname + '/uploads'
    });
    app.post('/api/upload', upload.single('fileToUpload'), uploadLogFile);

    function uploadLogFile(req, res) {
        var logFile = {
            "originalname": req.file.originalname,
            "size": req.file.size,
            "data": new Buffer(fs.readFileSync(req.file.path)).toString(),
            "path": req.file.path,
            "mimetype": req.file.mimetype
        };
        //console.log(logFile);
        analyzeLogs(fs, logFile);
        res.json(logFile);
    }

};

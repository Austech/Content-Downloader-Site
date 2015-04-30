var static = require("node-static");
var fileServer = new static.Server("./media");
var child_process = require("child_process");


var httpServer = require("http").createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(1994);
var socket = require("socket.io")(httpServer);

var counter = 0;
socket.on("connection", function (client) {
    
    client.emit("success", { message: "welcome" });

    client.on('request', function (data) {
        var url = data["url"];
        var type = data["type"];
        
        console.log(data);
        var ext = "%(ext)s";
        var tempCount = counter++;
        var args = ["-m", "youtube_dl", "--no-playlist", "--prefer-ffmpeg"];

        if (type == "audio")
        {
            args.push("--extract-audio");
            ext = "mp3";
        }
        else {
            ext = "mp4";
        }

        args.push(url, "-o", "./media/tmp/" + tempCount + "/%(title)s." + ext);
        var dl = child_process.spawn("python", args);

        dl.stdout.on("data", function (data) {
            data = data.toString();
            console.log(data);
            var percent = parseInt(data.substring(11, data.indexOf("%")));
            if (isNaN(percent) == false) {
                client.emit("progress", { pr: percent });
            }

            if (data.indexOf("[ffmpeg]") > -1 && data.indexOf("Destination") > -1) {
                var destination = data.substring(data.indexOf("media\\tmp\\") + 5, data.indexOf("\n"));
                console.log(destination);

                client.emit("link", { url: destination });
            }
            
            if (data.indexOf("[ffmpeg]") > -1 && (data.indexOf("Merging") > -1 || data.indexOf("Correcting") > -1)) {
                var destination = data.substring(data.indexOf("media\\tmp\\") + 5, data.indexOf("\n") - 1);
                console.log(destination);
                
                client.emit("link", { url: destination });
            }
        });
        
        dl.on("close", function (code) {
            client.emit("finished", { code: code });
        });
        

        if (type == "video") {

        }

    });
});




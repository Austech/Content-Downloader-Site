var static = require("node-static");
var fileServer = new static.Server("./media");
var child_process = require("child_process");


var httpServer = require("http").createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);
var socket = require("socket.io")(httpServer);

var counter = 0;
socket.on("connection", function (client) {
    
    client.emit("success", { message: "welcome" });

    client.on('request', function (data) {
        var url = data["url"];
        var type = data["type"];
        
        console.log(data);
        
        var tempCount = counter++;
        var dl = child_process.spawn("python", ["-m", "youtube_dl", "--no-playlist", url, "-o", "./media/tmp/" + tempCount + "/%(title)s.%(ext)s"]);

        dl.stdout.on("data", function (data) {
            data = data.toString();
            console.log(data);
            var percent = parseInt(data.substring(11, data.indexOf("%")));
            if (isNaN(percent) == false) {
                client.emit("progress", { pr: percent });
            }

            if (data.indexOf("Destination") > -1) {
                var destination = data.substring(29, data.indexOf("\n"));
                console.log(destination);
                client.emit("link", { url: destination });
            }
        });
        

        if (type == "video") {

        }

    });
});





var contentclient = function()
{
    this.connected = false;
    this.socket = null;
};

contentclient.prototype.onSuccess = function()
{
    console.log("connected");
}

contentclient.prototype.progress = function(data)
{
    console.log(data);
}

contentclient.prototype.downloadLink = function (data) {
    console.log(data);
}
contentclient.prototype.downloadFinished = function (data) {
    console.log(data);
}

contentclient.prototype.connect = function(ip)
{
    this.socket = io(ip);
    this.socket.on("success", this.onSuccess);
    this.socket.on("progress", this.progress);
    this.socket.on("link", this.downloadLink);
    this.socket.on("finished", this.downloadFinished);
    this.connected = true;
}

contentclient.prototype.startDownload = function(url, content_type)
{
    if (!this.connected) return false;
    this.socket.emit("request", { url: url, type: content_type });

}
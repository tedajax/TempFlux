var Connection = (function () {
    function Connection(url) {
        this.url = url;
        this.connected = false;
        this.msgQueue = [];

        this.token = Math.floor(Math.random() * 1000000) + 1;
        this.highSeqAck = 0;

        this.Protobuf = dcodeIO.ProtoBuf;
        this.builder = this.Protobuf.loadProtoFile("proto/core.proto");
        this.messageRoot = this.builder.build();
    }
    Connection.prototype.connect = function () {
        var _this = this;
        if (this.connected) {
            return;
        }

        try  {
            this.socket = new WebSocket(this.url);
            this.socket.binaryType = "arraybuffer";
        } catch (exception) {
            console.log(exception);
        }
        this.socket.onopen = function () {
            return _this.onOpen();
        };
        this.socket.onmessage = function (msg) {
            return _this.onMessage(msg);
        };
        this.socket.onclose = function () {
            return _this.onClose();
        };
    };

    Connection.prototype.onOpen = function () {
        console.log("connection to " + this.url + " succesful");
        this.connected = true;

        this.flushQueue();
    };

    Connection.prototype.onMessage = function (msg) {
        var data = this.messageRoot.Message.decode(msg.data);

        var highSeqAck = this.highSeqAck;
        data.reliableCommands = data.reliableCommands.filter(function (c) {
            return (c.sequence > highSeqAck);
        });
        this.highSeqAck = data.reliableCommands.reduce(function (p, c) {
            return Math.max(p, c.sequence);
        }, highSeqAck);

        messageHandler.parseMessage(data);
    };

    Connection.prototype.sendCommands = function (commands) {
        var msg = {
            "token": this.token,
            "message": {
                "seqAck": this.highSeqAck,
                "reliableCommands": [],
                "commands": commands
            }
        };

        var message = new this.messageRoot.ClientMessage(msg);

        this.sendMessage(message.encode().toArrayBuffer());
    };

    Connection.prototype.sendMessage = function (msg) {
        if (!this.connected) {
            this.msgQueue.push(msg);
            return;
        }

        this.socket.send(msg);
    };

    Connection.prototype.flushQueue = function () {
        if (!this.connected) {
            return;
        }

        while (this.msgQueue.length > 0) {
            this.sendMessage(this.msgQueue[0]);
            this.msgQueue.shift();
        }
    };

    Connection.prototype.onClose = function () {
        console.log("closing connection to " + this.url);
        this.connect();
    };
    return Connection;
})();
//# sourceMappingURL=connection.js.map

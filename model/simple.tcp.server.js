var g_net = require('net');
var g_config = {port: 8899, host: "127.0.0.1"};

//存放客户端
global.socket_clients = {};

String.prototype.padLeft = function (max, c) {
    var self = this;
    return new Array(Math.max(0, max - self.length + 1)).join(c || " ") + self
};

global.res_content = function (data) {
    return new Buffer(JSON.stringify(data) + "\r\n");
}

Date.prototype.format = function (format) {
    var self = this;
    var h = self.getHours();
    var m = self.getMinutes().toString();
    var s = self.getSeconds().toString();
    var M = (self.getMonth() + 1).toString();
    var yyyy = self.getFullYear().toString();
    var d = self.getDate().toString();
    var a = "AM";
    var H = h.toString();
    if (h >= 12) {
        h -= 12;
        a = "PM"
    }
    if (h === 0)h = 12;
    h = h.toString();
    var hh = h.padLeft(2, "0");
    var HH = H.padLeft(2, "0");
    var mm = m.padLeft(2, "0");
    var ss = s.padLeft(2, "0");
    var MM = M.padLeft(2, "0");
    var dd = d.padLeft(2, "0");
    var yy = yyyy.substring(2);
    return format.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/HH/g, HH).replace(/H/g, H).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, ss).replace(/a/g, a)
};

global.curr_time = function () {
    var self = new Date();
    var h = self.getHours();
    var m = self.getMinutes().toString();
    var s = self.getSeconds().toString();
    var M = (self.getMonth() + 1).toString();
    var yyyy = self.getFullYear().toString();
    var d = self.getDate().toString();
    var a = "AM";
    var H = h.toString();
    if (h >= 12) {
        h -= 12;
        a = "PM"
    }
    if (h === 0)h = 12;
    h = h.toString();
    var hh = h.padLeft(2, "0");
    var HH = H.padLeft(2, "0");
    var mm = m.padLeft(2, "0");
    var ss = s.padLeft(2, "0");
    var MM = M.padLeft(2, "0");
    var dd = d.padLeft(2, "0");
    var yy = yyyy.substring(2);
    return format.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/HH/g, HH).replace(/H/g, H).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, ss).replace(/a/g, a)

}

module.exports = function (config) {

    if (config) {
        g_config = config;
    }

    this.run = function () {
        var g_server = g_net.createServer(JSON.parse(g_config.options));
        var self = this;

        if (typeof g_config.client_max_num != 'undefined') {
            g_server.maxConnections = g_config.client_max_num;
        }
        g_server.listen(g_config.port, g_config.host);
        g_server.on('connection', function (client) {
            //设置client id
            client.id = self.connect_id();
            //客户端初始状态 为 分登陆状态
            client.login = 0;
            //缓存客户端列表
            socket_clients[client.id] = client;
            //发送欢迎信息
            client.write(new Buffer(self.connect_welcome()));
            //发送客户端标识
            client.write(res_content({err: "0", errmsg: "", data: {clientid: client.id}}));
            client.on('data', function (data) {

                console.log(Object.keys(socket_clients).length);
                console.log(socket_clients[client.id]['login']);
                try {
                    data = JSON.parse(data);
                }
                catch (err) {
                    client.write(res_content({err: "-1", errmsg: "json 解析错误", data: {}}));
                    client.destroy();
                    delete socket_clients[client.id];
                    return;
                }
                if (typeof data.cmd == 'undefined') {//必须是json格式的字串
                    client.write(res_content({err: "-1", errmsg: "json 参数错误", data: {}}));
                    client.destroy();
                    delete socket_clients[client.id];
                    return;
                }
                if (data.cmd == 'quit' || data.cmd == 'exit' || data.cmd == 'logout') {//客户端请求断开连接
                    client.write(new Buffer(self.connect_bye()));
                    client.destroy();
                    return;
                }
                if (data.cmd == 'shutdown') {//关闭服务器
                    client.write(new Buffer(self.connect_bye()));
                    client.destroy();
                    return;
                }
                try {
                    var task_object = require(g_path.join(task_model_dir, data.cmd + '.js'));
                }
                catch (e) {
                    client.write(res_content({err: "-1", errmsg: "命令错误", data: {}}));
                    return ;
                }
                try {
                    new task_object(g_server, client, data.data).run();
                }
                catch (e) {
                    client.write(res_content({err: "-1", errmsg: "请求异常", data: {}}));
                    client.destroy();
                    return ;
                }

            });

            client.setTimeout(g_config.timeout ? g_config.timeout : 3000, function () {
                client.destroy();
            });

            client.on('error', function () {
                delete socket_clients[client.id];
            });

            client.on('close', function () {
                delete socket_clients[client.id];
                //new (require(g_path.join(task_model_dir, 'logout.js')))(g_server, client, {}).run();
                console.log('client close');
                client.destroy();
            });
        })

        g_server.on('error', function (err) {
            console.error('server 发生错误');
            console.error(err);
        });

        this.console_server_run();

    }

    this.get_client_key = function (id) {
        return 'c' + id;
    }
    this.connect_welcome = function () {
        return "welcome to " + g_config.name + "\r\n";
    }

    this.connect_bye = function () {
        return "bye from " + g_config.name + "\r\n";
    }

    this.connect_id = function (max) {
        max = max || 40;
        var rnd = function () {
            return Math.floor(Math.random() * 65536).toString(16)
        };
        var str = "";
        for (var i = 0; i < max / 4 + 1; i++)str += rnd();
        return str.substring(0, max)
    }
    this.console_server_run = function () {
        console.log("====================================================");
        console.log('服务器开始运行');
        console.log("====================================================");
        console.log("pid          : " + process.pid);
        console.log("node.js      : " + process.version);
        console.log("====================================================");
        console.log("ip           : " + g_config.host);
        console.log("端口         : " + g_config.port);
        console.log("====================================================");
        console.log("name         : " + g_config.name);
        console.log("version      : " + g_config.version);
        console.log("author       : " + g_config.author);
        console.log("====================================================");
        console.log((new Date()).format('yyyy-MM-dd HH:mm:ss'));

    }
}
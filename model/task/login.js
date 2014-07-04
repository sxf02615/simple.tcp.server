/*
* 登陆 校验用户账号密码
* */
var db = require(g_path.join(app_model_dir, 'db.js'));
var crypto = require('crypto');

function get_token_key(id) {
    return id + '-token';
}

String.prototype.md5 = function (salt) {
    var hash = crypto.createHash("md5");
    hash.update(this + (salt || ""), 'utf8');
    return hash.digest("hex")
};

function create_token() {
    var hash = crypto.createHash("md5");
    hash.update(((Math.random() * 65536).toString()), 'utf8');
    return hash.digest("hex")
}

module.exports = function (server, socket_client, task_data) {

    this.run = function () {

        if (typeof task_data.username != "undefined" && typeof task_data.passwd != "undefined") {

            //数据库查询账号密码
            var client_mysql = db.mysql();
            client_mysql.connect();
            client_mysql.query('SELECT * FROM user WHERE username = ? and passwd=?', [task_data.username, task_data.passwd.md5()], check_user_passwd_callback);

            //更新用户socket id 后回调
            function update_clientid_callback(err, result) {
                client_mysql.destroy();
                var token = create_token();
                //正常情况下，这里要判断是否写入成功
                var client_redis = db.redis();
                client_redis.set(get_token_key(socket_client.id), token);
                client_redis.quit();
                socket_client.write(res_content({err: "0", errmsg: "", data: {token: token}}));
                return;
            }

            //查询用户并校对密码后回调
            function check_user_passwd_callback(err, rows, fields) {
                if (err) {
                    client_mysql.destroy();
                    socket_client.write(res_content({err: "-1", errmsg: "数据库查询用户失败", data: {}}));
                    return;
                }
                if (rows.length <= 0) {
                    client_mysql.destroy();
                    socket_client.write(res_content({err: "-1", errmsg: "用户或密码错误", data: {}}));
                    return;
                }

                //标识tcp 登陆成功
                socket_clients[socket_client.id]['login'] = 1;
                //保存 tcp 连接的 用户id 用于收发消息 定位用户
                socket_clients[socket_client.id]['userid'] = rows[0]['id'];

                client_mysql.query('update user set clientid = ? WHERE id = ?', [socket_client.id, rows[0]['id']], update_clientid_callback);
                return;
            }

            return;
        }
        socket_client.write(res_content({err: "-1", errmsg: "登陆失败（参数缺失 ）", data: {}}));

        return;
    }

}
/*
 {"cmd":"login","data":{"name":"songxinfeng"}}

 {"cmd":"login","data":{"username":"sxf02615","passwd":"sxf02615@163.com"}}
 {"cmd":"login","data":{"username":"songxinfeng","passwd":"songxinfeng@ztgame.com"}}
 */

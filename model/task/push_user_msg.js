/*
 * 按userid发送消息
 * */
function get_msg_key(user_id) {
    return 'msg-' + user_id;
}

function unline_msg_push(user_id, msg) {
    var client_redis = db.redis();
    client_redis.lpush(get_msg_key(user_id), msg);
    client_redis.quit();
}

var db = require(g_path.join(app_model_dir, 'db.js'));
//var check_token = require(g_path.join(app_model_dir, 'check_token.js'));

module.exports = function (server, socket_client, task_data) {

    this.run = function () {
        if (socket_clients[socket_client.id]['userid'] == undefined) {
            socket_client.write(res_content({err: "-1", errmsg: "请先登录", data: {}}));
            return;
        }

        //查询用户ID对应的clientid
        var client_mysql = db.mysql();
        client_mysql.connect();
        client_mysql.query('SELECT * FROM user WHERE id = ? ', [task_data.userid], send_msg);

        function send_msg(err, rows) {
            console.log(rows);
            if (err || rows.length <= 0) {
                socket_client.write(res_content({err: "-1", errmsg: "查询用户失败，发送失败", data: {}}));
                return;
            }
            var client_id = rows[0]['clientid'];
            if (socket_clients[client_id] == undefined) {
                console.log(client_id, '用户已离线');
                //写入离线消息
                unline_msg_push(task_data.userid, task_data.msg);
                return;
            }
            socket_clients[client_id].write(res_content({err: "0", errmsg: "", data: task_data.msg}));
            return;
        }


    }

}
/*
 {"cmd":"push_user_msg","data":{"userid":"2","msg":"消息来了"}}
 */
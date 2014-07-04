/*
* 拉去离线消息
* */
var db = require(g_path.join(app_model_dir, 'db.js'));

function get_msg_key(user_id) {
    return 'msg-' + user_id;
}

module.exports = function (server, socket_client, task_data) {

    this.run = function () {
        if (socket_clients[socket_client.id]['userid'] == undefined) {
            socket_client.write(res_content({err: "-1", errmsg: "请先登录", data: {}}));
            return;
        }
        var client_redis = db.redis();
        var msg_key = get_msg_key(socket_clients[socket_client.id]['userid']);
        console.log(msg_key);
        client_redis.lpop(msg_key, function (err, msg_data) {
            socket_client.write(res_content({err: "0", errmsg: "", data: msg_data}));
        });
        return;
    }

}
/*
 {"cmd":"get_msg","data":{"token":"a1d56b8e1826b2830d2f38065939bbc3"}}
 */
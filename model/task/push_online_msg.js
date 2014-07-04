/*
 * 发送消息 按clientid 发送
 * */

var db = require(g_path.join(app_model_dir, 'db.js'));
//var check_token = require(g_path.join(app_model_dir, 'check_token.js'));

function get_msg_key(user_id) {
    return 'msg-' + user_id;
}

function unline_msg_push(clientid, msg) {
    var client_mysql = db.mysql();
    client_mysql.connect();
    client_mysql.query('SELECT * FROM user WHERE clientid = ? ', [clientid], function (err, rows) {

        if (!err && rows.length > 0) {
            var client_redis = db.redis();
            client_redis.lpush(get_msg_key(rows[0]['id']), msg);
            client_redis.quit();
        }
        else {
            console.log('数据库查询失败|用户查询失败');
        }

    });


}


module.exports = function (server, socket_client, task_data) {

    this.run = function () {
        if (socket_clients[socket_client.id]['userid'] == undefined) {
            socket_client.write(res_content({err: "-1", errmsg: "请先登录", data: {}}));
            return;
        }
        //群发
        if (task_data.clientid == undefined) {

            Object.keys(socket_clients).forEach(function (client_id) {
                socket_clients[client_id].write(res_content({err: "0", errmsg: "", data: task_data.msg}));
            });
            socket_client.write(res_content({err: "0", errmsg: "消息发送结束", data: {}}));
            return;
        }
        //单发
        if (socket_clients[task_data.clientid] == undefined) {
            console.log(task_data.clientid, '用户已离线');
            socket_client.write(res_content({err: "0", errmsg: "客户端离线状态，已经发送离线消息", data: {}}));

            //写入离线消息
            unline_msg_push(task_data.clientid, task_data.msg);

            return;

        }
        socket_clients[client_id].write(res_content({err: "0", errmsg: "", data: task_data.msg}));
        return;

    }

}
/*
 {"cmd":"push_online_msg","data":{"msg":"消息来了"}}
 {"cmd":"push_online_msg","data":{"clientid":"608edba91f0fd9f2fe1b4747751f6cefd9237460","msg":"client 离线消息 "}}
 */
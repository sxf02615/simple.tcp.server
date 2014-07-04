/*
* 退出登录状态
* */
var db = require(g_path.join(app_model_dir, 'db.js'));
module.exports = function (server, socket_client, task_data) {

    this.run = function () {
        var client_mysql = db.mysql();
        client_mysql.connect();
        client_mysql.query('UPDATE user SET clientid = "" WHERE clientid= ?', [socket_client.id], function (err, result) {
            client_mysql.destroy();
            return;
        });
        return;
    }
}
/*
 {"cmd":"logout","data":{"token":"a1d56b8e1826b2830d2f38065939bbc3"}}
 */

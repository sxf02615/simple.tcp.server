var db = require(g_path.join(app_model_dir, 'db.js'));

function get_token_key(id) {
    return id + '-token';
}

module.exports = function () {
    console.log(clients);
    return true;
    this.run = function (socket_client, token, callback) {
        var client_redis = db.redis();
        client_redis.get(get_token_key(socket_client.id), function (err, token_save) {
            client_redis.quit();
            if (!token_save || token_save == null || token_save == '') {
                socket_client.write(res_content({err: "-1", errmsg: "token 失效", data: {}}));
                return;
            }
            if (token_save != token) {
                console.log(3);
                socket_client.write(res_content({err: "-1", errmsg: "token 不正确", data: {}}));
                return;
            }
            console.log(4);
            callback();
            console.log(5);
            return;
        })

    }

}
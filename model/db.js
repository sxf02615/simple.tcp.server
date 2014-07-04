var redis = require('redis');
var mysql = require('mysql');

exports.redis = function () {
    g_config.set_section('redis')

    client = redis.createClient(g_config.get('port'), g_config.get('host'));
    client.on("error", function (err) {
        //写日志
        console.log(err);
    });
    return client;

}

exports.mysql = function () {
    g_config.set_section('mysql');
    return mysql.createConnection(g_config.get());
}
//项目跟路径
global.g_app_path = __dirname;
global.g_path = require('path');
//app模块目录
global.app_model_dir = g_path.join(g_app_path,'model');
//业务处理目录
global.task_model_dir = g_path.join(g_app_path,'model','task');
//包含配置模块
global.config_dir = 'config';
//包含配置模块
global.g_config = new (require(g_path.join(app_model_dir, 'config.js')));

g_config.set_section('server');

//生成 simple_tcp_server 对象
var g_simple_tcp_server = new (require(g_path.join(app_model_dir, 'simple.tcp.server.js')))(g_config.get());
//启动
g_simple_tcp_server.run();

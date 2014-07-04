
 simple.tcp.server　     
 node.js 简至 tcp server 
 版本 0.2                
 sxf02615@163.com        

=========================

__特点 ：
-1、框架统一使用json 格式交互
-2、业务处理模块的命令，按命令单独处理，每个命令的业务处理模块 放在 model/task 里面，一个命令一个.js 文件，文件名与命令对应，如 login 对应的文件为 login.js

--现有业务处理模块 :
-1、登陆： 查询数据库中用户名密码进行比对 (login.js)
-2、登出： 退出登录状态，关闭socket 连接 (logout.js)
-3、获取用户离线消息： 读取保存在redis 里面的离线消息，一次取一条消息，需要多次获取 (get_msg.js)
-4、发送消息给在线用户： 如果用户不在线 则发送离线消息到redis  (push_online_msg.js)
-5、发送消息给用户：如果用户不在线 则发送离线消息到redis (push_user_msg.js)


--目录 :
-./config 配置文件目录
-./model 项目 模块目录
-./model/task 业务处理
-./node_modules 第三方模块目录

---文件 :
-
--./index.js
-服务端启动入口

-
--./model/db.js
-数据库模块 (nosql db |sql db) 目前支持 redis 和 mysql

-
--./model/config.js
-配置文件 模块

-
--./check_token.js
-token校验模块
-用户登录后，会分配一个token 给socket 客户端
-token可以用来做签名或者加密用的key

-
--./simple_tcp_server.sql
-数据库结构
-mysql

---安装 ：
--1、数据库 mysql
-创建数据库 更新 配置文件 config/default.ini
-将./simple_tcp_server.sql 导入mysql

--2、redis
-安装redis并更新配置文件 config/default.ini 里面的 redis 部分





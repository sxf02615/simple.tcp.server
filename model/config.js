var g_ini = require('ini');
var g_fs = require('fs');
var g_ini_file = g_path.join(g_app_path, config_dir, 'default.ini');

module.exports = function (int_file) {
    var section = null;

    if (int_file) {
        g_ini_file = g_path.join(g_app_path, config_dir, int_file + '.ini');
    }

    this.set_section = function (se) {
        section = se;
    }

    this.get = function (key) {
        if (section === null) {
            throw '请先设置 section';
        }

        var config = g_ini.parse(g_fs.readFileSync(g_ini_file, 'utf-8'));
        try {
            if (!key) {
                return config[section];
            }
            else {
                return config[section][key];
            }
        }
        catch (e) {
            return null;
        }
    }
}
var util = require("./lib/util");
var fs = require("fs");
var sql = require('mssql');


module.exports = function (dbconfig, options) {
    options = util.updateOptions(options);
    try {
        if (fs.existsSync(options.outputDirectory) == false) {
            fs.mkdirSync(options.outputDirectory);
        }
    }
    catch (err) {
        return Promise.reject(err);
    }
    options.log && console.log("Connecting to the database:", dbconfig.database, "...");
    return sql.connect(dbconfig).then(function () {
        if (options.tables.length == 0) {
            options.log && console.log("Fetching list of tables from DB", "...");
            return util.getTableList(options.tables, options.ignoreList);
        }
    })
        .then(function () {
            options.log && console.log("Starting DB export from", dbconfig.database, "...");
            var exportPromise = options.tables.map(function (table) {
                return util.exportTable(table.name, options.outputDirectory).then(function () {
                    options.log && console.log(table.name + " CSV file exported!");
                });
            });
            return Promise.all(exportPromise).then(function () {
                options.log && console.log("All tables have been exported to:", options.outputDirectory);
                sql.close();
            });
        })
        .catch(function (err) {
            sql.close();
            throw (err);
        });

}

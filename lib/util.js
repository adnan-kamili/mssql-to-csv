var sql = require('mssql');
var csv = require("fast-csv");
var fs = require('fs');

var options = {
    ignoreList: ["sysdiagrams"],
    tables: [],
    outputDirectory: '.',
    log: true
};

module.exports = {
    getTableList: function (tables, ignoreList) {
        var request = new sql.Request();
        request.input('table_owner', sql.NVarChar(50), "dbo");
        return request.execute('sp_tables').
            then(function (res) {
                var tableList = res[0];
                for (var i = 0; i < tableList.length; i++) {
                    if (ignoreList.indexOf(tableList[i].TABLE_NAME) > -1) {
                        continue;
                    }
                    tables.push({ name: tableList[i].TABLE_NAME });
                }
            })
    },
    exportTable: function (tableName, outputDirectory) {
        return new Promise(function (resolve, reject) {
            var csvStream = csv.format({ headers: false, quoteColumns: true }),
                writableStream = fs.createWriteStream(outputDirectory + "/" + tableName + ".csv", { encoding: "utf8" });
            writableStream.on("finish", function () {
                resolve();
            });
            csvStream.pipe(writableStream);
            var request = new sql.Request();
            request.stream = true;
            request.query('select * from ' + tableName);
            request.on('recordset', function (columns) {
                var keys = [];
                for (var key in columns) {
                    if (columns.hasOwnProperty(key)) {
                        keys.push(key);
                    }
                }
                csvStream.write(keys);
            });
            request.on('row', function (row) {
                // fix for null values getting replaced with empty string
                for (var key in row) {
                    if (row.hasOwnProperty(key) && row[key] == null) {
                        row[key] = "null";
                    }
                }
                csvStream.write(row);
            });
            request.on('error', function (err) {
                reject(err);
            });
            request.on('done', function (returnValue) {
                csvStream.end();
            });
        });
    },
    updateOptions: function (opts) {
        if(!opts) {
            return options;
        }
        if(opts.ignoreList && Array.isArray(opts.ignoreList)) {
            options.ignoreList = opts.ignoreList;
        }
        if(opts.tables && Array.isArray(opts.tables)) {
            options.tables = opts.tables;
        }
        if(opts.outputDirectory && opts.outputDirectory.length) {
            options.outputDirectory = opts.outputDirectory;
        }
        if(opts.log !== 'undefined') {
            options.log = opts.log;
        }
        return options;
    }
}
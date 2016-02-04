# mssql-to-csv
Node.js module to export MS SQL database to CSV

## Installation

  npm install mssql-to-csv --save

## Usage
```javascript
    var mssqlExport = require('mssql-to-csv')

    // All config options supported by https://www.npmjs.com/package/mssql
    var dbconfig = {
        user: 'username',
        password: 'pass',
        server: 'servername',
        database: 'dbname',
        requestTimeout: 320000,
        pool: {
            max: 20,
            min: 12,
            idleTimeoutMillis: 30000
        }
    };

    var options = {
        ignoreList: ["sysdiagrams"], // tables to ignore
        tables: [],                  // empty to export all the tables
        outputDirectory: 'somedir',
        log: true
    };

    mssqlExport(dbconfig, options).then(function(){
        console.log("All done successfully!");
        process.exit(0);
    }).catch(function(err){
        console.log(err.toString());
        process.exit(-1);
    });
```


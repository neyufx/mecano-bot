const mysql = require('mysql');
require('dotenv').config();

    var pool = mysql.createPool({
        connectionLimit: 10,
        host: '127.0.0.1', // 153.92.220.151
        user: 'root', // u463335117_brasserie
        password: '', // Neyufx99&
        database: 'bennys', // u463335117_brasserie
        connectTimeout: 30000
    })
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.release();
        if (err) throw err;
    });

module.exports = { pool }; // Exporte la classe pour l'utiliser dans les autres 
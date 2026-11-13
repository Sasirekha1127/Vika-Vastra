// Server/scripts/importToTiDB.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function importDatabase() {
    const config = {
        host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 4000,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true,
        },
        multipleStatements: true,
    };

    console.log(`Connecting to TiDB Cloud gateway (${config.host}:${config.port})...`);
    const conn = await mysql.createConnection(config);
    console.log('Connected to TiDB Cloud successfully!');

    console.log('Creating database vika_vasthra_db if not exists...');
    await conn.query('CREATE DATABASE IF NOT EXISTS vika_vasthra_db;');
    await conn.query('USE vika_vasthra_db;');
    console.log('Switched to database vika_vasthra_db.');

    const sqlFilePath = path.resolve(__dirname, '../vika_vastra_db_dump.sql');
    console.log(`Reading SQL dump from ${sqlFilePath}...`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL dump into TiDB Cloud (this may take a moment)...');
    await conn.query(sql);
    console.log('SQL dump executed successfully!');

    const [tables] = await conn.query('SHOW TABLES;');
    console.log('\n--- Tables in TiDB Cloud vika_vasthra_db ---');
    console.log(tables);

    const [products] = await conn.query('SELECT COUNT(*) as count FROM products;');
    const [images] = await conn.query('SELECT COUNT(*) as count FROM productimages;');
    const [variants] = await conn.query('SELECT COUNT(*) as count FROM productvariants;');
    console.log(`\nVerification:`);
    console.log(`- Products count: ${products[0].count}`);
    console.log(`- Product Images count: ${images[0].count}`);
    console.log(`- Product Variants count: ${variants[0].count}`);

    await conn.end();
    console.log('\nSUCCESS! TiDB Cloud is fully populated and verified.');
}

importDatabase().catch(err => {
    console.error('TiDB Import Error:', err);
    process.exit(1);
});

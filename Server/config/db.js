const { Sequelize } = require('sequelize');
require('dotenv').config();

const isRemoteDb = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';
const useSsl = process.env.DB_SSL === 'true' || isRemoteDb;

const dialectOptions = {
    connectTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
};

if (useSsl) {
    dialectOptions.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
    };
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || null,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000,
        },
        dialectOptions,
    }
);

module.exports = sequelize;
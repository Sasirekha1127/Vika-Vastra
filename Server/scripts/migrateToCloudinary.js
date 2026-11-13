// Server/scripts/migrateToCloudinary.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const sequelize = require('../config/db');

async function uploadFile(localPath, publicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            localPath,
            {
                folder: 'vika-vastra',
                public_id: publicId,
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            }
        );
    });
}

async function runMigration() {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('ERROR: Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Server/.env before running migration.');
        process.exit(1);
    }

    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    const uploadsDir = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory does not exist. Nothing to upload.');
        process.exit(0);
    }

    const files = fs.readdirSync(uploadsDir).filter(f => !fs.statSync(path.join(uploadsDir, f)).isDirectory());
    console.log(`Found ${files.length} files in ${uploadsDir}`);

    const urlMap = {}; // local filename -> cloudinary secure_url

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(uploadsDir, file);
        const nameWithoutExt = path.parse(file).name;
        console.log(`[${i + 1}/${files.length}] Uploading ${file} to Cloudinary...`);
        try {
            const secureUrl = await uploadFile(filePath, nameWithoutExt);
            urlMap[file] = secureUrl;
            console.log(`  -> OK: ${secureUrl}`);
        } catch (uploadErr) {
            console.error(`  -> FAILED: ${file}`, uploadErr.message);
        }
    }

    console.log('\n--- Updating Database Records with Cloudinary URLs ---');

    for (const [filename, cloudUrl] of Object.entries(urlMap)) {
        const variants = [
            filename,
            `uploads/${filename}`,
            `uploads\\${filename}`,
            `/uploads/${filename}`,
        ];

        // 1. Products table
        for (const v of variants) {
            await sequelize.query(
                `UPDATE products SET image = :cloudUrl WHERE image = :oldPath`,
                { replacements: { cloudUrl, oldPath: v } }
            );
        }

        // 2. productimages table
        for (const v of variants) {
            await sequelize.query(
                `UPDATE productimages SET url = :cloudUrl WHERE url = :oldPath`,
                { replacements: { cloudUrl, oldPath: v } }
            );
        }

        // 3. productvariants table
        for (const v of variants) {
            await sequelize.query(
                `UPDATE productvariants SET image = :cloudUrl WHERE image = :oldPath`,
                { replacements: { cloudUrl, oldPath: v } }
            );
        }

        // 4. Banners table
        for (const v of variants) {
            await sequelize.query(
                `UPDATE banners SET image = :cloudUrl WHERE image = :oldPath`,
                { replacements: { cloudUrl, oldPath: v } }
            );
        }

        // 5. offer_banners table
        for (const v of variants) {
            await sequelize.query(
                `UPDATE offer_banners SET image = :cloudUrl WHERE image = :oldPath`,
                { replacements: { cloudUrl, oldPath: v } }
            );
        }
    }

    console.log('Migration finished successfully! All local image paths in DB are now updated to Cloudinary URLs.');
    process.exit(0);
}

runMigration().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});

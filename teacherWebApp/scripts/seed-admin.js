/**
 * Usage:
 * node scripts/seed-admin.js --email=admin@example.com --password=pass123
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../src/models/Admin').default;

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const email = argv.email || argv.e || 'admin@example.com';
  const password = argv.password || argv.p || 'admin123';

  const MONGO_URI = process.env.MONGO_URI || process.env.NEXT_PUBLIC_MONGO_URI || '';
  if (!MONGO_URI) {
    console.error('Please set MONGO_URI in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || undefined });

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = new Admin({ email: email.toLowerCase(), password, firstName: 'Auto', lastName: 'Admin' });
  await admin.save();
  console.log('Created admin:', admin.email);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

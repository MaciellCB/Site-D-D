const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Usage:
// MONGO_URI must be set in env. Optionally set ADMIN_USERNAME and ADMIN_PASSWORD.
// Example:
// ADMIN_USERNAME=admin ADMIN_PASSWORD=YourPass node create_admin.js

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // if undefined, the script will generate and print one

function generatePassword() {
  // 16 chars, mixed
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}<>?';
  let out = '';
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const AccountSchema = new mongoose.Schema({ username: { type: String, required: true, unique: true }, passwordHash: String, isMaster: Boolean, preferences: mongoose.Schema.Types.Mixed, characters: [String] }, { timestamps: true });
  const Account = mongoose.model('Account', AccountSchema);

  const username = ADMIN_USERNAME;
  const password = ADMIN_PASSWORD || generatePassword();

  const existing = await Account.findOne({ username: new RegExp(`^${username}$`, 'i') });
  if (existing) {
    console.log('Account already exists:', username);
    console.log('If you want to update the password, delete the user or change it manually in the DB.');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const acc = new Account({ username, passwordHash: hash, isMaster: true });
  await acc.save();
  console.log('Created master account:', username);
  console.log('Password:', password);
  console.log('IMPORTANT: store this password securely and change it as needed.');
  process.exit(0);
}

main().catch(e => { console.error('Error:', e); process.exit(1); });

import crypto from "crypto";

function scryptAsync(password, salt, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

async function main() {
  const password = process.argv[2] ?? "";
  if (!password.trim()) {
    console.error('Usage: node scripts/generate-admin-password-hash.mjs "your-password"');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password.trim(), salt, 64);
  const hash = `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
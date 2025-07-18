import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const appsPath = path.join(__dirname, '../apps');

const services = fs
  .readdirSync(appsPath)
  .filter((name) => fs.statSync(path.join(appsPath, name)).isDirectory());

console.log('Building services:', services.join(', '));

services.forEach((service) => {
  console.log(`\n🔨 Building ${service}...`);
  try {
    execSync(`nest build ${service}`, { stdio: 'inherit' });

    console.log(`✅ Build completed for ${service}`);
  } catch (error) {
    console.error(`❌ Build failed for ${service}:`, error.message);
  }
});

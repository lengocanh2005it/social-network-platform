import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appsPath = path.join(__dirname, '../apps');

function getAllServices(dir, prefix = '') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const fullPath = path.join(appsPath, dir);
  return (
    fs
      .readdirSync(fullPath)
      .filter((name) => fs.statSync(path.join(fullPath, name)).isDirectory())
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .map((name) => path.join(prefix, dir, name).replace(/\\/g, '/'))
  );
}

const services = fs
  .readdirSync(appsPath)
  .filter((name) => fs.statSync(path.join(appsPath, name)).isDirectory())
  .flatMap((name) => {
    const servicePath = path.join(appsPath, name);

    const subDirs = fs
      .readdirSync(servicePath)
      .filter((sub) => fs.statSync(path.join(servicePath, sub)).isDirectory());

    if (subDirs.length > 0) {
      return getAllServices(name, '');
    }

    return [name];
  });

console.log('Starting services:', services.join(', '));

services.forEach((service) => {
  console.log(`\n🔨 Starting ${service}...`);
  try {
    execSync(`nest start ${service} --watch`, { stdio: 'inherit' });

    console.log(`✅ ${service} started successfully`);
  } catch (error) {
    console.error(`❌ Failed to start ${service}:`, error.message);
  }
});

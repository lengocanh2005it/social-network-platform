const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const appsPath = path.join(__dirname, '../apps');

const services = fs.readdirSync(appsPath).filter((name) => {
  const fullPath = path.join(appsPath, name);
  return fs.statSync(fullPath).isDirectory();
});

if (services.length === 0) {
  console.error('❌ No service found in the /apps directory.');
  process.exit(1);
}

console.log('🔍 Services found:', services.join(', '));

const commands = services.map((name) => `nest build apps/${name} --watch`);
const commandStr = `npx concurrently "${commands.join('" "')}"`;

console.log(`\n🚀 Running:\n${commandStr}\n`);

exec(commandStr, (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  if (stderr) {
    console.error(stderr);
  }
  console.log(stdout);
});

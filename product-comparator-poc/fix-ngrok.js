const fs = require('fs');
const content = [
  'version: "2"',
  'authtoken: 3FIrGfVPb3o7bcLnH4hpZuB4JRZ_TJo4TZcRhGb5eyvxw9s4',
  '',
  'tunnels:',
  '  frontend:',
  '    addr: 5173',
  '    proto: http',
  '  backend:',
  '    addr: 3001',
  '    proto: http',
].join('\n');
fs.writeFileSync('./ngrok.yml', content);
console.log('ngrok.yml updated');

const fs = require('fs');
const os = require('os');
const path = require('path');

// 1. Detetar o IP Local da máquina (IPv4)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const newIp = getLocalIp();
const newUrl = `http://${newIp}:3333`;

// 2. Lista de ficheiros que precisam de atualização
const filesToUpdate = [
  './constants/Config.ts',
];

console.log(`🚀 Novo IP detetado: ${newIp}`);
console.log(`🔧 A atualizar URLs para: ${newUrl}\n`);

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Regex para encontrar URLs http://192.168.x.x:3333 ou http://localhost:3333
    const urlRegex = /http:\/\/(localhost|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):3333/g;
    
    if (urlRegex.test(content)) {
      const updatedContent = content.replace(urlRegex, newUrl);
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
    } else {
      console.log(`⚠️ Nenhuma URL antiga encontrada em: ${filePath}`);
    }
  } else {
    console.log(`❌ Ficheiro não encontrado: ${filePath}`);
  }
});

console.log('\n✨ Processo concluído! Reinicie o Expo e o servidor da API.');
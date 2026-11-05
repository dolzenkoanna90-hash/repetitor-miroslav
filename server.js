// Локальный сервер без сторонних зависимостей.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = {'/course.js':'course.js','/sw.js':'sw.js','/manifest.webmanifest':'manifest.webmanifest','/assets/app-icon.svg':'assets/app-icon.svg','/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/content.js':'content.js','/app.js':'app.js','/assets/spider-hero.jpeg':'assets/spider-hero.jpeg','/assets/batman.jpeg':'assets/batman.jpeg','/assets/iron-man.jpeg':'assets/iron-man.jpeg','/assets/hulk.jpeg':'assets/hulk.jpeg','/assets/thor.jpeg':'assets/thor.jpeg','/assets/captain-america.jpeg':'assets/captain-america.jpeg','/assets/nyc-night.png':'assets/nyc-night.png'};
const types = {'.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpeg':'image/jpeg','.png':'image/png'};
const port=Number(process.env.PORT||4173);
const host=process.env.HOST||'127.0.0.1';
const server=http.createServer((req,res)=>{
 const file=assets[new URL(req.url,'http://localhost').pathname];
 if(!file){res.writeHead(404);res.end('Not found');return;}
 fs.readFile(path.join(__dirname,file),(error,bytes)=>{
  if(error){res.writeHead(500);res.end('Unable to read asset');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes);
 });
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Порт ${port} занят. Используйте PORT=4174 node server.js.`:error.message);process.exitCode=1;});
server.listen(port,host,()=>{
 console.log(`Репетитор для сына на Mac: http://127.0.0.1:${port}`);
 if(host==='0.0.0.0'){
  const addresses=Object.values(require('node:os').networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal&&/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(a.address));
  for(const address of addresses)console.log(`Для iPhone в той же Wi-Fi сети: http://${address.address}:${port}/`);
 }
 console.log('Для остановки нажмите Ctrl+C.');
});

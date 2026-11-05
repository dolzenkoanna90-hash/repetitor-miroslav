// Собирает автономный HTML из текущих исходников; сторонние пакеты не нужны.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function embedAssets(source){return source.replace(/assets\/[a-z0-9-]+\.(?:jpeg|png)/g,file=>{const mime=file.endsWith('.png')?'image/png':'image/jpeg';return `data:${mime};base64,${fs.readFileSync(path.join(root,file)).toString('base64')}`;});}
const css=embedAssets(read('styles.css'));
const app=embedAssets(read('app.js'));
const script=s=>s.replace(/<\/script/gi,'<\\/script');
let html=read('index.html').replace('<link rel="manifest" href="manifest.webmanifest">','').replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`).replace('<script src="content.js" defer></script>','').replace('<script src="course.js" defer></script>','').replace('<script src="app.js" defer></script>','');
html=html.replace('</body>',`<script>${script(read('content.js'))}</script><script>${script(read('course.js'))}</script><script>${script(app)}</script></body>`);
fs.writeFileSync(path.join(root,'Репетитор.html'),html);
console.log('Создан Репетитор.html: все задания, герои и фон внутри файла.');

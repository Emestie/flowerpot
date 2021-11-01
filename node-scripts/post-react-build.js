//DEL /S /Q .\\build\\*.map && copy .\\build\\index.html .\\build\\firebase-entry-point.html

const fs = require('fs');

//paths relative to root
fs.copyFileSync('./build/index.html', './build/firebase-entry-point.html');

console.log('post-react-build : done')
//TODO: remove maps from deployment
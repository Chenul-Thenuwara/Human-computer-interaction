const fs = require('fs');
const file = 'src/lib/furniture-data.ts';
let content = fs.readFileSync(file, 'utf8');

// The regex will find imageUrl: '/images/filename.png'
// It will replace it with the Firebase storage url
content = content.replace(/imageUrl:\s*['"]\/images\/([^'"]+)['"]/g, "imageUrl: 'https://firebasestorage.googleapis.com/v0/b/furniture-visualization-app.firebasestorage.app/o/furniture-images%2F$1?alt=media'");

fs.writeFileSync(file, content);
console.log('Replaced local image URLs with Firebase URLs');

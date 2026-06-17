const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Emerald to Cyan
css = css.replace(/#10b981/g, '#06b6d4');
css = css.replace(/16,\s*185,\s*129/g, '6, 182, 212');

// Indigo to Dark Blue
css = css.replace(/#6366f1/g, '#1e40af');
css = css.replace(/99,\s*102,\s*241/g, '30, 64, 175');

// Indigo dark to Darker Blue
css = css.replace(/#4f46e5/g, '#1e3a8a');
css = css.replace(/79,\s*70,\s*229/g, '30, 58, 138');

// Teal to Light Blue
css = css.replace(/#0d9488/g, '#0ea5e9');
css = css.replace(/13,\s*148,\s*136/g, '14, 165, 233');

// Dark Teal to Blue
css = css.replace(/#0f766e/g, '#0284c7');
css = css.replace(/15,\s*118,\s*110/g, '2, 132, 199');

// Darker Teal to Dark Blue
css = css.replace(/#115e59/g, '#0369a1');
css = css.replace(/17,\s*94,\s*89/g, '3, 105, 161');

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('CSS colors updated to match the Blue/Cyan logo theme!');

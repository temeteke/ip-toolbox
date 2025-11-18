import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./public/icon.svg');

// 192x192アイコンを生成
await sharp(svg)
  .resize(192, 192)
  .png()
  .toFile('./public/icon-192.png');

// 512x512アイコンを生成
await sharp(svg)
  .resize(512, 512)
  .png()
  .toFile('./public/icon-512.png');

console.log('✓ PWAアイコンを生成しました (192x192, 512x512)');

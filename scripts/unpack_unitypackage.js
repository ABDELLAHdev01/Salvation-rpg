import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pkgPath = path.resolve('assets_source/1776846603480-930518877-nature_pixels_v2___top_down_pixel_art_asset_pack___8211____nature_pixels_v2___vip/Nature Pixels V2 Top-down pixel art asset pack v1.0/Nature Pixels V2 Top-down pixel art asset pack v1.0.unitypackage');
const tmpExtract = path.resolve('assets_source/nature_pixels_tmp');
const outDir = path.resolve('assets_source/nature_pixels_extracted');

if (!fs.existsSync(tmpExtract)) fs.mkdirSync(tmpExtract, { recursive: true });
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Extracting unitypackage tar...');
execSync(`tar -xzf "${pkgPath}" -C "${tmpExtract}"`);

console.log('Reconstructing files...');
for (const dir of fs.readdirSync(tmpExtract)) {
  const dp = path.join(tmpExtract, dir);
  if (!fs.statSync(dp).isDirectory()) continue;
  const pathFile = path.join(dp, 'pathname');
  const assetFile = path.join(dp, 'asset');
  if (fs.existsSync(pathFile) && fs.existsSync(assetFile)) {
    let origPath = fs.readFileSync(pathFile, 'utf8').split('\n')[0].trim().replace(/\0/g, '');
    const dest = path.join(outDir, origPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(assetFile, dest);
  }
}
fs.rmSync(tmpExtract, { recursive: true, force: true });
console.log('Nature Pixels extracted successfully to assets_source/nature_pixels_extracted!');

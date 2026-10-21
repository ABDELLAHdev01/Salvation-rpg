const { execSync } = require('child_process');

function listEntries(zipName, filter = '') {
  const fullPath = `C:\\Users\\abdel\\OneDrive\\Desktop\\New folder\\${zipName}`;
  const ps = `powershell -Command "[Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null; [IO.Compression.ZipFile]::OpenRead('${fullPath}').Entries | Where-Object { $_.FullName -notmatch '__MACOSX' -and $_.FullName -match '${filter}' } | Select-Object -Property FullName | Format-Table -HideTableHeaders"`;
  return execSync(ps, { encoding: 'utf-8' }).trim();
}

console.log("=== TREES ZIP ===");
console.log(listEntries('craftpix-net-385863-free-top-down-trees-pixel-art.zip', 'PNG').split('\n').slice(0, 30).join('\n'));

console.log("\n=== ISLAND ZIP ===");
console.log(listEntries('craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit.zip', '').split('\n').slice(0, 30).join('\n'));

console.log("\n=== PATH & ROAD ZIP ===");
console.log(listEntries('craftpix-net-574220-free-path-and-road-top-down-pixel-tileset.zip', '').split('\n').slice(0, 30).join('\n'));

console.log("\n=== MAIN CHARACTERS HOME ZIP ===");
console.log(listEntries('craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset.zip', 'PNG').split('\n').slice(0, 30).join('\n'));

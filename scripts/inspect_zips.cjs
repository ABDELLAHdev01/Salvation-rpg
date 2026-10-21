const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const folder = "C:\\Users\\abdel\\OneDrive\\Desktop\\New folder";
const files = fs.readdirSync(folder).filter(f => f.endsWith('.zip'));

console.log("Found zip files:", files.length);

// Let's use powershell command to list entries of the trees zip and island zip
for (const f of files) {
  const fullPath = path.join(folder, f);
  console.log(`\n=== ZIP: ${f} ===`);
  try {
    const ps = `powershell -Command "[Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null; [IO.Compression.ZipFile]::OpenRead('${fullPath}').Entries | Select-Object -First 15 -Property FullName"`;
    const out = execSync(ps, { encoding: 'utf-8' });
    console.log(out.trim());
  } catch (err) {
    console.error("Error inspecting:", err.message);
  }
}

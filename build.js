// build peanut plugin
// (c) 2023 Gleamoe
// License: MIT

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

if (fs.existsSync("./out")) {
    fs.rmSync("./out", { recursive: true, force: true });
}
fs.mkdirSync("./out");

const packageFile = require("./package.json");
const pluginPath = path.resolve(__dirname,"./out/" + packageFile.name);
fs.mkdirSync(pluginPath);

fsExtra.copySync("./dist", pluginPath + "/dist");
fs.copyFileSync("./preload.js", pluginPath + "/dist/preload.js");
fs.copyFileSync("./README.md", pluginPath + "/README.md");
fs.copyFileSync("./LICENSE", pluginPath + "/LICENSE");
fs.copyFileSync("./ffmpeg-LICENSE.txt", pluginPath + "/dist/ffmpeg-LICENSE.txt");
fs.copyFileSync("./ffmpeg.exe", pluginPath + "/dist/ffmpeg.exe");

delete packageFile.dependencies;
delete packageFile.devDependencies;
delete packageFile.scripts;
packageFile.main = "dist/main.js";
fsExtra.writeJsonSync(pluginPath + "/package.json", packageFile, { spaces: 2 });

const wrapFileInFunction = (file, savePath) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(`Read ${file} failed: ${err}`);
            return;
        }

        const importStatements = [];
        const codeLines = [];

        data.split('\n').forEach((line) => {
            if (line.startsWith('const') && line.includes('require')) {
                importStatements.push(line);
            } else {
                codeLines.push(line);
            }
        });

        const wrappedFunction = [
            ...importStatements,
            'const f = (context) => {',
            ...codeLines,
            '};',
            'module.exports = f;',
        ].join('\n');

        fs.writeFile(path.resolve(savePath,file), wrappedFunction, 'utf8', (err) => {
            if (err) {
                console.error(`Write file failed: ${err}`);
            }
        });
    });
}
wrapFileInFunction('./main.js', pluginPath + "/dist");

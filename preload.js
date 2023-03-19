const {contextBridge, ipcRenderer} = require("electron");
const path = require("path");
const {spawn} = require("child_process");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {
    openFile: () => ipcRenderer.invoke("dialog:myOpenFile"),
    execFFmpeg: async (inputVideoPath) => {
        let ffmpeg = path.resolve(__dirname, "./ffmpeg.exe");
        let outputVideoPath = inputVideoPath.substring(0, inputVideoPath.lastIndexOf('.')) + ".mp4";
        if (fs.existsSync(outputVideoPath)) {
            fs.rmSync(outputVideoPath);
        }

        return new Promise((resolve, reject) => {
            let ffmpegProcess = spawn(ffmpeg, ['-i', inputVideoPath, outputVideoPath]);

            ffmpegProcess.stderr.on('data', (data) => {
                let output = data.toString();
                let durationMatch = output.match(/Duration: ([^,]*),/);
                let timeMatch = output.match(/time=(\d+):(\d+):([\d.]+)/);

                if (durationMatch && timeMatch) {
                    const parseTimeToSeconds = (timeStr) => {
                        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                        return hours * 3600 + minutes * 60 + seconds;
                    };

                    let duration = parseTimeToSeconds(durationMatch[1]);
                    let currentTime = parseTimeToSeconds(`${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`);
                    let percent = Math.floor(currentTime / duration * 100);
                    resolve(percent);
                }
            });

            ffmpegProcess.on('error', (err) => {
                reject(err);
            });

            ffmpegProcess.on('exit', (code) => {
                if (code === 0) {
                    resolve(100);
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });
        });
    },
});
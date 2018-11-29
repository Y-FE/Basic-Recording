const { exec } = require('child_process');

exports.getAudioInfo = async function (filePath) {
    return new Promise((resolve, reject) => {
        exec(`ffprobe ${filePath} -print_format json -show_format -loglevel error`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                return;
            }
            try {
                let info = JSON.parse(stdout);
                resolve(info.format);
            } catch (e) {
                reject(e);
            }
        });
    })
}
const AgoraRecordingSDK = require("../record/AgoraRecordSdk");
const path = require("path");
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const rimraf = require("rimraf");
const { upload } = require("./uploader");
const { push } = require("./pusher");
const { getAudioInfo } = require("./audioInfo");

class RecordManager {
    constructor() {
        this.recorders = {};
        //initialize output folder
        const output = path.resolve(__dirname, "./output");
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output);
        }
    }

    //find existing recorder
    find(sid) {
        return this.recorders[sid];
    }

    initStorage(appid, channel, sid) {
        return new Promise((resolve, reject) => {
            const storagePath = path.resolve(__dirname, `./output/${sid}`);
            fs.mkdir(storagePath, { recursive: true }, err => {
                if (err) {
                    throw err;
                }
                resolve(storagePath);
            });
        });
    }

    start(key, appid, channel, prevSid) {
        return new Promise((resolve, reject) => {
            if (prevSid) {
                // 对于重复发送的 start 请求
                let recorder = this.recorders[prevSid];
                if (recorder) {
                    console.log(`recorder already started ${prevSid}`);
                    return resolve(recorder);
                } else {
                    console.log(
                        `recorder exited on timeout ${prevSid}, starting new ......`
                    );
                }
            }

            const sid = uuidv4();
            this.initStorage(appid, channel, sid).then(storagePath => {
                let sdk = new AgoraRecordingSDK();

                let recorder = {
                    appid: appid,
                    channel: channel,
                    sdk: sdk,
                    sid: sid
                };

                sdk.joinChannel(key || null, channel, 0, appid, storagePath)
                    .then(() => {
                        this.subscribeEvents(recorder);
                        this.recorders[sid] = recorder;
                        console.log(
                            `recorder started ${appid} ${channel} ${sid}`
                        );
                        resolve(recorder);
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        });
    }
    startVideo(key, appid, channel, prevSid) {
        return new Promise((resolve, reject) => {
            if (prevSid) {
                // 对于重复发送的 start 请求
                let recorder = this.recorders[prevSid];
                if (recorder) {
                    console.log(`recorder already started ${prevSid}`);
                    return resolve(recorder);
                } else {
                    console.log(
                        `recorder exited on timeout ${prevSid}, starting new ......`
                    );
                }
            }

            const sid = uuidv4();
            this.initStorage(appid, channel, sid).then(storagePath => {
                let sdk = new AgoraRecordingSDK();

                let layout = {
                    canvasWidth: 1280,
                    canvasHeight: 720,
                    backgroundColor: "#000000",
                    regions: []
                };

                let recorder = {
                    appid: appid,
                    channel: channel,
                    sdk: sdk,
                    sid: sid,
                    layout
                };
                sdk.setMixLayout(layout);

                sdk.joinChannel(key || null, channel, 0, appid, storagePath)
                    .then(() => {
                        this.subscribeEvents(recorder);
                        this.recorders[sid] = recorder;
                        console.log(
                            `recorder started ${appid} ${channel} ${sid}`
                        );
                        resolve(recorder);
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        });
    }

    subscribeEvents(recorder) {
        let { sdk, sid, appid, channel } = recorder;
        sdk.on("leavechannel", async code => {});
        sdk.on("error", (err, stat) => {
            console.error(`sdk stopped due to err code: ${err} stat: ${stat}`);
            console.log(`stop recorder ${appid} ${channel} ${sid}`);
            if (code === 3) {
                console.log("leave channel with no user in, start upload");
                delete this.recorders[`${sid}`];
                try {
                    let recordPath = path.resolve(__dirname, `./output/${sid}`);
                    let files = await getAACFiles(recordPath);
                    for (let file of files) {
                        let fileStat = fs.statSync(file);
                        let url = await upload(channel, file);
                        let fileInfo = await getAudioInfo(file);
                        let timestamp = parseInt(fileStat.atimeMs);
                        await push(channel, timestamp, url, "none", fileInfo);
                        fs.unlink(file, err => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                        });
                    }
                    console.log(`${channel} record in ${sid} already pushed!`);
                    setTimeout(() => {
                        rimraf(recordPath, err => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                        });
                    }, 86400000);
                } catch (e) {
                    console.log(e);
                    console.log(`end record error: ${sid} ${channel}`);
                }
            }
            //clear recorder if error received
        });
        sdk.on("userleave", uid => {
            console.log(`user leave ${uid}`);
            // rearrange layout when user leaves

            let recorder = this.find(sid);

            if (!recorder) {
                console.error("no reocrder found");
                return;
            }
            if (!recorder.layout) {
                // no video, return;
                return;
            }
            if (uid !== 1 && uid !== 2 && uid !== 3) {
                // 1: screen, 2: camera
                return;
            }

            let { layout } = recorder;
            layout.regions = layout.regions.filter(region => {
                return region.uid !== uid;
            });
            sdk.setMixLayout(layout);
        });
        sdk.on("userjoin", uid => {
            //rearrange layout when new user joins
            let recorder = this.find(sid);

            if (!recorder) {
                console.error("no reocrder found");
                return;
            }

            if (!recorder.layout) {
                // no video, return;
                return;
            }
            if (uid !== 1 && uid !== 2 && uid !== 3) {
                // 1: screen, 2: camera
                return;
            }

            let { layout } = recorder;

            let region = {
                x: 0,
                y: 0,
                width: 320,
                height: 240,
                zOrder: 1,
                alpha: 1,
                uid: uid
            };
            if (uid === 1) {
                region.width = 960;
                region.height = 720;
            } else if (uid === 2) {
                region.x = 960;
                region.width = 320;
                region.height = 180;
            } else if (uid === 3) {
                region.x = 960;
                region.y = -241;
                region.width = 320;
                region.height = 1068;
            }
            layout.regions.push(region);
            sdk.setMixLayout(layout);
        });
    }

    stop(sid) {
        let recorder = this.recorders[sid];
        if (recorder) {
            let { sdk, appid, channel } = recorder;
            sdk.leaveChannel();
            console.log(`stop recorder ${appid} ${channel} ${sid}`);
            delete this.recorders[`${sid}`];
        } else {
            throw new Error("recorder not exists");
        }
    }
}

function getAACFiles(recordPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(recordPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(
                files
                    .filter(
                        file =>
                            path.extname(file) === ".aac" ||
                            path.extname(file) === ".mp4"
                    )
                    .map(file => path.join(recordPath, file))
            );
        });
    });
}

module.exports = new RecordManager();

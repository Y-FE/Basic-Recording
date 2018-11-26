const AgoraRecordingSDK = require("../record/AgoraRecordSdk");
const path = require("path");
const fs = require("fs");
const uuidv4 = require('uuid/v4');
const { upload } = require('./uploader');

class RecordManager{
    constructor() {
        this.recorders = {};
        //initialize output folder
        const output = path.resolve(__dirname, "./output");
        if (!fs.existsSync(output)){
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
            fs.mkdir(storagePath, {recursive: true}, err => {
                if(err){
                    throw err;
                }
                resolve(storagePath);
            });
        })
    }

    start(key, appid, channel, prevSid) {
        return new Promise((resolve, reject) => {
            if (prevSid) {
                // 对于重复发送的 start 请求
                let recorder = this.recorders[sid];
                if (recorder) {
                    console.log(`recorder already started ${sid}`);
                    return resolve(recorder);
                } else {
                    console.log(`recorder exited on timeout ${sid}, starting new ......`);
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

                sdk.joinChannel(key || null, channel, 0, appid, storagePath).then(() => {
                    this.subscribeEvents(recorder);
                    this.recorders[sid] = recorder;
                    console.log(`recorder started ${appid} ${channel} ${sid}`)
                    resolve(recorder);
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    subscribeEvents(recorder) {
        let { sdk, sid, appid, channel } = recorder;
        sdk.on('leavechannel', (code) => {
            // TODO: upload record
            let recordPath = path.resolve(__dirname, `./output/${sid}`);
            upload(channel, recordPath);
        })
        sdk.on("error", (err, stat) => {
            console.error(`sdk stopped due to err code: ${err} stat: ${stat}`);
            console.log(`stop recorder ${appid} ${channel} ${sid}`)
            //clear recorder if error received
            delete this.recorders[`${sid}`];
        });
        sdk.on("userleave", (uid) => {
            console.log(`user leave ${uid}`);
            //rearrange layout when user leaves
        });
        sdk.on("userjoin", (uid) => {
            //rearrange layout when new user joins
        });
    }

    stop(sid) {
        let recorder = this.recorders[sid];
        if(recorder) {
            let {sdk, appid, channel} = recorder;
            sdk.leaveChannel();
            console.log(`stop recorder ${appid} ${channel} ${sid}`)
            delete this.recorders[`${sid}`];
        } else {
            throw new Error('recorder not exists');
        }
    }
}



module.exports = new RecordManager();
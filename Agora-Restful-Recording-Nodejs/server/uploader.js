const OSS = require('ali-oss');
const config = require('./config');

const client = new OSS(config.oss);

exports.upload =  async function upload(channel, filePath) {
    console.log(filePath)
    // await client.put(`/audio/${channel}/${Date.now()}.PCM`, filePath);
}
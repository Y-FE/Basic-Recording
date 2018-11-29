const OSS = require('ali-oss');
const config = require('./config');
const path = require('path');

const isMobileTest = process.env.NODE_TEST === '2';

const client = new OSS(config.oss);

exports.upload =  async function upload(channel, filePath) {
    let ossPath = `${isMobileTest ? '/dev' : ''}/audio/${channel}/${path.basename(filePath)}`;
    await client.put(ossPath, filePath);
    return `http://cdn-2.yi-you.org${ossPath}`;
}
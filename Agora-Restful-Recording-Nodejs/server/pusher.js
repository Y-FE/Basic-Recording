const axios = require('axios');
const config = require('./config');

exports.push = async function push(channel, timestamp, url, originUrl, formatInfo) {
    const postData = {
        key: channel,
        bit_rate: formatInfo.bitRate,
        duration: formatInfo.duration,
        size: formatInfo.size,
        start_time: formatInfo.startTime || 0,
        timestamp,
        url,
        origin_url: origin_url
    }
    return axios.post(config.pushUrl, postData);
}
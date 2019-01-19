const axios = require('axios');
const config = require('./config');

const isMobileTest = process.env.NODE_TEST === '2';

exports.push = async function push(channel, timestamp, url, originUrl, formatInfo) {
    const postData = {
        key: channel,
        bit_rate: formatInfo.bit_rate,
        duration: formatInfo.duration,
        size: formatInfo.size,
        start_time: formatInfo.startTime || 0,
        timestamp,
        url,
        origin_url: originUrl
    }
    return axios.post(isMobileTest ? "http://mobile-test.yi-you.org/api/live-class/set-video" : config.pushUrl, postData);
}
const express = require('express')
const app = express()
const port = 9640
const RecordManager = require('./recordManager')
const bodyParser = require('body-parser')
const { getToken } = require('./accessToken');

const config = require('./config');

app.use(bodyParser.json());

app.post('/recorder/v1/start', (req, res, next) => {
    let { body } = req;
    let { channel, sid } = body;
    let appid = config.appid;
    let key = getToken(channel);
    if (!appid) {
        throw new Error("appid is mandatory");
    }
    if (!channel) {
        throw new Error("channel is mandatory");
    }

    RecordManager.start(key, appid, channel, sid).then(recorder => {
        //start recorder success
        res.status(200).json({
            success: true,
            sid: recorder.sid
        });
    }).catch((e) => {
        //start recorder failed
        next(e);
    });
})

app.post('/recorder/v1/stop', (req, res, next) => {
    let { body } = req;
    let { sid } = body;
    if (!sid) {
        throw new Error("sid is mandatory");
    }

    RecordManager.stop(sid);
    res.status(200).json({
        success: true
    });
})

app.head('/health_check', (req, res, next) => {
    res.status(200).send('ok');
})
app.get('/health_check', (req, res, next) => {
    res.status(200).send('ok');
})

app.use( (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        err: err.message || 'generic error'
    })
})

app.listen(port)
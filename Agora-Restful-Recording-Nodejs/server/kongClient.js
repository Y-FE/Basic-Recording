"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const querystring = __importStar(require("querystring"));
const crypto_1 = require("crypto");
class KongClient {
    constructor(host, port, username, secret) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.secret = secret;
    }
    async post(path, data) {
        const formData = querystring.stringify(data);
        const date = new Date().toUTCString();
        const request = http.request({
            host: this.host,
            port: this.port,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': formData.length,
                Date: date,
                Authorization: this.auth(this.generateSignature(date, 'POST', path))
            }
        });
        request.end(formData);
        return new Promise((resolve, reject) => {
            request.on('error', err => {
                reject(err);
            });
            request.once('response', async (res) => {
                try {
                    const body = await this.readBody(res);
                    const parsed = JSON.parse(body);
                    if (res.statusCode !== 200) {
                        reject(new KongError(res.statusCode, parsed.message));
                    }
                    else {
                        resolve(parsed);
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    async readBody(res) {
        return new Promise((resolve, reject) => {
            let body = '';
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body.toString());
            });
            res.on('error', err => {
                reject(err);
            });
        });
    }
    auth(signature) {
        return `hmac username="${this.username}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`;
    }
    generateSignature(date, method, path) {
        const signingString = `date: ${date}\n${method} ${path} HTTP/1.1`;
        return crypto_1.createHmac('sha256', this.secret)
            .update(signingString)
            .digest('base64');
    }
}
exports.default = KongClient;
class KongError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

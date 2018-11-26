var AccessToken = require('./token/AccessToken').AccessToken;
var Priviledges = require('./token/AccessToken').priviledges;
const config = require('./config');
var appID  = config.appid;
var appCertificate     = config.appCertificate;
var uid = 0;
var expireTimestamp = 0;

exports.getToken = function getToken(channel) {
    var key = new AccessToken(appID, appCertificate, channel, uid);
    key.addPriviledge(Priviledges.kJoinChannel, expireTimestamp);

    var token = key.build();
    return token;
}

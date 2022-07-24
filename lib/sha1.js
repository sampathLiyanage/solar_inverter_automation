const crypto = require('crypto');

const sha1 = (text) => {
    const shasum = crypto.createHash('sha1');
    shasum.update(text);
    return shasum.digest('hex');
}

module.exports = sha1;
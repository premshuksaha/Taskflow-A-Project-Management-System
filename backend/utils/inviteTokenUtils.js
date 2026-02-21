const crypto = require('crypto');

const generateInviteToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const calculateExpirationDate = (daysFromNow = 7) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);
    return expirationDate;
};

module.exports = { generateInviteToken, calculateExpirationDate };

const speakeasy = require("speakeasy");

exports.verifyOtp = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 1
    });
};

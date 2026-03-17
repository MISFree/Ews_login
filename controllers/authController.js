const { sql, dbConfig } = require("../config/db");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { verifyOtp } = require("../services/otpService");

exports.login = async (req, res) => {
    const { username, otp } = req.body;

    if (!username || !otp) {
        return res.status(400).json({ message: "Username and OTP required" });
    }

    try {
        await sql.connect(dbConfig);

        const result = await sql.query`
            SELECT ID, UserName, Mail_ID, Totp_Secret
            FROM Risk_ews_Login_user_info
            WHERE UserName = ${username}
              AND Status = 'A'
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid user" });
        }

        const user = result.recordset[0];

        const validOtp = verifyOtp(user.Totp_Secret, otp);
        if (!validOtp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        const token = jwt.sign(
            {
                id: user.ID,
                username: user.UserName,
                mail: user.Mail_ID
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.json({
            message: "Login successful",
            token,
            redirectUrl: "http://172.16.3.200:5806/Mobile_CMD/Ews_Index.jsp#"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

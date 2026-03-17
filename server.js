 /************************************************
 * Risk EWS – Email OTP Login (Single File)
 ************************************************/

const express = require("express");
const sql = require("mssql");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
// Serve all files in 'public' folder statically
app.use(express.static(path.join(__dirname, "public")));
/* ================= BASIC CONFIG ================= */

const PORT = 3004;

/* ================= LOGO PATH ================= */

const logoPath =
  "C:/Users/Risk_Rajesh/EWS_Concentration/image/images.png";

/* ================= SMTP CONFIG ================= */

const smtpUser = "riskalerts@ampl.net.in";
const smtpPass = "lvcfmxcfbwogtugq";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  tls: { rejectUnauthorized: false }
});

/* ================= DB CONFIG ================= */

const dbConfig = {
  user: "My_Login",
  password: "Ampl@12345",
  server: "172.16.3.200",
  database: "Risk_EWS",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

/* ================= LOGIN PAGE ================= */

 app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Risk EWS Login</title>

  <style>
    * {
      box-sizing: border-box;
      font-family: "Segoe UI", Arial, sans-serif;
    }

    body {
      margin: 0;
      height: 100vh;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-container {
      width: 380px;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .login-header {
      background: #002060;
      padding: 18px;
      color: #ffffff;
      text-align: center;
    }

    .login-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .login-body {
      padding: 25px;
    }

    label {
      font-size: 13px;
      color: #333;
      font-weight: 600;
    }

    input[type="text"] {
      width: 100%;
      padding: 10px;
      margin-top: 6px;
      border: 1px solid #ccd6e0;
      border-radius: 6px;
      font-size: 14px;
      transition: 0.2s ease;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #002060;
      box-shadow: 0 0 0 2px rgba(0, 32, 96, 0.15);
    }

    .btn-login {
      margin-top: 18px;
      width: 100%;
      padding: 12px;
      background: #002060;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s ease;
    }

    .btn-login:hover {
      background: #003399;
    }

    .footer-text {
      text-align: center;
      font-size: 11px;
      color: #777;
      margin-top: 18px;
    }

  </style>
</head>

<body>

  <div class="login-container">
    <div class="login-header">
      <h2>Risk EWS Secure Login</h2>
    </div>

    <div class="login-body">
	 <img src="/Mobile_CMD/Images/newlogo.gif" alt="Company Logo" style="height: 80px;">
      <form method="POST" action="/send-otp">
        <label>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-bounding-box" viewBox="0 0 16 16">
  <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
</svg>
  

        <input type="text" name="username" required placeholder="Enter your user name"/>
</label>
        <button class="btn-login" type="submit">
          Send OTP
        </button>
      </form>

      <div class="footer-text">
        © 2025 Risk Analytics Platform
      </div>
    </div>
  </div>

</body>
</html>
  `);
});


/* ================= SEND OTP ================= */

app.post("/send-otp", async (req, res) => {
  const username = req.body.username?.trim();
  if (!username) return res.send("❌ Username required");

  try {
    await sql.connect(dbConfig);

    const result = await sql.query`
      SELECT Mail_ID
      FROM Risk_ews_Login_user_info
      WHERE UserName = ${username}
        AND Status = 'A'
    `;

    if (result.recordset.length === 0) {
      return res.send("❌ Invalid user");
    }

    const email = result.recordset[0].Mail_ID;

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await sql.query`
      UPDATE Risk_ews_Login_user_info
      SET OTP_Code = ${otp},
          OTP_Expiry = ${expiry}
      WHERE UserName = ${username}
    `;
       await sql.query`
      INSERT INTO Risk_ews_UserLogin_OTP_Log (Username, Mail_ID, OTP, Generated_At)
      VALUES (${username}, ${email}, ${otp}, GETDATE())
    `;
    /* ========== SEND CORPORATE EMAIL ========== */

    await transporter.sendMail({
      from: `"Risk EWS – Security Team" <${smtpUser}>`,
      to: email,
      subject: "Risk EWS | One-Time Password (OTP)",
      html: `
        <div style="font-family:Arial;background:#f4f6f8;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:6px;overflow:hidden;">
            
            <div style="background:#002060;padding:15px;text-align:center;">
              <img src="cid:ewslogo" style="height:60px;" />
            </div>

            <div style="padding:20px;color:#333;">
              <h3>Risk EWS Login Verification</h3>
              <p>Dear User,</p>
              <p>Please use the following One-Time Password (OTP) to complete your login:</p>

              <div style="text-align:center;margin:30px 0;">
                <span style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#002060;">
                  ${otp}
                </span>
              </div>

              <p>This OTP is valid for <b>5 minutes</b>.</p>
              <p>If you did not request this login, please contact the Risk EWS team immediately.</p>

              <br/>
              <p>Regards,<br/>
              <b>Risk EWS Security Team</b></p>
            </div>

            <div style="background:#f0f0f0;padding:10px;text-align:center;font-size:12px;color:#666;">
              © ${new Date().getFullYear()} Risk EWS | Confidential
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(logoPath),
          path: logoPath,
          cid: "ewslogo"
        }
      ]
    });

 res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Verify OTP | Risk EWS</title>

  <style>
    * {
      box-sizing: border-box;
      font-family: "Segoe UI", Arial, sans-serif;
    }

    body {
      margin: 0;
      height: 100vh;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .otp-container {
      width: 380px;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .otp-header {
      background: #002060;
      padding: 18px;
      color: #ffffff;
      text-align: center;
    }

    .otp-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .otp-body {
      padding: 25px;
      text-align: center;
    }

    .otp-body p {
      font-size: 14px;
      color: #444;
      margin-bottom: 18px;
    }

    label {
      display: block;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    }

    input[type="text"] {
      width: 100%;
      padding: 12px;
      border: 1px solid #ccd6e0;
      border-radius: 6px;
      font-size: 18px;
      text-align: center;
      letter-spacing: 4px;
      font-weight: 600;
      transition: 0.2s ease;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #002060;
      box-shadow: 0 0 0 2px rgba(0, 32, 96, 0.15);
    }

    .btn-verify {
      margin-top: 20px;
      width: 100%;
      padding: 12px;
      background: #002060;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s ease;
    }

    .btn-verify:hover {
      background: #003399;
    }

    .footer-text {
      margin-top: 18px;
      font-size: 11px;
      color: #777;
    }

  </style>
</head>

<body>

  <div class="otp-container"> 
  
    <div class="otp-header">
      <h2>OTP Verification</h2>
    </div>

    <div class="otp-body"> 
	 <img src="/Mobile_CMD/Images/newlogo.gif" alt="Company Logo" style="height: 80px;">
	 
      <p>OTP has been sent to your registered email</p>

      <form method="POST" action="/verify-otp">
        <input type="hidden" name="username" value="${username}" />

        <label>Enter 6-Digit OTP</label>
        <input type="text" name="otp" maxlength="6" required />

        <button class="btn-verify" type="submit">
          Verify OTP
        </button>
      </form>

      <div class="footer-text">
        © 2025 Risk Analytics Platform
      </div>
    </div>
  </div>

</body>
</html>
`);


  } catch (err) {
    console.error(err);
    res.send("❌ Error sending OTP");
  }
});

/* ================= VERIFY OTP ================= */

app.post("/verify-otp", async (req, res) => {
  const { username, otp } = req.body;

  try {
    await sql.connect(dbConfig);

    const result = await sql.query`
      SELECT OTP_Code, OTP_Expiry
      FROM Risk_ews_Login_user_info
      WHERE UserName = ${username}
        AND Status = 'A'
    `;

    if (result.recordset.length === 0) {
      return res.send("❌ Invalid request");
    }

    const record = result.recordset[0];

    if (
      record.OTP_Code !== otp ||
      new Date(record.OTP_Expiry) < new Date()
    ) {
      return res.send("❌ Invalid OTP try with new otp");
    }

    await sql.query`
      UPDATE Risk_ews_Login_user_info
      SET OTP_Code = NULL,
          OTP_Expiry = NULL
      WHERE UserName = ${username}
    `;

   res.redirect(
  "http://172.16.3.200:5806/Mobile_CMD/LoginBridge.jsp?user=" +
  encodeURIComponent(username)
);


  } catch (err) {
    console.error(err);
    res.send("❌ OTP verification failed");
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log("✅ Risk EWS OTP Server Started");
  console.log(`👉 http://172.16.3.200:${PORT}/`);
});

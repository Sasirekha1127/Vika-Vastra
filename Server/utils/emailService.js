const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const sendOtpEmail = async (toEmail, otp, purpose = 'Password Reset') => {
  const safePurpose = escapeHtml(purpose);
  await transporter.sendMail({
    from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${purpose} OTP - Vika Vasthra`,
    text: `Your ${purpose.toLowerCase()} verification code is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
    html: `
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">Your Vika Vasthra verification code is ${escapeHtml(otp)}.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F6F2;margin:0;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;color:#4A4A4A">
        <tr><td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;background:#FFFFFF;border:1px solid #E7DFD2;border-radius:12px;overflow:hidden">
            <tr><td style="background:#1A1040;padding:24px 30px">
              <div style="font-size:22px;font-weight:700;letter-spacing:1px;color:#FFFFFF">VIKA VASTHRA</div>
              <div style="margin-top:5px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E8D8B8">Where tradition meets elegance</div>
            </td></tr>
            <tr><td style="height:4px;background:#C9933A;font-size:0;line-height:0">&nbsp;</td></tr>
            <tr><td style="padding:32px">
              <h1 style="margin:0 0 14px;color:#1A1040;font-size:22px">${safePurpose} verification</h1>
              <p style="margin:0 0 22px;font-size:14px;line-height:1.65">Use this one-time code to continue. It is valid for <strong style="color:#1A1040">10 minutes</strong>.</p>
              <div style="background:#F8F6F2;border:1px solid #E7DFD2;border-top:3px solid #C9933A;border-radius:8px;padding:24px 16px;text-align:center;margin-bottom:22px">
                <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9933A">Your verification code</div>
                <div style="margin-top:12px;font-size:38px;line-height:1.2;font-weight:700;letter-spacing:10px;color:#1A1040">${escapeHtml(otp)}</div>
              </div>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#77736D">For your security, do not share this code with anyone. Vika Vasthra will never ask you to tell us your OTP.</p>
            </td></tr>
            <tr><td style="background:#F8F6F2;border-top:1px solid #E7DFD2;padding:18px 30px;text-align:center;color:#77736D;font-size:12px">© ${new Date().getFullYear()} Vika Vasthra. All rights reserved.</td></tr>
          </table>
        </td></tr>
      </table>
    `,
  });
};

module.exports = { sendOtpEmail };

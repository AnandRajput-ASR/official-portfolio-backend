const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/sanitize');
const env = require('../configs/env.config');

// ─── Lazy-create transporter so missing config doesn't crash the server ────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'xxxx-xxxx-xxxx-xxxx') {
    console.warn('[EMAIL] Gmail credentials not configured — email notifications disabled.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return _transporter;
}

// ─── Send notification when a contact form message arrives ────────────────────
async function sendContactNotification(message) {
  const transporter = getTransporter();
  if (!transporter) return;

  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0d0d0d; color: #f0ede8; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; }
        .header { background: #f5a623; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; color: #0d0d0d; letter-spacing: -0.5px; }
        .header p  { margin: 4px 0 0; font-size: 13px; color: rgba(0,0,0,0.6); }
        .body { background: #141414; padding: 32px; border: 1px solid #252525; border-top: none; }
        .field { margin-bottom: 20px; }
        .label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #7a7570; margin-bottom: 6px; }
        .value { font-size: 15px; color: #f0ede8; line-height: 1.6; }
        .message-box { background: #1a1a1a; border: 1px solid #252525; border-left: 3px solid #f5a623; padding: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
        .cta { margin-top: 28px; }
        .cta a { display: inline-block; background: #f5a623; color: #0d0d0d; text-decoration: none; padding: 12px 24px; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
        .footer { padding: 16px 32px; font-size: 11px; color: #7a7570; text-align: center; letter-spacing: 1px; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>📬 New Portfolio Message</h1>
          <p>Someone reached out via your portfolio contact form</p>
        </div>
        <div class="body">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${escapeHtml(message.name)}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${encodeURI(message.email)}" style="color:#f5a623;">${escapeHtml(message.email)}</a></div>
          </div>
          <div class="field">
            <div class="label">Received</div>
            <div class="value">${new Date(message.receivedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${escapeHtml(message.message)}</div>
          </div>
          <div class="cta">
            <a href="mailto:${encodeURI(message.email)}?subject=Re: Your message on my portfolio">Reply Now →</a>
          </div>
        </div>
        <div class="footer">anandraj.asr@gmail.com · Anand Rajput Portfolio</div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.GMAIL_USER}>`,
      to,
      subject: `📬 New message from ${message.name} — Portfolio`,
      html,
      text: `New portfolio message\n\nFrom: ${message.name}\nEmail: ${message.email}\nMessage:\n${message.message}`,
    });
    console.log(`[EMAIL] Notification sent to ${to} for message from ${message.name}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send notification:', err.message);
    throw err;
  }
}

// ─── Send password reset email ────────────────────────────────────────────────
async function sendResetEmail(toEmail, resetToken) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[EMAIL] Reset email not sent — Gmail not configured.');
    return;
  }

  const resetUrl =
    env.siteUrl +
    '/' +
    env.adminSecretSlug +
    '?reset=' +
    resetToken;

  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#f0ede8;margin:0;padding:0;}
      .wrapper{max-width:520px;margin:40px auto;}
      .header{background:#f5a623;padding:24px 32px;}
      .header h1{margin:0;font-size:20px;color:#0d0d0d;}
      .body{background:#141414;padding:32px;border:1px solid #252525;border-top:none;}
      p{font-size:14px;line-height:1.7;color:#f0ede8;}
      .cta a{display:inline-block;background:#f5a623;color:#0d0d0d;text-decoration:none;
             padding:14px 28px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;}
      .note{font-size:12px;color:#7a7570;margin-top:1.5rem;}
      .footer{padding:16px;font-size:11px;color:#7a7570;text-align:center;}
    </style></head><body>
    <div class="wrapper">
      <div class="header"><h1>🔐 Password Reset Request</h1></div>
      <div class="body">
        <p>Someone requested a password reset for your portfolio admin account.</p>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div class="cta" style="margin:2rem 0;">
          <a href="${resetUrl}">Reset My Password →</a>
        </div>
        <p class="note">If you didn't request this, ignore this email — your password won't change.</p>
      </div>
      <div class="footer">anandraj.asr@gmail.com · Anand Rajput Portfolio</div>
    </div></body></html>`;

  await transporter.sendMail({
    from: `"Portfolio Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Password Reset — Portfolio Admin',
    html,
    text: `Password reset requested.\n\nReset link (expires in 1 hour):\n${resetUrl}\n\nIgnore this if you didn't request it.`,
  });
  console.log(`[EMAIL] Reset email sent to ${toEmail}`);
}

// ─── Send notification when a public testimonial is submitted ────────────────
async function sendTestimonialNotification(t) {
  const transporter = getTransporter();
  if (!transporter) return;
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#f0ede8;margin:0;padding:0;}
      .wrapper{max-width:560px;margin:40px auto;}
      .header{background:#f5a623;padding:24px 32px;}
      .header h1{margin:0;font-size:22px;color:#0d0d0d;}
      .header p{margin:4px 0 0;font-size:13px;color:rgba(0,0,0,0.6);}
      .body{background:#141414;padding:32px;border:1px solid #252525;border-top:none;}
      .field{margin-bottom:20px;}
      .label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a7570;margin-bottom:6px;}
      .value{font-size:15px;color:#f0ede8;line-height:1.6;}
      .quote-box{background:#1a1a1a;border:1px solid #252525;border-left:3px solid #f5a623;padding:16px;font-size:14px;font-style:italic;line-height:1.7;}
      .footer{padding:16px 32px;font-size:11px;color:#7a7570;text-align:center;letter-spacing:1px;text-transform:uppercase;}
    </style></head><body>
    <div class="wrapper">
      <div class="header"><h1>⭐ New Testimonial Submitted</h1><p>Review and approve in the admin dashboard</p></div>
      <div class="body">
        <div class="field"><div class="label">From</div><div class="value">${escapeHtml(t.name)} — ${escapeHtml(t.role || '')}${t.company ? ' @ ' + escapeHtml(t.company) : ''}</div></div>
        ${t.email ? `<div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${encodeURI(t.email)}" style="color:#f5a623;">${escapeHtml(t.email)}</a></div></div>` : ''}
        <div class="field"><div class="label">Rating</div><div class="value">${'★'.repeat(t.rating || 5)}</div></div>
        <div class="field"><div class="label">Testimonial</div><div class="quote-box">${escapeHtml(t.quote)}</div></div>
      </div>
      <div class="footer">anandraj.asr@gmail.com · Anand Rajput Portfolio</div>
    </div></body></html>`;
  try {
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.GMAIL_USER}>`,
      to,
      subject: `⭐ New testimonial from ${t.name} — needs your review`,
      html,
      text: `New testimonial from ${t.name}\nEmail: ${t.email}\nRating: ${t.rating}/5\n\n"${t.quote}"`,
    });
    console.log(`[EMAIL] Testimonial notification sent for ${t.name}`);
  } catch (err) {
    console.error('[EMAIL] Testimonial notification failed:', err.message);
  }
}

// ─── Send notification when someone downloads the resume ─────────────────────
async function sendResumeLeadNotification(lead) {
  const transporter = getTransporter();
  if (!transporter) return;
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
  const when = new Date(lead.downloadedAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short',
  });
  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#f0ede8;margin:0;padding:0;}
      .wrapper{max-width:520px;margin:40px auto;}
      .header{background:#f5a623;padding:24px 32px;}
      .header h1{margin:0;font-size:20px;color:#0d0d0d;}
      .body{background:#141414;padding:32px;border:1px solid #252525;border-top:none;}
      .field{margin-bottom:18px;}
      .label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a7570;margin-bottom:5px;}
      .value{font-size:15px;color:#f0ede8;}
      .cta{margin-top:1.5rem;}
      .cta a{display:inline-block;background:#f5a623;color:#0d0d0d;text-decoration:none;
             padding:12px 24px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;}
      .footer{padding:16px;font-size:11px;color:#7a7570;text-align:center;}
    </style></head><body>
    <div class="wrapper">
      <div class="header"><h1>📄 Resume Downloaded</h1></div>
      <div class="body">
        <div class="field">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${encodeURI(lead.email)}" style="color:#f5a623;">${escapeHtml(lead.email)}</a></div>
        </div>
        <div class="field"><div class="label">When</div><div class="value">${when}</div></div>
        ${lead.ipAddress ? `<div class="field"><div class="label">IP</div><div class="value">${escapeHtml(lead.ipAddress)}</div></div>` : ''}
        <div class="cta">
          <a href="mailto:${encodeURI(lead.email)}?subject=Following up — saw you downloaded my resume">Follow Up →</a>
        </div>
      </div>
      <div class="footer">anandraj.asr@gmail.com · Anand Rajput Portfolio</div>
    </div></body></html>`;
  try {
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.GMAIL_USER}>`,
      to,
      subject: `📄 Resume downloaded by ${lead.email}`,
      html,
      text: `Resume downloaded\n\nEmail: ${lead.email}\nWhen: ${when}${lead.ipAddress ? '\nIP: ' + lead.ipAddress : ''}`,
    });
    console.log(`[EMAIL] Resume lead notification sent for ${lead.email}`);
  } catch (err) {
    console.error('[EMAIL] Resume lead notification failed:', err.message);
  }
}

module.exports = { sendContactNotification, sendResetEmail, sendTestimonialNotification, sendResumeLeadNotification };

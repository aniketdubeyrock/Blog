
const emailStyles = `
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
        color: #333333;
    }
    .content {
        padding: 20px 0;
        line-height: 1.6;
        color: #555555;
    }
    .button {
        display: block;
        width: 200px;
        margin: 20px auto;
        padding: 10px 0;
        background-color: #007bff;
        color: #ffffff;
        text-align: center;
        text-decoration: none;
        border-radius: 5px;
    }
    .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
        font-size: 12px;
        color: #999999;
    }
`;

exports.getVerificationEmailTemplate = ({ username, url }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>MERN Blog API</h1>
            </div>
            <div class="content">
                <p>Hi ${username},</p>
                <p>Welcome to MERN Blog! We're excited to have you on board. Please verify your email address to complete your registration.</p>
                <a href="${url}" class="button" style="color: #ffffff;">Verify Your Email</a>
                <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
                <p><a href="${url}">${url}</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p>Thanks,<br>The MERN Blog Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MERN Blog. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

exports.getPasswordResetEmailTemplate = ({ username, url }) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>${emailStyles}</style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>MERN Blog API</h1>
              </div>
              <div class="content">
                  <p>Hi ${username},</p>
                  <p>You recently requested to reset your password for your MERN Blog account. Click the button below to reset it.</p>
                  <a href="${url}" class="button" style="color: #ffffff;">Reset Your Password</a>
                  <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
                  <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
                  <p><a href="${url}">${url}</a></p>
                  <p>This password reset link is only valid for the next 10 minutes.</p>
                  <p>Thanks,<br>The MERN Blog Team</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} MERN Blog. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
};

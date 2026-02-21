const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInviteEmail = async (email, inviteLink, invitedByName, workspaceName) => {
    try {
        const response = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
            to: email,
            subject: `${invitedByName} invited you to join ${workspaceName}`,
            html: generateInviteTemplate(email, inviteLink, invitedByName, workspaceName)
        });
        return response;
    } catch (error) {
        console.error('Error sending invite email:', error);
        throw new Error('Failed to send invite email');
    }
};

const generateInviteTemplate = (email, inviteLink, invitedByName, workspaceName) => {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
                .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .header { color: #1f2937; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .content { color: #6b7280; margin: 20px 0; }
                .btn { display: inline-block; padding: 12px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                .footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                .warning { color: #f59e0b; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">You're invited to ${workspaceName}!</div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p><strong>${invitedByName}</strong> has invited you to join <strong>${workspaceName}</strong>.</p>
                        <p>Click the button below to accept the invitation and get started:</p>
                        <a href="${inviteLink}" class="btn">Accept Invitation</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
                            ${inviteLink}
                        </p>
                        <p class="warning">⚠️ This invitation link will expire in 7 days.</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                    </div>
                </div>
            </div>
        </body>
    </html>
    `;
};

module.exports = { sendInviteEmail };

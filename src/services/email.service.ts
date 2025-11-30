import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  private from: string

  constructor() {
    this.from = process.env.EMAIL_FROM || 'onboarding@resend.dev'
  }

  async sendVerificationEmail(to: string, token: string, name: string) {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`

    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: to,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                  display: inline-block; 
                  padding: 12px 24px; 
                  background-color: #007bff; 
                  color: #ffffff; 
                  text-decoration: none; 
                  border-radius: 4px; 
                  margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Hi ${name},</h2>
                <p>Thank you for registering! Please verify your email address to activate your account.</p>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <div class="footer">
                  <p>If you didn't create an account, please ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      })

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log(`✅ Email sent to ${to}`)
      return data
    } catch (error: any) {
      console.error('Email send error:', error)
      throw new Error('Failed to send verification email')
    }
  }

  async sendPasswordResetEmail(to: string, token: string, name: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: to,
        subject: 'Reset Your Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                  display: inline-block; 
                  padding: 12px 24px; 
                  background-color: #dc3545; 
                  color: #ffffff; 
                  text-decoration: none; 
                  border-radius: 4px; 
                  margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Hi ${name},</h2>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
                <p>This link will expire in 1 hour.</p>
                <div class="footer">
                  <p>If you didn't request a password reset, please ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      })

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log(`✅ Email sent to ${to}`)
      return data
    } catch (error: any) {
      console.error('Email send error:', error)
      throw new Error('Failed to send password reset email')
    }
  }
}
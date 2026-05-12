import nodemailer from 'nodemailer';
import { EmailAdapter } from '@custom-auth/core';

export interface NodemailerConfig {
  transporter?: nodemailer.Transporter;
  smtpOptions?: any;
  fromAddress: string;
}

export class NodemailerAdapter implements EmailAdapter {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor(config: NodemailerConfig) {
    if (config.transporter) {
      this.transporter = config.transporter;
    } else if (config.smtpOptions) {
      this.transporter = nodemailer.createTransport(config.smtpOptions);
    } else {
      throw new Error('You must provide either a transporter or smtpOptions');
    }
    this.fromAddress = config.fromAddress;
  }

  async sendVerificationEmail(email: string, token: string, url: string): Promise<void> {
    const fullUrl = `${url}?token=${token}`;
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Verify your email address',
      text: `Please verify your email address by clicking on the following link: ${fullUrl}`,
      html: `<p>Please verify your email address by clicking on the following link: <a href="${fullUrl}">${fullUrl}</a></p>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, url: string): Promise<void> {
    const fullUrl = `${url}?token=${token}`;
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Reset your password',
      text: `Reset your password by clicking on the following link: ${fullUrl}`,
      html: `<p>Reset your password by clicking on the following link: <a href="${fullUrl}">${fullUrl}</a></p>`,
    });
  }

  async sendMagicLinkEmail(email: string, token: string, url: string): Promise<void> {
    const fullUrl = `${url}?token=${token}`;
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Your Magic Link',
      text: `Click the following link to sign in: ${fullUrl}`,
      html: `<p>Click the following link to sign in: <a href="${fullUrl}">${fullUrl}</a></p>`,
    });
  }
}

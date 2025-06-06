import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from 'src/config';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';



interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;

}

const log: Logger = config.createLogger('mailOptions');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {

  public async sendEmail(receiver: string, subject: string, body: string): Promise<void> {
    if(config.NODE_ENV === 'development' || config.NODE_ENV === 'test')
    {
      this.developementEmailSender(receiver,subject,body);
    } else {
      this.productionEmailSender(receiver,subject,body);
    }
  }

  private async developementEmailSender(receiver: string ,subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false , //tacno samo za 465 port
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      }
    });
    const mailOptions: IMailOptions = {
      from : `Chatty App <${config.SENDER_EMAIL}>`,
      to: receiver,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development email sent succesfully.');
    } catch (error) {
      log.error('Error sending email ',error);
      throw new BadRequestError('Error sending email.');
    }
  }



  private async productionEmailSender(receiver: string ,subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from : `Chatty App <${config.SENDER_EMAIL}>`,
      to: receiver,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent succesfully.');
    } catch (error) {
      log.error('Error sending email ',error);
      throw new BadRequestError('Error sending email.');
    }
  }
}
export const mailTransport: MailTransport = new MailTransport();

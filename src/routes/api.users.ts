import * as Express from "express";
import * as Winston from "winston";
import { IUser } from '../database/model.users';
import * as nodemailer from "nodemailer";
import { IResponse } from './rest-handler';

interface IRequest extends Express.Request {
    doc: IUser
}



module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {


    if (process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST) {

        // feedback
        log.debug("Use fake nodemailer smtp server");
        //let waiting = true;

        //@ts-ignore
        nodemailer.createTestAccount((
            err: Error,
            account: nodemailer.Transport
        ) => {

            if (err) {
                //@ts-ignore
                log.warn(err, "Could not create Test credentials from ethernal.mail");
                return
            }

            //@ts-ignore
            process.env.SMTP_HOST = account.smtp.host;
            //@ts-ignore
            process.env.SMTP_PORT = account.smtp.port;
            //@ts-ignore
            process.env.SMTP_SECURE = account.smtp.secure;
            //@ts-ignore
            process.env.SMTP_AUTH_USER = account.user;
            //@ts-ignore
            process.env.SMTP_AUTH_PASS = account.pass;

            log.debug("Credentials received!");
            //waiting = false;

        });

        //while (waiting) { }

    }


    router.use((req, res, next) => {
        log.debug("Post user routes");
        next();
    });


    router.put("/", (
        req: IRequest,
        res: IResponse,
        next: Express.NextFunction
    ) => {

        // feebdack
        log.debug("Post user (put) router called, %s", res.result.email);


        // convert/wrap email to base64 string
        const urlEmail = Buffer.from(res.result.email).toString("base64");


        // Create a SMTP transporter object
        const transporter = nodemailer.createTransport({
            //@ts-ignore
            host: String(process.env.SMTP_HOST),
            port: Number(process.env.SMTP_PORT),
            secure: Boolean(process.env.SMTP_SECURE),
            name: String(process.env.SMTP_CLIENT_NAME),
            auth: {
                user: String(process.env.SMTP_AUTH_USER),
                pass: String(process.env.SMTP_AUTH_PASS),
            },
            logger: log,
            debug: Boolean(process.env.SMTP_DEBUG)
        }, {
            from: `OpenHaus <no-reply@${process.env.SMTP_HOST}`,
            headers: {
                "X-UUID": process.env.UUID
            }
        });


        const message = {
            to: `${res.result.name} - <${res.result.email}>`,
            subject: 'Confirm your created OpenHaus account!',
            text: `Visit this page http://${process.env.HTTP_NAME}:${process.env.HTTP_PORT}/auth/confirm/${encodeURIComponent(urlEmail)} to confirm/activated your account!`,
            html: `Click here <a href="http://${process.env.HTTP_NAME}:${process.env.HTTP_PORT}/auth/confirm/${encodeURIComponent(urlEmail)}">to confirm</a>`
        };


        transporter.sendMail(message, (
            err: Error,
            info: any
        ) => {

            if (err) {
                //@ts-ignore
                log.error(err, "Could not send E-Mail to '%s', %s", req.result.email, err.message);
            }

            //@ts-ignore
            log.info("Activiation E-Mail send to '%s'", res.result.email);


            if (process.env.NODE_ENV !== "production") {
                log.debug("View: %s", nodemailer.getTestMessageUrl(info));
            }


            // only needed when using pooled connections
            transporter.close();

        });


        next();

    });




};
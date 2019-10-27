import * as Express from "express";
import * as Mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { IUser } from '../database/model.users';
import { IToken } from '../database/model.tokens';


const logger = require("../logger/index.js");
const log = logger.create("auth");


const users = Mongoose.model("Users");
const tokens = Mongoose.model("Tokens");


const GENERATE_TOKEN = (
    user: IUser,
    res: Express.Response,
    payload: Object = {},
    options: Object = {}
) => {
    fs.readFile(`${__dirname}/../private-key.pem`, (err, PRIVATE_KEY) => {

        if (err) {
            log.error(err, "Could not read private key from fs");
            return res.status(500).end();
        }

        jwt.sign({
            iat: Date.now(),
            email: user.email,
            uuid: process.env.UUID,
            rights: [],
            ...payload
        }, PRIVATE_KEY, {
            algorithm: "RS512",
            ...options
        }, (err, token: String) => {

            if (err) {
                log.error(err, "Could not sign/create token for User/E-Mail '%s'", user.email)
                return res.status(500).end();
            }

            // save token in database
            (new tokens({
                //@ts-ignore
                token,
                user: user._id
            })).save((err: Mongoose.Error, safed: IToken) => {

                if (err || !safed) {
                    log.error(err, "Could not safe token in database");
                    return res.status(500).end();
                }

                // feedback
                log.info("User '%s' (%s) successfull logged in.", user.name, user.email);

                //@ts-ignore
                res.setHeader("x-token", token);

                res.json({
                    user,
                    token: token
                });

            });


        });

    });
};


// main router
// allow users to login/logout
module.exports = (app: Express.Router) => {


    const router = Express.Router();
    app.use("/auth", router);
    router.use(bodyParser.json());


    /**
     * Remove token from database
     * Authenticiations with the removed token is no more possible
     */
    router.post("/logout", (req, res) => {

        const token = (req.headers["x-token"] || req.headers["bearer"]);

        if (!token) {
            log.debug("No token in headers found!");
        }


        if (req.body.email) {
            // NOTE
            // remove all tokens for/from user
            // system/interface tokens too ?!
            log.verbose("Remove all active logins for the user (TODO)");
        }


        tokens.findOne({
            token: token
        }).exec((err, doc) => {

            if (err) {
                log.error(err, "Could not fetch token from db");
                return res.status(500).end();
            }

            if (!doc) {
                log.warn("No token in database found");
                return res.status(400).end();
            }

            tokens.remove({
                token
            }, (err) => {

                if (err) {
                    log.error(err, "Could not remove token from database");
                    return res.status(500).end();
                }

                //@ts-ignore
                let first = token.substr(0, 5);
                //@ts-ignore
                let last = token.substr(token.length - 5);

                // feedback
                log.info(`User with token ${first}...${last} from %s logged out`, req.ip);

                return res.status(200).end();

            });

        });

    });


    /**
     * Allows user to login.
     * Creates/return a token
     */
    router.post("/login", (req, res) => {

        // NOTE: for future use:
        // - renew token
        // - upgrade rights
        //@ts-ignore
        const token = (req.headers["x-token"] || req.headers["bearer"]);

        if (!req.body.email || !req.body.password) {
            log.warn("E-Mail/Password not sent");
            return res.status(400).end();
        }

        if (token) {
            log.verbose("User try to login with existing token!");
        }

        users.findOne({
            email: req.body.email
        }).lean().exec((err, doc: IUser) => {

            if (err) {
                log.error(err, "User could not fetched from database");
                return res.status(500).end();
            }

            if (!doc) {
                log.debug("No User for E-Mail '%s' found", req.body.email);
                return res.status(404).end();
            }

            if (!doc.enabled) {
                log.warn("User '%s' (%s) tries to login with disabled account", doc.name, doc.email);
                return res.status(423).end();
            }

            //@ts-ignore
            bcrypt.compare(req.body.password, doc.password, (err, result) => {

                if (err) {
                    log.error(err, "Could not compare password hashes!");
                    return res.status(500).end();
                }

                if (!result) {
                    // TODO count login attempts up
                    // disable user if to many false logins
                    log.warn("Invalid login attempt for E-Mail '%s'", doc.email);
                    return res.status(401).end();
                }

                //@ts-ignore
                delete doc.password;
                GENERATE_TOKEN(doc, res);

            });

        });

    });



    /**
     * Create sub tokens from user which is calling this route
     */
    router.post("/token", module.exports.protect(false), (req, res) => {

        //@ts-ignore
        const { email } = req.auth.decoded;

        users.findOne({
            email,
            enabled: true
        }).lean().exec((err, user) => {

            if (err) {
                log.error(err, "Could not fetch user (%s) from databse", email);
                return res.status(500).end();
            }

            GENERATE_TOKEN(user, res, {
                // custom payload
            }, {
                // jwt options
            });

        });

    });


};


// protect router/route
// check necessary rights to access this router/route
module.exports.protect = (router: Express.Router, rights: Array<String> = []) => {


    const AUTH = (
        req: Express.Request,
        res: Express.Response,
        next: Function
    ) => {

        const token = (req.headers["x-token"] || req.headers["bearer"]);

        // NOTE use <req.ip> ?!
        const ip = (
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            //@ts-ignore
            (req.connection.socket ? req.connection.socket.remoteAddress : null)
        );

        if (!token) {
            log.warn("Unauthenticated request on %s from %s", req.originalUrl, ip);
            return res.status(401).end();
        }


        fs.readFile(`${__dirname}/../public-key.pem`, (err, PUBLIC_KEY) => {

            if (err) {
                log.error(err, "Could not read public key from fs");
                return res.status(500).end();
            }

            //@ts-ignore
            jwt.verify(token, PUBLIC_KEY, function (err, decoded) {

                if (err) {
                    if (err.message === "invalid signature") {

                        log.error("Invalid signature in token from client %s", ip);
                        log.verbose("Public/Private key-pair changed ?");
                        return res.status(401).end();

                    } else {

                        // 
                        log.error(err, "Could not verify users token %s", ip);
                        return res.status(500).end();

                    }
                }


                if (decoded.uuid != process.env.UUID) {
                    log.warn("UUID mismatch! token.uuid = env.UUID, %s = %s", decoded.uuid, process.env.UUID);
                    return res.status(401).end();
                }


                tokens.findOne({
                    token
                }).lean().exec((err, found) => {

                    if (err) {
                        log.error(err, "Could not fetch token from db");
                        return res.status(500).end();
                    }


                    if (!found) {

                        //@ts-ignore
                        let first = token.substr(0, 5);
                        //@ts-ignore
                        let last = token.substr(token.length - 5);

                        log.warn(`Token '${first}...${last}' from user '%s', client '%s' not found!`, decoded.email, ip);
                        log.debug("Token revoked ?!");

                        return res.status(401).end();

                    }


                    // feedback
                    log.debug("Token for user %s verified successful on route %s", decoded.email, req.originalUrl);


                    const hasRights = rights.map((s) => {
                        return decoded.rights.indexOf(s) !== -1;
                    });


                    if (hasRights.length > 0 && !hasRights.includes(false)) {
                        log.warn("User '%s' has not the necessary rights to access %s", decoded.email, req.originalUrl);
                        return res.status(403).end();
                    }


                    //@ts-ignore
                    req.auth = {
                        token,
                        decoded
                    }

                    next();

                });


            });

        });

    };


    if (router) {
        router.use(AUTH);
    } else {
        return AUTH;
    }

}
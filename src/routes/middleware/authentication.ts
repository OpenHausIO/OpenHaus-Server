import { IRequest } from "../api.interfaces";
import * as mongoose from "mongoose";
import { JWT, JWK } from "@panva/jose";
import * as Express from "express";
import * as bcrypt from "bcryptjs";


export interface IAuth {
    login: Function
}

//@ts-ignore
const methods: IAuth = {};
const Users = mongoose.model("Users");
const Tokens = mongoose.model("Tokens");

module.exports = () => {


    methods.login = () => {
        return (req: IRequest, res: Express.Response, next: Function) => {
            if (req.body.email && req.body.password /*&& req.method.toLowerCase() === "post"*/) {

                Users.findOne({
                    email: req.body.email
                }).exec((err, user) => {

                    if (err) {
                        console.log("BLLASDf", err);
                        return res.status(500).end();
                    }

                    //@ts-ignore
                    bcrypt.compare(req.body.password, user.password, function (err, match) {

                        if (err) {
                            console.log("BCRYPT ERROR!", err);
                            return res.status(500).end();
                        }

                        if (match) {


                            // TODO What do we when user credentials ok ?
                            // next midleware or send token ?


                        } else {
                            res.status(400).end();
                        }

                    });

                });

            } else {

                res.status(400).json({
                    error: "INVALID_CREDENTIALS"
                });

            }
        }
    };

    //@ts-ignore
    methods.createToken = (payload: any, options: any, cb: Function) => {
        JWK.generate("RSA", options).then((key) => {
            return JWT.sign(payload, key, options);
        }).then((token) => {


            (new Tokens({
                //@ts-ignore
                token
                //@ts-ignore
            })).save((err, result) => {

                if (err) {
                    // could not save token
                    // login would be invalid
                    return cb(err);
                }

                cb(null, result);

            });


        }).catch((err) => {

            console.log("err", err);
            cb(err);

        });
    };

    //@ts-ignore
    methods.isLoggedin = (token, cb) => {
        Tokens.findOne({
            token: token
        }).exec((err, doc) => {

            if (err) {
                return cb(err);
            }

            if (doc) {
                return cb(null, true)
            }

            return cb(null, false);

        });
    };



    //@ts-ignore
    methods.hasRights = (tokien, rights, cb) => {

    };






};
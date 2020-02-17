import { Request, Response, Router } from "express";
import { Error, Model, Document, Schema } from "mongoose";
import * as Winston from "winston";
import * as Express from "express";

export interface IPopulate {
    path: String,
    populate: [] | IPopulate[]
}

export interface IRequest extends Request {
    populate: IPopulate | [],
    doc: Document
};


export interface IResponse extends Response {
    result: any
};


module.exports = (log: Winston.Logger) => {
    return (
        model: Model<Document, Schema>,
        router: Router
    ) => {


        /**
         * Create populate object for querys
         */
        router.use((
            req: IRequest,
            res: Response,
            next: Function
        ) => {

            if (req.query && req.query.populate) {
                req.populate = req.query.populate.split(",").reduce((r: Array<IPopulate>, s: String) => {
                    s.split('.').reduce((a: IPopulate[], path: String) => {

                        let object = a.find(o => o.path === path);

                        if (!object) {
                            a.push(object = { path, populate: [] });
                        }

                        return object.populate;

                    }, r);
                    return r;
                }, []);
            }

            next();

        });


        /**
         * Fetch doc from database
         */
        router.param('_id', (
            req: IRequest,
            res: Response,
            next: Function,
            _id: String
        ) => {

            //TODO findonebyid
            const query = model.findOne({
                _id
            });

            //console.log("lakjdsfasdf")
            query.populate(req.populate);

            // execute query
            query.exec((
                err: Error,
                doc: Document
            ) => {

                if (err) {
                    console.log(err)
                    res.status(400).end();
                    return;
                }

                if (!doc) {
                    res.status(404).end();
                    return;
                }

                req.doc = doc;
                next();

            });

        });


        router.search("/", (
            req: IRequest,
            res
        ) => {

            const query = model.find(req.body);
            query.populate(req.populate);

            if (req.params.limit) {
                query.limit(Number(req.params.limit));
            }

            if (req.params.skip) {
                query.skip(Number(req.params.skip));
            }

            query.exec((err, docs) => {

                if (err) {
                    log.error(err);
                    return res.status(500).end();
                }

                if (docs.length === 0) {
                    return res.status(404).end();
                }

                res.json(docs);

            });

        });


        //@TODO add query range/size?!
        router.get("/:_id?", (
            req: IRequest,
            res: Express.Response,
            next: Express.NextFunction
        ) => {

            if (req.params._id && req.doc) {
                return res.json(req.doc);
            }

            // query & populate docs
            const query = model.find({});
            query.populate(req.populate);

            if (req.params.limit) {
                query.limit(Number(req.params.limit));
            }

            if (req.params.skip) {
                query.skip(Number(req.params.skip));
            }

            /*
            if (req.params.page) {
                query.limit(req.params.limit || 10);
                query.skip(req.params.limit * req.params.page)
            }
            */

            // execute query
            query.exec((err: Error, docs: Array<Document>) => {

                if (err) {
                    log.error(err);
                    res.status(500).end();
                    return;
                }

                res.json(docs);

                //@ts-ignore
                res.result = docs;

                next();

            });

        });


        router.put("/", (
            req: IRequest,
            res: Response,
            next: Express.NextFunction
        ) => {

            (new model(req.body)).save((err, data) => {

                if (err) {
                    log.error(err);
                    return res.status(400).end();
                }

                res.json(data);

                //@ts-ignore
                res.result = data;

                next();

            });

        });


        router.post("/:_id", (
            req: IRequest,
            res: Response,
            next: Express.NextFunction
        ) => {

            req.doc.updateOne({
                $set: req.body
            }, (err, result) => {

                if (err) {
                    log.error(err);
                    return res.status(500).end();
                }

                res.json(result);

                //@ts-ignore
                res.result = result;

                next();

            });

        });


        router.delete("/:_id", (
            req: IRequest,
            res: Response,
            next: Express.NextFunction
        ) => {

            req.doc.remove((err, result) => {

                if (err) {
                    log.error(err);
                    return res.status(500);
                }

                res.json(result);

                //@ts-ignore
                res.result = result;

                next();

            });

        });

    };
};
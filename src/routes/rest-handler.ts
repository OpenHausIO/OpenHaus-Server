"use strict";

// https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722

import { Request, Response, Router } from "express";
import { Error, Model, Document, Schema } from "mongoose";

interface IPopulate {
    path: String,
    populate: [] | IPopulate[]
}

interface IRequest extends Request {
    populate: IPopulate | [],
    doc: Document
};



interface Options {
    handleError: Boolean
}

module.exports = (
    model: Model<Document, Schema>,
    router: Router,
    options: Options
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

        //@TODO findonebyid
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

        query.exec((err, docs) => {

            if (err) {
                console.log(err);
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
        res
    ) => {

        if (req.params._id && req.doc) {
            return res.json(req.doc);
        }

        // query & populate docs
        const query = model.find({});
        query.populate(req.populate);

        // execute query
        query.exec((err: Error, docs: Array<Document>) => {

            if (err) {
                console.log(err);
                res.status(500).end();
                return;
            }

            res.json(docs);

        });

    });


    router.put("/", (
        req: IRequest,
        res: Response
    ) => {

        (new model(req.body)).save((err, data) => {

            if (err) {
                console.log(err);
                return res.status(400).end();
            }

            res.json(data);

        });

    });


    router.post("/:_id", (
        req: IRequest,
        res: Response
    ) => {

        req.doc.updateOne({
            $set: req.body
        }, (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).end();
            }

            res.json(result);

        });

    });


    router.delete("/:_id", (
        req: IRequest,
        res: Response
    ) => {

        req.doc.remove((err, result) => {

            if (err) {
                console.log(err);
                return res.status(500);
            }

            res.json(result);

        });

    });


};
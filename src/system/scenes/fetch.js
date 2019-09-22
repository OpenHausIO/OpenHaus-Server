const mongoose = require("mongoose");


module.exports = (_id) => {



}


mongoose.model("Endpoints").find({
    commands: {
        _id
    }
});
var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

var UserSchema = new Schema({
    netid: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    majors: [ { type: String, maxlength: 4 } ],
    phone: { type: String },
    token: { type: String },
    recentUpdate: { type: Boolean } // this field used for displaying banners/modals on version updates
})

var User = mongoose.model("users", UserSchema);

exports.user = User;
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    to: String,
    from: String,
  message: String,
  createdAt: Date
});

module.exports = mongoose.model('Message', MessageSchema);
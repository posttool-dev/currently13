var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;


exports.ResourceInfo = function(){
  return {
    meta: {
      plural: 'Resources',
      dashboard: true
    },
    schema: {
      name: String,
      path: String,
      size: Number,
      mime: String,
      meta: mongoose.Schema.Types.Mixed,
      children: [{
        path: String,
        size: Number,
        mime: String,
        meta: mongoose.Schema.Types.Mixed
      }]
    },
    browse: [
      {name: "path", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "size", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "mime", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
    ],
    form: [
      {name: "path", widget: "resource_path"},
      {name: "size", widget: "number"},
      {name: "mime", widget: "input"},
      {name: "meta", widget: "json"},
      {name: "children", widget: "choose_create", options: {type: "Resource", array: true, readonly: true}}
    ]
  }
}

// user
exports.UserSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, lowercase: true, unique: true},
  email_verified: {type:Boolean, default: false},
  image: {type: ObjectId, ref: 'Resource'},
  hash: {type: String},
  salt: {type: String},
  created: {type: Date, default: Date.now},
  last_login: {type: Date, default: Date.now},
  group: {type:String},
  admin: {type:Boolean, default: false},
  active: {type:Boolean, default: false}
});


// log
exports.LogSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  action: String,
  type: String,
  id: mongoose.Schema.Types.ObjectId,
  info: mongoose.Schema.Types.Mixed,
  time: { type: Date, default: Date.now }
})

// group
// transition
// assignment
// msg

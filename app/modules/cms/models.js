var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

var ResourceSchemaInfo = {
  parent: {type: ObjectId, ref: 'Resource'},
  children: [{type: ObjectId, ref: 'Resource'}],
  path: String,
  size: Number,
  mime: String,
  meta: mongoose.Schema.Types.Mixed
};

exports.models = {

  Resource: {
    meta: {
      plural: 'Resources',
      dashboard: true
    },
    schema: ResourceSchemaInfo,
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


// log
var LogSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  action: String,
  type: String,
  id: mongoose.Schema.Types.ObjectId,
  info: mongoose.Schema.Types.Mixed,
  time: { type: Date, default: Date.now }
})
exports.Log = mongoose.model('Log', LogSchema);

// group
// transition
// assignment
// msg

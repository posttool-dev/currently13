var mongoose = require('mongoose');

var ResourceSchemaInfo = {
  title: String,
  caption: String,
  description: String,
  path: String,
  size: Number,
  mime_type: String,
  meta: mongoose.Schema.Types.Mixed
};
//var ResourceSchema = mongoose.Schema(ResourceSchemaInfo);
//exports.Resource = mongoose.model('Resource', ResourceSchema);

exports.models = {

  /* for blobs */
  Resource: {
    meta: {
      plural: 'Resources'
    },
    schema: ResourceSchemaInfo,
    browse: [
      {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
      {name: "path", cell: "char", filters: ["icontains", "equals"], order: "asc,desc"},
      {name: "meta", cell: "image"},
    ],
    form: [
      {name: "title", widget: "input"},
      {name: "caption", widget: "input"},
      {name: "description", widget: "rich_text"},
    ]
  }

}


// log
// group
// transition
// assignment
// msg

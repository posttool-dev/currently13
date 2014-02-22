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
    schema: ResourceSchemaInfo,
    browse: [
      {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
      {name: "caption", cell: "char", filters: ["icontains", "equals"]},
      {name: "path", cell: "image", filters: ["icontains", "equals"], order: "asc,desc"},
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

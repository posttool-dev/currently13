var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
var cms_models = require("../modules/cms/models");

exports = module.exports = {

  Page: {
    meta: {
      plural: "Pages",
      name: "<%= title %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      title: String,
      subtitle: String,
      body: mongoose.Schema.Types.Mixed,
      pages: [
        {type: ObjectId, ref: "Page"}
      ],
      code: String,
      description: String,
      resources: [
        {type: ObjectId, ref: "Resource"}
      ],
      use: String,
      keywords: String,
      year: String,
      materials: String,
      dimensions: String
    },
    browse: [
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "code", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "resources", cell: "image" },
      {name: "year", cell: "string", filters: ["$regex"], order: "asc,desc"},
      {name: "modified", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "state", cell: "int", filters: ["="], order: "asc,desc"},
    ],
    form: [
      {begin: "row"},
        {begin: "col", options: {className: "two-col"}},
          {name: "title", widget: "input", options: {className: "large", width: "80%"}},
          {name: "code", widget: "input", options: {className: "large", width: "20%"}},
        {end: "col" },
        {begin: "col", options: {className: "two-col"}},
          {name: "resources", widget: "upload", options: {type: "Resource", array: true}},
        {end: "col" },
      {end: "row" },
      {name: "description", widget: "rich_text"},
      {name: "pages", widget: "choose_create", options: {type: "Page", array: true}},
      {begin: "row"},
        {begin: "col", options: {className: "two-col"}},
          {name: "use", widget: "input", help: "More details about the use."},
          {name: "keywords", widget: "input"},
          {name: "year", widget: "input"},
        {end: "col" },
        {begin: "col", options: {className: "two-col"}},
          {name: "materials", widget: "input"},
          {name: "dimensions", widget: "input"},
        {end: "col" },
      {end: "row"}
    ]
  },

  /* news */
  News: {
    meta: {
      plural: "News",
      name: "<%= title %>",
      dashboard: true
    },
    schema: {
      title: String,
      subtitle: String,
      body: String,
      release_date: Date
    },
    browse: [
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "release_date", cell: "date", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "modified", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"}
    ],
    form: [
      {name: "title", widget: "input"},
      {name: "subtitle", widget: "input"},
      {name: "body", widget: "rich_text"},
      {name: "release_date", widget: "date"}
    ]
  },

  Resource:  {
    meta: {
      plural: 'Resources',
      workflow: true,
      dashboard: true
    },
    schema: {
      name: String,
      path: String,
      size: Number,
      mime: String,
      meta: mongoose.Schema.Types.Mixed,
      title: String,
      subtitle: String,
      description: String
    },
    browse: [
      {name: "path", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "size", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "mime", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
    ],
    form: [
      {name: "path", widget: "resource_path"},
      {name: "title", widget: "input", options: {className: "large"}},
      {name: "subtitle", widget: "input"},
      {name: "description", widget: "rich_text"}
    ]
  },
  User: cms_models.UserInfo()

}




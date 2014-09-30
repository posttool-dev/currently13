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
      url: String,
      template: String,
      description: String,
      resources: [
        {type: ObjectId, ref: "Resource"}
      ]
    },
    browse: [
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "url", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "resources", cell: "image" },
      {name: "modified", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "state", cell: "int", filters: ["="], order: "asc,desc"},
    ],
    form: [
      {name: "title", widget: "input", options: {className: "large"}},
      {name: "url", widget: "input"},
      {name: "template", widget: "select", options: {options: [ 'Portfolio', 'LandingPage', 'InformationPage', 'Contact' ]}},
      {name: "resources", label: "images", widget: "upload", options: {type: "Resource", array: true}},
      {name: "body", widget: "rich_text_cee", options: {collapsable: true, collapsed: false}},
      {name: "pages", widget: "choose_create", options: {type: "Page", array: true}},
    ],
    includes: ["/js/field_rich_text_cee.js"]

  },


  Resource:  cms_models.ResourceInfo(),
  User: cms_models.UserInfo()

}




var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
var cms_models = require("../modules/cms/models");

exports = module.exports = {

  Event: {
    meta: {
      plural: "Events",
      name: "<%= name %>",
      dashboard: true
    },
    schema: {
      name: String,
      time: Date,
      date: Date,
      place: String,
      description: String,
      tracks: [
        {type: ObjectId, ref: "Track"}
      ]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "date", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "place", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
    ],
    form: [
      { name: 'name', widget: 'input' },
      { name: 'time', widget: 'input' },
      { name: 'date', widget: 'input' },
      { name: 'place', widget: 'input' },
      { name: 'description', widget: 'rich_text' },
      { name: 'tracks', widget: 'choose_create', options: { type: 'Track', array: true } }
    ]

  },

  Track: {
    meta: {
      plural: "Tracks",
      name: "<%= title %>",
      dashboard: true
    },
    schema: {
      title: String,
      duration: String,
      audio: {type: ObjectId, ref: "Resource"}
    },
    browse: [
      { name: 'title',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' },
      { name: 'duration',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' },
      { name: 'audio',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' },
      { name: 'creator',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' },
      { name: 'modified',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' },
      { name: 'state',
        cell: 'char',
        filters: [ '$regex', '=' ],
        order: 'asc,desc,default' }
    ],
    form: [
      { name: 'title', widget: 'input' },
      { name: 'duration', widget: 'input' },
      { name: 'audio', widget: 'upload', options: { type: 'Resource', array: false } }
    ]
  },

  Resource:  cms_models.ResourceInfo()

}




module.exports.Resource.jobs = {
  image: ['thumb', 'medium', 'large'],
  audio: ['mp3'],
  video: []
}

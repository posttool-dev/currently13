var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var utils = require('../modules/cms/utils');
var models = require('./models'), FormInstance = models.FormInstance, FieldInstance = models.FieldInstance;

var path = __dirname + '/data/';

var form_instances_by_original_id = {};


exports.migrate = function () {
  FormInstance.find().remove(function (err, form_count) {
    FieldInstance.find().remove(function (err, field_count) {
      console.log('--- Removed existing: ' + form_count + ' forms and ' + field_count + ' fields');
      console.log("--- Begin processing form instances");
      csv()
        .from.path(path + 'FormInstance.csv', { delimiter: ',', escape: '"' })
        .on('record', function (row, index) {
          create_form_instance(row);
        })
        .on('end', function (count) {
          console.log("--- Processed " + count + " form instances");
          migrate_field_instances(); // do we need to wait for database?
        })
        .on('error', function (error) {
          console.error("ERROR:", error.message);
        });
    });
  });
};


function migrate_field_instances() {
  console.log("--- Begin processing field instances");
  csv()
    .from.path(path + 'FieldInstance.csv', { delimiter: ',', escape: '"' })
    .on('record', function (row, index) {
      create_field_instance(row);
    })
    .on('end', function (count) {
      console.log("--- Processed " + count + " field instances");
    })
    .on('error', function (error) {
      console.error("ERROR:", error.message);
    });
}


function create_form_instance(row)
{
  var f = new FormInstance({
    name: row[1]
  });
  f.save(function(err, r){
    if (err)
      console.log(err);
    console.log("form instance "+r);
    form_instances_by_original_id[row[0]] = r;
  });
}


function create_field_instance(row)
{
  var f = new FieldInstance({
    form: form_instances_by_original_id[row[2]],
    name: row[0]
  });
  f.save(function(err, r){
    console.log("field instance "+r);
  });
}



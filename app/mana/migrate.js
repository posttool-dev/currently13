var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose');

var utils = require('../modules/cms/utils');
var models = require('./models'), FormInstance = models.FormInstance, FieldInstance = models.FieldInstance;

var data = {};
var path = __dirname + '/data/';


exports.migrate = function() {
  console.log('---Reading CSVs');
  fs.readdir(path, function (err, files) {
    utils.forEach(files, read_csv, function(){
      console.log('---Migrating FormInstances');
      FormInstance.find().remove(function (err, c) {
        console.log('   removed '+c+' existing');
        utils.forEach(data['FormInstance.csv'].array, create_form_instance, function(){
          console.log('---Migrating FieldInstances');
          FieldInstance.find().remove(function(err, c){
            console.log('   removed '+c+' existing');
            utils.forEach(data['FieldInstance.csv'].array, create_field_instance, function(){
              console.log("COMPLETE");
            }, 20);
          }, 20);
        });
      });
    });
  });
}


function create_form_instance(row, next)
{
  var f = new FormInstance({
    name: row[0]
  });
  f.save(function(err, r){
    if (err)
      console.log(err);
    console.log("created "+r);
    next();
  });
}



function create_field_instance(row, next)
{
  var f = new FieldInstance({
    name: row[0]
  });
  f.save(function(err, r){
    console.log("created "+r);
    next();
  });
}

function read_csv(file, next) {
  var a = [];
  var m = {};
  var name = file;
  csv()
    .from.path(path + file, { delimiter: ',', escape: '"' })
    .on('record', function (row, index) {
      a.push(row);
      m[row[0]] = row;
    })
    .on('end', function (count) {
      data[name] = {name: name, array: a, map: m};
      next();
    })
    .on('error', function (error) {
      console.error("ERROR:", error.message);
      next(error);
    });
}




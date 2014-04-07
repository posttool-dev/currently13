var workflow = require('./workflow');

exports = module.exports = {
  editor: {
  },
  contributor: {
    form: [
      {type: 'Inventory'},
      {type: 'Artist'},
      {type: 'Exhibition'},
      {type: 'Contact'},
      {type: 'Resource', permission: is_creator},
      {type: 'User', form: 'profile', permission: is_user, create: false}
    ],
    browse: [
      {type: 'Inventory'},
      {type: 'Artist'},
      {type: 'Exhibition', conditions: condition_published},
      {type: 'Contact', conditions: condition_published},
      {type: 'Resource', conditions: condition_mine},
    ]
  }
}

// form guards
function is_creator(user, object, next) {
  var err = (object.creator != user._id);
  if (err) {
    next('permission error');
    return;
  }
  next();
}

function is_user(user, object, next) {
  var err = (object._id != user._id);
  if (err) {
    next('permission error');
    return;
  }
  next();
}

// browse constraints
function condition_mine(user) {
  return {creator: user._id};
}

function condition_me(user) {
  return {_id: user._id};
}

function condition_published(user) {
  return {$and: {$or: [{state: workflow.PUBLISHED}, {creator: user._id}]}};
}

// if there be cases where a condition is not sufficient,
//  you will want to create an indexed field


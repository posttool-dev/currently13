var workflow = require('./workflow');

exports = module.exports = {
  editor: {
  },
  contributor: {
    form: [
      'Inventory',
      'Artist',
      'Exhibition',
      'Contact',
      {name: 'Resource', permission: is_creator},
      {name: 'User', form: 'profile', permission: is_user}
    ],
    browse: [
      'Inventory',
      'Artist',
      {name: 'Exhibition', conditions: condition_published},
      {name: 'Resource', conditions: condition_mine},
      {name: 'Contact', conditions: condition_published},
      {name: 'User', form: 'profile', conditions: condition_me}
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
  return {state: workflow.PUBLISHED};
}
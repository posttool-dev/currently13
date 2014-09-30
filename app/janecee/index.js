
exports = module.exports = {
  config: require('./config'),
  models: require('./models'),
  workflow: require('../modules/postera/workflow'),
  permissions: require('../modules/postera/permission'),
  app: require('./app')
};
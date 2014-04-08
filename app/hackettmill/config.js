var config = {
  development: {
    name: 'Hackett|Mill',
    serverPort: 8080,
    mongoConnectString: 'mongodb://localhost/hm3',
    sessionSecret: 'nfuds9543ythhfgjghf$WH*#IRF5euyhtfgxkj',

    /* storage */
    storage: "pkgcloud",
    pkgcloudConfig: {
      provider: 'rackspace',
      username: 'posttool',
      apiKey: 'c145d22d22e638c7a96997efa8fc2751',
      region: 'DFW'
    },
    container: 'hm0',
    containerHttp: 'http://a4fbf393b2347f7a183a-8e234ce596093933a429d778ce2aed17.r47.cf1.rackcdn.com',

    /* kue */
    kueConfig: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
        // for production: {  disableSearch: true }
      }
    }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
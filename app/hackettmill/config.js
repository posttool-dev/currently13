var config = {
  serverPort: 8080,
  mongoConnectString: 'mongodb://localhost/hm0',
  sessionSecret: 'nfuds9543ythhfgjghf$WH*#IRF5euyhtfgxkj',
  multipartLimit: '1099mb',
  storage: "pkgcloud",
//  cloudinaryConfig: {
//    cloud_name: 'hackettmill',
//    api_key: '927166441966584',
//    api_secret: 'nJpv1R7U_-uhuvxiaJar8ihqUBg'
//  }
  pkgcloudConfig: {
      provider: 'rackspace',
      username: 'posttool',
      apiKey: 'c145d22d22e638c7a96997efa8fc2751',
      region: 'DFW'
    },
    container: 'hm0',
    containerHttp: 'http://a4fbf393b2347f7a183a-8e234ce596093933a429d778ce2aed17.r47.cf1.rackcdn.com'

}

module.exports = config;
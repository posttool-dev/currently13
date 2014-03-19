var config = {
  development: {
    serverPort: 8080,
    mongoConnectString: 'mongodb://localhost/peter',
    sessionSecret: 'dsakj;ldsa8r4fndlsk*#IRF5euyhtfgxkj',
    multipartLimit: '1099mb',
    useGfs: false,
    usePkgcloud: true,
    pkgcloudConfig: {
      provider: 'rackspace',
      username: 'posttool',
      apiKey: 'c145d22d22e638c7a96997efa8fc2751',
      region: 'DFW'
    },
    container: 'dk2',
    containerHttp: 'http://8eefe7163149f80cdb48-20af715d1692f3e2c7c9be2720e32665.r77.cf1.rackcdn.com',
    containerHttps: 'https://1add096c32ba3a5dcef7-20af715d1692f3e2c7c9be2720e32665.ssl.cf1.rackcdn.com',
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
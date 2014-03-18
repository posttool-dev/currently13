var config = {
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
  container: 'dk2'
}

module.exports = config;
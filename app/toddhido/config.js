var config = {
  development: {
    name: 'Todd Hido',
    serverPort: 3001,
    mongoConnectString: 'mongodb://localhost/hido',
    sessionSecret: 'fnidsi7 54kuhsh,ngf',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'dou2a3991', api_key: '966862466779654', api_secret: 'GResRYM8Q3zUD_CGwtvxfsB16ek' }
  },
  production: {
    name: 'Todd Hido',
    serverPort: 80,
    mongoConnectString: 'mongodb://localhost/hido',
    sessionSecret: 'fnidsi7 54kuhsh,ngf',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'dou2a3991', api_key: '966862466779654', api_secret: 'GResRYM8Q3zUD_CGwtvxfsB16ek' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
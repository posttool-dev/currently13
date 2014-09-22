var config = {
  development: {
    name: 'Cee Architects',
    serverPort: 3001,
    mongoConnectString: 'mongodb://localhost/cee',
    sessionSecret: 'fjo8dsnuoknsfdhjkjkhsfdshjjhk',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'ceearchitects', api_key: '967474524438982', api_secret: '_Ch02gFFDgYutBwPU-sm9dxyVB8' }
  },
  production: {
    name: 'Cee Architects',
    serverPort: 80,
    mongoConnectString: 'mongodb://localhost/cee',
    sessionSecret: 'fjo8dsnuoknsfdhjkjkhsfdshjjhk',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'ceearchitects', api_key: '967474524438982', api_secret: '_Ch02gFFDgYutBwPU-sm9dxyVB8' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
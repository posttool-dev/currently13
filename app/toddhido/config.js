var config = {
  development: {
    name: 'Todd Hido',
    serverPort: 8080,
    mongoConnectString: 'mongodb://localhost/hido',
    sessionSecret: 'fnidsi7 54kuhsh,ngf',

    /* storage */
    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'posttool', api_key: '681946288916643', api_secret: 'L08_8W3noETBoKaMk9CV8paLlx8' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
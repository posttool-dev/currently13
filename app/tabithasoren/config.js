var config = {
  development: {
    name: 'Tabitha Soren',
    serverPort: 8080,
    mongoConnectString: 'mongodb://localhost/tabitha',
    sessionSecret: 'fdslf;ds;ljfdsj;fgxkfgdsgfdgj',

    /* storage */
    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'posttool', api_key: '681946288916643', api_secret: 'L08_8W3noETBoKaMk9CV8paLlx8' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
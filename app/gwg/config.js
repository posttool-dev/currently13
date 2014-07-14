var config = {
  development: {
    name: 'General Working Group',
    serverPort: 3001,
    mongoConnectString: 'mongodb://localhost/gwg',
    sessionSecret: 'hfg7dyui54wks',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'gwg', api_key: '344957799271546', api_secret: 'XQ0U1xTWs0_0gNZ8ddXLLRsOQxg' }
  },
  production: {
    name: 'General Working Group',
    serverPort: 80,
    mongoConnectString: 'mongodb://localhost/gwg',
    sessionSecret: 'fds4etgrdthfjykjl',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'gwg', api_key: '344957799271546', api_secret: 'XQ0U1xTWs0_0gNZ8ddXLLRsOQxg' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
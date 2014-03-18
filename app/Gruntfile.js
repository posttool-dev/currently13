module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'hackettmill/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    sshconfig: {
      production: {
        host: '166.78.17.222',
        username: 'root',
        agent: process.env.SSH_AUTH_SOCK
      }
    },
    sshexec: {
      deploy: {
//        command: [
//          'cd /home/<%= pkg.user %>/app',
//          'git pull origin master',
//          'npm install',
//          'forever stop server.js',
//          'forever start server.js',
//          'forever list'
//        ].join(' && '),
        command: 'ls -al',
        options: {
          config: 'production'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ssh');


  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  console.log(process.env.SSH_AUTH_SOCK)

};

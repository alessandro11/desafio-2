module.exports = shipit => {
  require('shipit-deploy')(shipit)
 
  shipit.initConfig({
    default: {
      deployTo: '/home/webserver/',
      repositoryUrl: 'https://github.com/alessandro11/desafio-2.git',
      keepReleases: 10,
      keepWorkspace: false, // should we remove workspace dir after deploy?
      deleteOnRollback: false,
      //key: '~/.ssh/id_ecdsa',
      deploy: {
        remoteCopy: {
          copyAsDir: false, // Should we copy as the dir (true) or the content of the dir (false)
        },
      },
    },
    production: {
      servers: 'webserver@webserver.com',
    },
  })
}

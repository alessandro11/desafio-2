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
            tag: 'rc-0.0.2',
            //banch: <branch name>
            deploy: {
                remoteCopy: {
                    copyAsDir: false, // Should we copy as the dir (true) or the content of the dir (false)
                },
            },
        },
        production: {
            servers: 'webserver@webserver.com',
        },
    });

    shipit.blTask('install_dep', async () => {
        await shipit.remote('cd current; \
            /home/webserver/.nvm/nvm-exec npm install; \
            sudo /bin/systemctl reload webserver.service')
        .then(({ stdout }) => console.log(stdout))
        .catch(({ stderr }) => console.error(stderr));
    })

    shipit.on('deployed', function() {
        shipit.start('install_dep');
    });
}

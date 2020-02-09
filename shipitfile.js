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
            //tag: 'rc-0.0.2',
            banch: 'master',
            deploy: {
                remoteCopy: {
                    copyAsDir: false, // Should we copy as the dir (true) or the content of the dir (false)
                },
            },
        },
        production: {
            branch: 'tst',
            servers: 'webserver@webserver3.com',
        },
    });

    shipit.blTask('install_dep', async () => {
        await shipit.remote('cd current; \
            /home/webserver/.nvm/nvm-exec npm install; \
            sudo /bin/systemctl reload webserver.service')
        .then(({ stdout }) => console.log(stdout))
        .catch(({ stderr }) => console.error(stderr));
    })

    shipit.blTask('restart', async () => {
        await shipit.remote('sudo /bin/systemctl reload webserver.service')
            .then(({ stdout }) => console.log(stdout))
            .catch(({ stderr }) => console.error(stderr));
    })

    shipit.on('deployed', function() {
        shipit.start('install_dep');
    });

    shipit.on('rollbacked', function() {
        shipit.start('restart');
    });
}

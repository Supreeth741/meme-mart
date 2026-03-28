module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
      // First application
      {
        name: 'mememart_service',
        script: 'npm start',
        env_production: {
          NODE_ENV: 'production'
        }
      }
    ],
    
    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     * key: "~/.ssh/id_rsa",
     */
    deploy: {
      staging: {
        user: 'ubuntu',
        host: '3.6.93.51',
        ref: 'origin/main',
        repo: 'git@github.com:IMMORTALCHIRU/mememart_backend.git',
        path: '/home/ubuntu/mememart_backend',
        key: "../stagingsshkey.pem",
        'post-deploy': 'pm2 startOrRestart ecosystem.config.js --name mememart_service'
      },
      // production: {
      //   user: 'bitnami',
      //   host: '43.205.169.108',
      //   key: "~/.ssh/id_rsa",
      //   ref: 'origin/main',
      //   repo: 'git@gitlab.com:Plugeasy/cms_portal_backend.git',
      //   path: '/home/bitnami/vendor-portal',
      //   'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --name plugeasy-service'
      // }
    }
  }

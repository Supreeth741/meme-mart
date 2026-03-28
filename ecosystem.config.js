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
        ref: 'origin/master',
        repo: 'git@github.com:Supreeth741/meme-mart.git',
        path: '/home/ubuntu/mememart',
        key: "../stagingsshkey.pem",
        'post-deploy': 'npm install && cd mememart-frontend && npm install && cd .. && npm run build:all && pm2 startOrRestart ecosystem.config.js --env production --name mememart_service'
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

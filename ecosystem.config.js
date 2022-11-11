module.exports = {
  apps : [{
    name   : "backend-app-dev",
    script : "./index.js",
    watch: true,
    env:{
      NODE_ENV: "development"
    }
  },{
    name   : "backend-app-prod",
    script : "./index.js",
    watch: true,
    env: {
      NODE_ENV: "production"
    }
  }]
}

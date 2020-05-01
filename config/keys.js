// prod env variable 
if (process.env.NODE_ENV === 'production') {
    // we are in prod mode - return the prod set of keys
    module.exports = require('./prod');
} else {
    // we are in dev mode - return the dev set of keys
    module.exports = require('./dev');
}
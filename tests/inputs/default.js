module.exports = {
    // Client address
    clientWebsite : "https://127.0.0.1:3000",

    // Private credentials of cluster, cluster and bridge
    // to tests
    credentials : {
        bridge : "127.0.0.1:3000",
        cluster : "<enter the cluster name>",
        username : "<enter the username>",
        password : "<enter the password>"
    },

    // Server conffiguration (to see if tests are good)
    // Base folder by tests/
    serverConfig : "../server/config.js",

    // Test bad credentials in the specified cluster
    // Some cluster ban if too many attempts (see fail2ban),
    // so if tests was executed many times :
    // other tests will not work (so change to false)
    testBadCredentials : true,
};

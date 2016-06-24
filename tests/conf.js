exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['specs/login.js'],
    params : {
        inputFile : "./inputs/default.js"
    }
};

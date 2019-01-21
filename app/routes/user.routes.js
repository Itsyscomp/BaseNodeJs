module.exports = (app) => {
    const user = require('../controllers/user.controller.js');
    app.get('/', user.init);
    app.get('/usuarios', user.getUsarios);
    //app.post('/usuarios', user.getUsarios);
    app.get('/usuarios/:usuariosId', user.getUsarioId);
}
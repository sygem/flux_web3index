const express = require('express');
const apiRoutes = require('./api');

const router = express.Router();

apiRoutes.addRoutes(router);

module.exports = router;
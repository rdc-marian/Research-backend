"use strict";

const controller = require("../controllers/resourcePersonController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

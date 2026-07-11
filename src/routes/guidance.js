"use strict";

const controller = require("../controllers/guidanceController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

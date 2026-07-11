"use strict";

const controller = require("../controllers/awardController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

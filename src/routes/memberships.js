"use strict";

const controller = require("../controllers/membershipController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

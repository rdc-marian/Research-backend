"use strict";

const controller = require("../controllers/conferenceController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

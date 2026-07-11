"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("../controllers/patentController");
const createAccomplishmentRouter = require("./accomplishmentRouterFactory");
module.exports = createAccomplishmentRouter(controller);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResearchGrant = require("../models/ResearchGrant");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResearchGrant, "ResearchGrant");

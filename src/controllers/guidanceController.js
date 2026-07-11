"use strict";

const ResearchGuidance = require("../models/ResearchGuidance");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResearchGuidance, "ResearchGuidance");

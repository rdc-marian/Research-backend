"use strict";

const ResearchGrant = require("../models/ResearchGrant");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResearchGrant, "ResearchGrant");

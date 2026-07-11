"use strict";

const ResearchProject = require("../models/ResearchProject");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResearchProject, "ResearchProject");

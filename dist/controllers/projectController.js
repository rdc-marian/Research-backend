"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResearchProject = require("../models/ResearchProject");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResearchProject, "ResearchProject");

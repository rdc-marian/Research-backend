"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Award = require("../models/Award");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Award, "Award");

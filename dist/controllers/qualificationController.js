"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Qualification = require("../models/Qualification");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Qualification, "Qualification");

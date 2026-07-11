"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scholarship = require("../models/Scholarship");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Scholarship, "Scholarship");

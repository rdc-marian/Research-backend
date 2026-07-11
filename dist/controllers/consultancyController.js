"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Consultancy = require("../models/Consultancy");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Consultancy, "Consultancy");

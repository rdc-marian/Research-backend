"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collaboration = require("../models/Collaboration");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Collaboration, "Collaboration");

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Workshop = require("../models/Workshop");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Workshop, "Workshop");

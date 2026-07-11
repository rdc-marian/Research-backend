"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Patent = require("../models/Patent");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Patent, "Patent");

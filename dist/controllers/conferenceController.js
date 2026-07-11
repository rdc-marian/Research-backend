"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Conference = require("../models/Conference");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Conference, "Conference");

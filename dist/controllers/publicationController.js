"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Publication = require("../models/Publication");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Publication, "Publication");

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourcePerson = require("../models/ResourcePerson");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResourcePerson, "ResourcePerson");

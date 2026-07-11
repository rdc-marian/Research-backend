"use strict";

const ResourcePerson = require("../models/ResourcePerson");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(ResourcePerson, "ResourcePerson");

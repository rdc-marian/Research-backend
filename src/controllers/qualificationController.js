"use strict";

const Qualification = require("../models/Qualification");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Qualification, "Qualification");

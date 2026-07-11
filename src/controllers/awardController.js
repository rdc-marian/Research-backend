"use strict";

const Award = require("../models/Award");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Award, "Award");

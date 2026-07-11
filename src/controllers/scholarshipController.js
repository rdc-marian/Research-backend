"use strict";

const Scholarship = require("../models/Scholarship");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Scholarship, "Scholarship");

"use strict";

const Consultancy = require("../models/Consultancy");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Consultancy, "Consultancy");

"use strict";

const Patent = require("../models/Patent");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Patent, "Patent");

"use strict";

const Collaboration = require("../models/Collaboration");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Collaboration, "Collaboration");

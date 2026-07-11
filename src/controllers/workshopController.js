"use strict";

const Workshop = require("../models/Workshop");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Workshop, "Workshop");

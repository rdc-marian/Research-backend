"use strict";

const Publication = require("../models/Publication");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Publication, "Publication");

"use strict";

const Conference = require("../models/Conference");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Conference, "Conference");

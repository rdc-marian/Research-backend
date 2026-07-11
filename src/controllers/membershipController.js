"use strict";

const Membership = require("../models/Membership");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Membership, "Membership");

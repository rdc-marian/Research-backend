"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Membership = require("../models/Membership");
const createAccomplishmentController = require("../utils/controllerFactory");
module.exports = createAccomplishmentController(Membership, "Membership");

"use strict";

const express = require("express");
const router  = express.Router();

const {
  getActive,
  getAll,
  create,
  update,
  toggle,
  remove,
} = require("../controllers/promoBarController");

const adminAuth = (req, res, next) => {
  // TODO: verify JWT / check req.user.role === "admin"
  next();
};

router.get("/active", getActive);

router.get(    "/",           adminAuth, getAll);
router.post(   "/",           adminAuth, create);
router.put(    "/:id",        adminAuth, update);
router.patch(  "/:id/toggle", adminAuth, toggle);
router.delete( "/:id",        adminAuth, remove);

module.exports = router;
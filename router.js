"use strict";

const express = require('express');
const router = express.Router();
const admin = require('./controllers/admin')
const home = require('./controllers/home')
const about = require('./controllers/about')
const accounts = require('./controllers/accounts')
const dashboard = require('./controllers/dashboard')

// Admin
router.get("/admin", admin.index);
router.get("/admin/client/:id", admin.client)

// Home
router.get("/", home.index);

// Error
router.get("/error500", home.error500)

// About
router.get("/about", about.index);

// login
router.get("/login", accounts.login);
router.get("/signup", accounts.signup);
router.get("/logout", accounts.logout);
router.post("/register", accounts.register);
router.post("/authenticate", accounts.authenticate);

// User
//router.get("/user", user.index)
//router.get("/user/edituserdetails", user.editUserDetails)
//router.post("/user/updateuserdetails", user.updateUserDetails)

// Station
//router.get("/station/:id", station.index);
//router.get("/station/:id/deletereading/:readingId", station.deleteReading);
//router.post("/station/:id/addreading", station.addReading);
//router.get("/station/:id/addAutoReading", station.addAutoReading)

// Dashboard
router.get("/dashboard", dashboard.index);
//router.get("/dashboard/deletestation/:id", dashboard.deleteStation);
//router.post("/dashboard/addstation", dashboard.addStation);
//router.get("/dashboard/:id/addAutoReading", dashboard.addAutoReading)

// test
router.get('/addDeedBox', dashboard.addDeedBox);
router.get('/addSecurity', dashboard.addSecurity);


module.exports = router;
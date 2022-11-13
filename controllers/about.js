"use strict";

const logger = require("../config/logger");
const accounts = require("./accounts.js")

const about = {
  index(request, response) {
    logger.info("Rendering About");

    const viewData = {
      title: "About",
    };
    response.render("about", viewData);
  },
};

module.exports = about;

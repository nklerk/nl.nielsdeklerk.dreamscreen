"use strict";

const Homey = require("homey");

class MyApp extends Homey.App {
  onInit() {
    this.log("Dreamscreen driver is running...");
  }
}

module.exports = MyApp;

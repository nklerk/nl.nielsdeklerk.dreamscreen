"use strict";

const Homey = require("homey");
/* global Homey, module */

class DsDevice extends Homey.Device {
  onInit() {
    this._data = this.getData();
    this._id = this._data.id;
    this._store = this.getStore();
    this._token = this._store.token;
    this._api = null;
    this._info = null;
    this._added = false;
    this._driver = this.getDriver();
    this._name = this.getName();
    this._class = this.getClass();

    this.log("Loaded Device_id", this._id);

    this.registerCapabilityListener("dim", (value, opts) => {
      if (value === 0 && this._driver.getMode(this._id) > 0) {
        this._driver.setMode(this._id, 0);
      } else {
        if (this._driver.getMode(this._id) == 0) {
          this._driver.setMode(this._id, 3);
        }
        this._driver.setBrightness(this._id, 100 * value);
      }
      return Promise.resolve();
    });

    new Homey.FlowCardAction("set_mode").register().registerRunListener(args => {
      this._driver.setMode(args.device._id, parseInt(args.value, 10));
      return true;
    });

    new Homey.FlowCardAction("set_hdmi").register().registerRunListener(args => {
      this._driver.setInput(args.device._id, parseInt(args.value, 10));
      return true;
    });

    new Homey.FlowCardAction("set_ambimode").register().registerRunListener(args => {
      this._driver.setAmbiMode(args.device._id, parseInt(args.value, 10));
      return true;
    });
  }

  onAdded() {
    this.log("device added");
    this._added = true;
  }

  onDeleted() {
    this.log("device deleted");
  }
}

module.exports = DsDevice;

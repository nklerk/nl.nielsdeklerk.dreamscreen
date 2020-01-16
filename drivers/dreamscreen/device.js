"use strict";

const Homey = require("homey");
/* global Homey, module */

class DsDevice extends Homey.Device {
  connectDriver(self) {
    if (!self) {
      self = this;
    }
    self._device = self._driver.getDevice(self._id);
    if (!self._device) {
      console.log("WARNING in connectDriver, Light not yet discovered? retry in 2 Seconds.");
      setTimeout(self.connectDriver, 2000, self);
    } else {
      console.log(`DRIVER GOT: ${self._device}`);
      self._device.client.on("light-updated", light => {
        if (light.brightness) {
          self.setCapabilityValue("dim", light.brightness / 100, () => {}); // 0-100 -> 0.00-1.00
          console.log(`"dim", ${light.brightness}`);
        }
        if (light.mode) {
          self.setCapabilityValue("set_mode", light.mode, () => {});
          console.log(`"set_mode", ${light.mode}`);
          self.setCapabilityValue("onoff", true, () => {});
          console.log(`"onoff", true`);
        } else {
          self.setCapabilityValue("set_mode", 0, () => {});
          console.log(`"set_mode", 0`);
          self.setCapabilityValue("onoff", false, () => {});
          console.log(`"onoff", false`);
        }
        if (light.ambientShow) {
          self.setCapabilityValue("set_ambimode", light.ambientShow, () => {});
          console.log(`"set_ambimode", ${light.ambientShow}`);
        }
        if (light.hdmiInput) {
          self.setCapabilityValue("set_hdmi", light.hdmiInput, () => {});
          console.log(`"set_hdmi", ${light.hdmiInput}`);
        }
      });
    }
  }

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

    this.registerCapabilityListener("set_mode", async value => {
      this._driver.setMode(this._id, parseInt(value, 10));
      return true;
    });
    this.registerCapabilityListener("set_hdmi", async value => {
      this._driver.setInput(this._id, parseInt(value, 10));
      return true;
    });
    this.registerCapabilityListener("set_ambimode", async value => {
      this._driver.setAmbiMode(this._id, parseInt(value, 10));
      return true;
    });
    this.registerCapabilityListener("onoff", async value => {
      if (value) {
        this._driver.setMode(this._id, 3);
      } else {
        this._driver.setMode(this._id, 0);
      }
      return true;
    });

    new Homey.FlowCardAction("set_mode").register().registerRunListener(args => {
      console.log("SETTING MODE>>>>>");
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

    this.log("Loaded Device_id", this._id);
    this.connectDriver();
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

"use strict";
const Homey = require("homey");
/* global Homey, module */

const DreamscreenClient = require("dreamscreen-node").Client;
const client = new DreamscreenClient();

client.on("listening", function() {
  console.log("==>	Started DreamScreen listening");
});

client.init();

// Functions...
function setMode(deviceId, value) {
  console.log("== Controller requested to set the mode of: " + deviceId + " to " + value);
  try {
    client.light(deviceId).setMode(value, function(err) {
      if (err) {
        console.log(`${client.light(deviceId).name} set Mode ${value} failed`);
      }
    });
  } catch (e) {
    console.log("ERROR in function, setMode");
  }
}
module.exports.setMode = setMode;

function getMode(deviceId, value) {
  console.log("== Controller requested mode of: " + deviceId);
  return client.light(deviceId).mode;
}
module.exports.getMode = getMode;

function setBrightness(deviceId, value) {
  console.log("== Controller requested to set the brightness of: " + deviceId + " to " + value);
  try {
    client.light(deviceId).setBrightness(parseInt(value, 10), function(err) {
      if (err) {
        console.log(`${client.light(deviceId).name} set Brightness ${value} failed`);
      }
    });
  } catch (e) {
    console.log("ERROR in function, setBrightness");
  }
}

function setInput(deviceId, value) {
  console.log("== Controller requested to set the input of: " + deviceId + " to " + value);
  try {
    client.light(deviceId).setHdmiInput(value, function(err) {
      if (err) {
        console.log(`${client.light(deviceId).name} set Input ${value} failed`);
      }
    });
  } catch (e) {
    console.log("ERROR in function");
  }
}

function setAmbiMode(deviceId, value) {
  console.log("== Controller requested to set the ambient mode of: " + deviceId + " to " + value);
  value = parseInt(value, 10);
  try {
    if (value < 0) {
      client.light(deviceId).setAmbientModeType(0, function(err) {
        if (err) {
          console.log(`${client.light(deviceId).name} set Ambient Mode Type ${value} failed`);
        }
      });
    } else {
      client.light(deviceId).setAmbientModeType(1, function(err) {
        if (err) {
          console.log(`${client.light(deviceId).name} set Ambient Mode Type ${value} failed`);
        }
      });
      client.light(deviceId).setAmbientShow(value, function(err) {
        if (err) {
          console.log(`${client.light(deviceId).name} set Ambient Show ${value} failed`);
        }
      });
    }
  } catch (e) {
    console.log("ERROR in function");
  }
}

function allDevices() {
  let devices = [];
  for (let id in client.devices) {
    devices.push(client.devices[id]);
  }
  return devices;
}

function onPairListDevices() {
  console.log("XX ==>	discovery call");
  return allDevices().map(deviceEntry => {
    return {
      name: tclean(deviceEntry.name),
      data: { id: deviceEntry.serialNumber }
    };
  });
}

function tclean(text) {
  //bugfix for node library
  return text.replace(/\0/g, "");
}

class MyDriver extends Homey.Driver {
  onInit() {
    new Homey.FlowCardAction("set_mode").register().registerRunListener(args => args.device.set_mode());
  }

  onPairListDevices(data, callback) {
    console.log(data);
    let respond = onPairListDevices();
    callback(null, respond);
  }
  setInput(deviceId, value) {
    setInput(deviceId, value);
  }
  setBrightness(deviceId, value) {
    setBrightness(deviceId, value);
  }
  setMode(deviceId, value) {
    setMode(deviceId, value);
  }
  getMode(deviceId) {
    return getMode(deviceId);
  }
  setAmbiMode(deviceId, value) {
    setAmbiMode(deviceId, value);
  }
  getDevice(deviceId) {
    if (typeof deviceId !== "string") {
      console.log("ERROR DEVICEID MUST BE A STRING, GOT: ", deviceId);
      return false;
    } else {
      return client.light(deviceId);
    }
  }
}

module.exports = MyDriver;

'use strict';

const Homey = require('homey');
/* global Homey, module */

const DreamscreenClient = require('dreamscreen-node').Client;
const client = new DreamscreenClient();

client.on('listening', function () {
  var address = client.address();
  console.log('==>	Started DreamScreen listening');
});

client.init();



// Functions...

function getPowerState(deviceId) {
  console.log("== Controller requested PowerState of: "+deviceId);
  if (client.light(deviceId).mode == 0 ) {
    return false;
  } else {
    return true;
  }
}

function getBrightness(deviceId) {
  console.log("== Controller requested Brightness of: "+deviceId);
  return client.light(deviceId).brightness; 
}

function setPowerState(deviceId, value) {
  console.log("== Controller requested to set the PowerState of: "+deviceId+" to "+value);
  if (value === "false") {
    setMode(deviceId, 0);
  } else {
    setMode(deviceId, 3);
  }
}

function setMode(deviceId, value) {
  console.log("== Controller requested to set the mode of: "+deviceId+" to "+value);
  client.light(deviceId).setMode(value, function (err) {
    if (err) {
      console.log(`${client.light(deviceId).name} set Mode ${value} failed`);
    }
  });
} module.exports.setMode = setMode;


function getMode(deviceId, value) {
  return client.light(deviceId).mode;
} module.exports.getMode = getMode;

function setBrightness(deviceId, value) {
  client.light(deviceId).setBrightness(parseInt(value, 10), function (err) {
    if (err) {
      console.log(`${client.light(deviceId).name} set Brightness ${value} failed`);
    }
  });
}

function setInput(deviceId, value) {
  client.light(deviceId).setHdmiInput(value, function (err) {
    if (err) {
      console.log(`${client.light(deviceId).name} set Input ${value} failed`);
    }
  });
}

function setAmbiMode(deviceId, value){
  value = parseInt(value, 10);
  if (value < 0) {
    client.light(deviceId).setAmbientModeType(0, function (err) {
      if (err) { console.log(`${client.light(deviceId).name} set Ambient Mode Type ${value} failed`);   }
    });
  } else {
    client.light(deviceId).setAmbientModeType(1, function (err) {
      if (err) { console.log(`${client.light(deviceId).name} set Ambient Mode Type ${value} failed`);   }
    });
    client.light(deviceId).setAmbientShow(value, function (err) {
      if (err) { console.log(`${client.light(deviceId).name} set Ambient Show ${value} failed`);   }
    });
  }
}


function allDevices(){
  let devices = [];
  for (let id in client.devices) {
    devices.push(client.devices[id]);
  }
  return devices;
}

function onPairListDevices(){
	console.log('XX ==>	discovery call');
  return allDevices().map((deviceEntry) => {
		return {
			name: tclean(deviceEntry.name),
			data: { id: deviceEntry.serialNumber }
		}
	});
};

function tclean(text){
  return text.replace(/\0/g, '');
}

class MyDriver extends Homey.Driver {

      onInit(){
        new Homey.FlowCardAction('set_mode')
        .register()
        .registerRunListener( args => args.device.set_mode() );
      }

			onPairListDevices( data, callback ){
					console.log(data);
					let respond = onPairListDevices();
					callback( null, respond);
      }
      setInput(deviceId, value){
        setInput(deviceId, value);
      }
      setBrightness(deviceId, value){
        setBrightness(deviceId, value);
      }
      setMode(deviceId, value){
        setMode(deviceId, value);
      }
      getMode(deviceId){
        return getMode(deviceId);
      }
      setAmbiMode(deviceId, value){
        setAmbiMode(deviceId, value);
      }     
	}
	module.exports = MyDriver;

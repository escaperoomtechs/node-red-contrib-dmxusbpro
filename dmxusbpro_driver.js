"use strict"

const { SerialPort } = require("serialport")

var	ENTTEC_PRO_DMX_STARTCODE = 0x00,
	ENTTEC_PRO_START_OF_MSG  = 0x7e,
	ENTTEC_PRO_END_OF_MSG    = 0xe7,
	ENTTEC_PRO_SEND_DMX_RQ   = 0x06,
	ENTTEC_PRO_RECV_DMX_PKT  = 0x05;

function DMX(devicePath, currentUniverse) {
	console.log("initalizing dmx usb pro...");
	var self = this
	this.universe = currentUniverse;
	this.devicePath = devicePath;

	this.dev = new SerialPort({
		path: devicePath,
		'baudRate': 250000,
		'databits': 8,
		'stopbits': 2,
		'parity': 'none'
	}, function(err) {
		if(err !== null){
			console.log("dmx enttec driver device error:" + err);
		}
	});
}

DMX.prototype.send_universe = function() {
	var hdr = Buffer([
		ENTTEC_PRO_START_OF_MSG,
		ENTTEC_PRO_SEND_DMX_RQ,
		 (this.universe.length + 1)       & 0xff,
		((this.universe.length + 1) >> 8) & 0xff,
		ENTTEC_PRO_DMX_STARTCODE
	])
	var msg = Buffer.concat([
		hdr,
		this.universe,
		Buffer([ENTTEC_PRO_END_OF_MSG])
	])
	this.dev.write(msg)
}

DMX.prototype.close = function(cb) {
	console.log("closing DMX USB PRO device... ");
	this.dev.close(cb)
}

DMX.prototype.update = function(u, offset) {
	for(var c in u) {
		this.universe[(parseFloat(c)+parseFloat(offset)-parseFloat(1))] = u[c];
	}
	this.send_universe()
}

DMX.prototype.updateAll = function(v) {
	for(var i = 0; i < 512; i++) {
		this.universe[i] = v
	}
	this.send_universe()
}

DMX.prototype.universeToObject = function() {
	var u = {}
	for(var i = 0; i < this.universe.length; i++) {
		u[i] = this.get(i)
	}
	return u
}

DMX.prototype.get = function(c) {
	return this.universe[c]
}

module.exports = DMX
 
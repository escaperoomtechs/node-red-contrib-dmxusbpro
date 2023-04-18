module.exports = function(RED) {
    "use strict";

    var DMX = require('./dmxusbpro_driver.js');

    function DMXout(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        this.port = n.port || "/dev/ttyUSB0";
        this.DMX_offset = n.DMX_starting_address || 1;
        var current_universe_buffer = Buffer.alloc(512);
        var current_universe =  [];

        for (var i = 0; i<512; i++){
            current_universe[i] = 0;
        }
        current_universe_buffer = Buffer(current_universe);
        var dmx_usb_pro = new DMX(this.port, current_universe_buffer);

        this.on("input",function(msg) {
            if (Array.isArray(msg.payload)) {
                current_universe = msg.payload;
                dmx_usb_pro.update(current_universe, msg.offset ?? this.DMX_offset);
                node.send(current_universe);
            }
            
            else {
                index = parseInt(msg.topic);
                value = parseInt(msg.payload);

                if (index >= 0 && index < 512)
                {
                    if (value >= 0 && value <= 255)
                    {
                        current_universe[index] = value;
                    }
                }
                dmx_usb_pro.update(current_universe, msg.offset ?? this.DMX_offset);
                node.send(current_universe);
            }
        });

        this.on('close', function(done) {
            dmx_usb_pro.close(function (err) {
                console.log('Enttec DMX USB Pro connection closed.');
                if (err !== null)
                {
                    console.error('Error occurred while closing Enttec DMX USB Pro connection: ', err);
                }
                done();
            });
        });
    }

    RED.nodes.registerType("dmxusbpro",DMXout);
}
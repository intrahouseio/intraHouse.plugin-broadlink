const Plugin = require('./lib/plugin');

const Broadlink = require('./lib/broadlink');

const plugin = new Plugin();

const brln = new Broadlink();

plugin.on('device_action', (device) => {
    plugin.debug(device);
})


brln.on("deviceReady", (dev) => {
    plugin.debug(dev.name + ":  " + dev.host.address + " (" + dev.mactxt + ")  /  " + dev.type);
    var data = {
        mac: dev.mactxt,
        type: dev.devtype,
        name: dev.name,
        ip: dev.host.address,
        model: dev.type,
        desc: "plug"
    };

    setChannels(data);

    dev.on("mp_power", (status_array) => {

    });

    dev.on("power", (pwr) => {

    });

    dev.on("energy", (enrg) => {

    });

});


plugin.on('toolbar_command', (command) => {
  switch (command.type) {
    case 'DEVICE_SEARCH':
        brln.discover();

        setTimeout(function() {
            brln.discover();
        }, 1000);

      break;
    default:
      break;
  }
})

plugin.on('start', () => {
  plugin.debug("version: 0.0.1");

  const channels = plugin.getChannels();

//  plugin.setDeviceValue('00:0a:95:9d:68:18', 0);
//  plugin.setDeviceError('00:0a:95:9d:68:18', 'Device disconnected!');
});

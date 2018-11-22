const Plugin = require('./lib/plugin');

const Broadlink = require('./lib/broadlink');

const plugin = new Plugin();

const brln = new Broadlink();

const channels = [];


plugin.on('device_action', (device) => {
    plugin.debug(device);
})


brln.on("deviceReady", (dev) => {
    plugin.debug("Found: " + dev.name + ":  " + dev.host.address + " (" + dev.mactxt + ")  /  " + dev.type);

    var item = {
        id: `plug1_${dev.mactxt}`, // id - канала
        mac: dev.mactxt,
        type: dev.devtype,
        name: dev.name,
        ip: dev.host.address,
        model: dev.type,
        desc: "plug",
    };

    channels.push(item);

    if(dev.type == "MP1" || dev.type == "MP2")
    {
        for(var i = 2; i <= 4; i++)
        {
            item = {
                id: `plug${i}_${dev.mactxt}`, // id - канала
                mac: dev.mactxt,
                type: dev.devtype,
                name: dev.name,
                ip: dev.host.address,
                model: dev.type,
                desc: "plug",
            };
            channels.push(item);
        }
    }

    if(dev.type == "SP3S")
    {
        item = {
            id: `consumption_${dev.mactxt}`, // id - канала
            mac: dev.mactxt,
            type: dev.devtype,
            name: dev.name,
            ip: dev.host.address,
            model: dev.type,
            desc: "consumption",
        };
        channels.push(item);
    }

    plugin.setChannels(channels);  // передаем масив каналов серверу, всегда должны пердовать полный список каналов.

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
//  plugin.setDeviceValue('00:0a:95:9d:68:18', 0);
//  plugin.setDeviceError('00:0a:95:9d:68:18', 'Device disconnected!');
});

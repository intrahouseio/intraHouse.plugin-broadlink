const Plugin = require('./lib/plugin');

const Broadlink = require('./lib/broadlink');

const plugin = new Plugin();

const brln = new Broadlink();

const channels = [];

/*
плагин можно проверить через эмулятор плагина,
перйдите в корневую папку с плагином и запустите:

cd home/sadm/git/intraHouse.plugin-broadlink
node test/index.js
*/

function createChannel(id, desc, dev) {
  return {
    id: `plug${id}_${dev.mactxt}`,
    mac: dev.mactxt,
    type: dev.devtype,
    name: dev.name,
    ip: dev.host.address,
    model: dev.type,
    desc,
  };
}

function addChannel(dev) {
  channels.push(createChannel('1', 'plug', dev));  // create main channel

  switch (dev.type) {
    case 'MP1':
    case 'MP2':
      channels.push(
        createChannel('2', 'plug', dev),
        createChannel('3', 'plug', dev),
        createChannel('4', 'plug', dev),
      );
      break;
    case 'SP3S':
      channels.push(createChannel('', 'consumption', dev));
      break;
    default:
      break;
  }

  plugin.setChannels(channels);
}


plugin.on('device_action', (device) => {
    plugin.debug(device);
})


brln.on("deviceReady", (dev) => {
    plugin.debug("Found: " + dev.name + ":  " + dev.host.address + " (" + dev.mactxt + ")  /  " + dev.type);

    addChannel(dev);

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

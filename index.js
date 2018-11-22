const Plugin = require('./lib/plugin');


const plugin = new Plugin();


plugin.on('device_action', (device) => {
  plugin.debug(device);
})

plugin.on('toolbar_command', (command) => {
  switch (command.type) {
    case 'DEVICE_SEARCH':

      break;
    default:
      break;
  }
})

plugin.on('start', () => {
  plugin.debug('Hello world!');

  const channels = plugin.getChannels();

  plugin.setDeviceValue('00:0a:95:9d:68:18', 0);
  plugin.setDeviceError('00:0a:95:9d:68:18', 'Device disconnected!');
});

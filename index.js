const Plugin = require('./lib/plugin');


const plugin = new Plugin();


plugin.on('start', () => {
  plugin.debug('Hello world!');

  const channels = plugin.getChannels();
  const settings = plugin.getSettings();

  plugin.setChannels([
    { dn: 'LAMP1', name: '1234'},
    { dn: 'LAMP2', name: '3456'},
  ]);

  plugin.setDeviceValue('LAMP1', 1);
  plugin.setDeviceError('LAMP1', 'Device disconnected!');
});

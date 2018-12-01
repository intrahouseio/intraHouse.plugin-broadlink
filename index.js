const Plugin = require('./lib/plugin');

const Broadlink = require('./lib/broadlink');

const plugin = new Plugin();

const brln = new Broadlink();

const channels = [];
const channelids = {};

/*
плагин можно проверить через эмулятор плагина,
перйдите в корневую папку с плагином и запустите:

cd home/sadm/git/intraHouse.plugin-broadlink
node test/index.js
*/

function createChannel(id, desc, dev)
{
    const devid = `${desc}${id}_${dev.mactxt}`;
    if(!channelids.hasOwnProperty(devid))
    {
        channelids[devid] = dev;
        channels.push({
            id: devid,
            mac: dev.mactxt,
            type: dev.devtype,
            name: dev.name,
            ip: dev.host.address,
            model: dev.type,
            desc,
          });
    }
}

function setChannel(id, desc, dev, val)
{
    const devid = `${desc}${id}_${dev.mactxt}`;
    plugin.setDeviceValue(devid, val);
}

function addChannel(dev) {

  switch (dev.type) {
    case 'MP1':
    case 'MP2':
      createChannel('1', 'plug', dev);
      createChannel('2', 'plug', dev);
      createChannel('3', 'plug', dev);
      createChannel('4', 'plug', dev);
      break;
    case 'SP3S':
      createChannel('', 'consumption', dev);
    case 'SP2':
    case 'SP3':
      createChannel('1', 'plug', dev);
      break;
    default:
      break;
  }

  plugin.setChannels(channels);
}


plugin.on('device_action', (device) => {
    plugin.debug("incomming action: " + device.id + " / " + device.command);
    if(channelids.hasOwnProperty(device.id))
    {
        var sid = 1;
        if(device.desc == 'plug' && parseInt(device.id.substring(4, 5)) > 0)
            sid = parseInt(device.id.substring(4, 5));

        switch (device.command) {
          case 'on':
            if(channelids[device.id].set_power)
                channelids[device.id].set_power(1, sid);
            break;
          case 'off':
            if(channelids[device.id].set_power)
                channelids[device.id].set_power(0, sid);
            break;
          default:
        }

        if(channelids[device.id].check_power)
            channelids[device.id].check_power();
    }
})


brln.on("deviceReady", (dev) => {
    plugin.debug("Found: " + dev.name + ":  " + dev.host.address + " (" + dev.mactxt + ")  /  " + dev.type);

    addChannel(dev);

    dev.on("mp_power", (status_array) => {
      plugin.debug("received 'mp_power' info from: " + dev.mactxt);
      setChannel('1', 'plug', dev, status_array[0]);
      setChannel('2', 'plug', dev, status_array[1]);
      setChannel('3', 'plug', dev, status_array[2]);
      setChannel('4', 'plug', dev, status_array[3]);
    });

    dev.on("power", (pwr) => {
      plugin.debug("received 'power' info from: " + dev.mactxt);
      setChannel('1', 'plug', dev, pwr);
    });

    dev.on("energy", (enrg) => {
      plugin.debug("received 'energy' info from: " + dev.mactxt);
      setChannel('', 'consumption', dev, enrg);
    });

});


plugin.on('toolbar_command', (command) => {
  switch (command.type) {
    case 'DEVICE_SEARCH':
        discoverDevices();
      break;
    default:
      break;
  }
})

function pollDevices()
{
    if(brln && brln.devices)
    {
        for(var mac in brln.devices)
        { 
            if (brln.devices.hasOwnProperty(mac))
            {
                plugin.debug("poll device info: " + mac);
                if(brln.devices[mac].check_power) brln.devices[mac].check_power();
                if(brln.devices[mac].check_energy) brln.devices[mac].check_energy();
            }
        }
    }
    else plugin.debug("No devices present in list...");
/*
    dev.check_power();

    if(dev.type == "SP3S")
        dev.check_energy();
*/
}

function discoverDevices()
{
    plugin.debug("Start devices scaning in local network...");
    if(brln)
    {
        brln.discover();

        setTimeout(function() {
            brln.discover();
        }, 1000);

        setTimeout(function() {
            brln.discover();
        }, 2500);
    }
    else plugin.debug("Broadlink module lost...");
}

plugin.on('start', () => {
    discoverDevices();
    if(plugin.params.period > 0)
        setInterval(pollDevices, plugin.params.period * 1000); // Период задан в сек
});

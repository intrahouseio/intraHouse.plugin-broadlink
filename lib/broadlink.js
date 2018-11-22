var util = require('util');
let EventEmitter = require('events');
let dgram = require('dgram');
let os = require('os');
let crypto = require('crypto');

var Broadlink = module.exports = function() {
    EventEmitter.call(this);
    this.devices = {};
}
util.inherits(Broadlink, EventEmitter);

Broadlink.prototype.getMACtxt = function(mac) {
    var mactxt = "";
    mactxt += (mac[0] & 0xFF).toString(16);
    mactxt += ":" + (mac[1] & 0xFF).toString(16);
    mactxt += ":" + (mac[2] & 0xFF).toString(16);
    mactxt += ":" + (mac[3] & 0xFF).toString(16);
    mactxt += ":" + (mac[4] & 0xFF).toString(16);
    mactxt += ":" + (mac[5] & 0xFF).toString(16);
    return mactxt;
}

Broadlink.prototype.genDevice = function(devtype, host, mac, name) {
    var dev;
    var mactxt = this.getMACtxt(mac);
    if (devtype == 0) { // SP1
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp1();
    } else if (devtype == 0x2711) { // SP2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x2719 ||
               devtype == 0x7919 ||
               devtype == 0x271a ||
               devtype == 0x791a) { // Honeywell SP2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x2720) { // SPMini
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x753e) { // SP3
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x2728) { // SPMini2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x2733 ||
               devtype == 0x273e ||
               devtype == 0x2739 ||
               devtype == 0x274e ||
               devtype == 0x273d ||
               devtype == 0x2736) { // OEM branded SPMini Contros
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x7530 ||
               devtype == 0x7918 ||
               devtype == 0x7549) { // OEM branded SPMini2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x2736) { // SPMiniPlus
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x947c) { // SPMiniPlus2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x7547) { // SC1 WiFi Box
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp2();
    } else if (devtype == 0x947a ||
               devtype == 0x9479) { // SP3S
        dev = new device(host, mac, name, devtype, mactxt);
        dev.sp3s();
    }
    /*else if (devtype == 0x2710) { // RM1
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x2712) { // RM2
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x2737) { // RM Mini
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x27a2) { // RM Mini R2
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x273d) { // RM Pro Phicomm
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x2783) { // RM2 Home Plus
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x277c) { // RM2 Home Plus GDT
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x272a) { // RM2 Pro Plus
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x2787) { // RM2 Pro Plus2
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x279d) { // RM2 Pro Plus3
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x2797) { // RM2 Pro Plus HYC
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x278b) { // RM2 Pro Plus BL
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x27a1) { // RM2 Pro Plus R1
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } else if (devtype == 0x278f) { // RM Mini Shate
           dev = new device(host, mac, name, devtype, mactxt);
           dev.rm();
       } */
    else if (devtype == 0x2714 ||
             devtype == 0x27a3) { // A1
        dev = new device(host, mac, name, devtype, mactxt);
        dev.a1();
    } else if (devtype == 0x4EB5) { // MP1
        dev = new device(host, mac, name, devtype, mactxt);
        dev.mp1();
    } else if (devtype == 0x4F1B ||
               devtype == 0x7540) { // MP2
        dev = new device(host, mac, name, devtype, mactxt);
        dev.mp2();
    }
    else {
        console.log("unknown device found... dev_type: " + devtype.toString(16) + " @ " + host.address);
        return null;
    }
    return dev;
}

Broadlink.prototype.discover = function(local_ip_address) {
    self = this;
    var interfaces = os.networkInterfaces();
    if (local_ip_address) {
        var address = local_ip_address;
    } else {
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        var address = addresses[0];
    }
    var cs = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    cs.on('listening', function() {
        cs.setBroadcast(true);

        var port = cs.address().port;
        var now = new Date();
        var starttime = now.getTime();

        var timezone = now.getTimezoneOffset() / -3600;
        var packet = Buffer.alloc(0x30, 0);

        if (timezone < 0) {
            packet[0x08] = 0xff + timezone - 1;
            packet[0x09] = 0xff;
            packet[0x0a] = 0xff;
            packet[0x0b] = 0xff;
        } else {
            packet[0x08] = timezone;
            packet[0x09] = 0;
            packet[0x0a] = 0;
            packet[0x0b] = 0;
        }
        var year = now.getYear();
        packet[0x0c] = year & 0xff;
        packet[0x0d] = year >> 8;
        packet[0x0e] = now.getMinutes();
        packet[0x0f] = now.getHours();
        var subyear = year % 100;
        packet[0x10] = subyear;
        packet[0x11] = now.getDay();
        packet[0x12] = now.getDate();
        packet[0x13] = now.getMonth();
        var address_parts = address.split('.');
        packet[0x18] = parseInt(address_parts[0]);
        packet[0x19] = parseInt(address_parts[1]);
        packet[0x1a] = parseInt(address_parts[2]);
        packet[0x1b] = parseInt(address_parts[3]);
        packet[0x1c] = port & 0xff;
        packet[0x1d] = port >> 8;
        packet[0x26] = 6;
        var checksum = 0xbeaf;

        for (var i = 0; i < packet.length; i++) {
            checksum += packet[i];
        }
        checksum = checksum & 0xffff;
        packet[0x20] = checksum & 0xff;
        packet[0x21] = checksum >> 8;

        cs.sendto(packet, 0, packet.length, 80, '255.255.255.255');

    });

    cs.on('message', (msg, rinfo) => {
        var host = rinfo;
        var mac = Buffer.alloc(6, 0);
        msg.copy(mac, 0x00, 0x3F);
        msg.copy(mac, 0x01, 0x3E);
        msg.copy(mac, 0x02, 0x3D);
        msg.copy(mac, 0x03, 0x3C);
        msg.copy(mac, 0x04, 0x3B);
        msg.copy(mac, 0x05, 0x3A);

        var devtype = msg[0x34] | msg[0x35] << 8;
        if (!this.devices) {
            this.devices = {};
        }
        var name = "";
        var n = 0;
        while(n < 16)
        {
            if(msg[(0x40+n)] > 20)
                name += String.fromCharCode(msg[(0x40 + n)])
            else n = 99;
            n++;
        }

        if (!this.devices[this.getMACtxt(mac)]) {
            var dev = this.genDevice(devtype, host, mac, name);
            if (dev) {
                this.devices[this.getMACtxt(mac)] = dev;
                dev.on('deviceReady', () => { this.emit('deviceReady', dev); });
                dev.auth();
            }
        }
    });

    cs.on('close', function() {
//        console.log('Scan finished');
    });

    cs.bind(0, address);

    setTimeout(function() {
        cs.close();
    }, 800);
}

function device(host, mac, name, devtype, mactxt, timeout = 10) {
    this.host = host;
    this.mac = mac;
    this.devtype = devtype;
    this.name = name;
    this.mactxt = mactxt;
    this.emitter = new EventEmitter();

    this.on = this.emitter.on;
    this.emit = this.emitter.emit;
    this.removeListener = this.emitter.removeListener;

    this.timeout = timeout;
    this.count = Math.random() & 0xffff;
    this.key = new Buffer.from([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02]);
    this.iv = new Buffer.from([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58]);
    this.id = new Buffer.from([0, 0, 0, 0]);
    this.connected = false;
    this.authorized = 0;
    this.type = "Unknown";
    this.connect();
}

device.prototype.connect = function() {
    var self = this;
    if(this.connected) return;

    this.cs = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.cs.on('listening', function() {
//        console.log('Device [' + self.mactxt + '] CONNECTED');
    });
    this.cs.on("message", (response, rinfo) => {
        var enc_payload = Buffer.alloc(response.length - 0x38, 0);
        response.copy(enc_payload, 0, 0x38);

        var decipher = crypto.createDecipheriv('aes-128-cbc', self.key, self.iv);
        decipher.setAutoPadding(false);
        var payload = decipher.update(enc_payload);
        var p2 = decipher.final();
        if (p2) {
            payload = Buffer.concat([payload, p2]);
        }

        if (!payload) {
            return false;
        }

        var command = response[0x26];
        var err = response[0x22] | (response[0x23] << 8);

        if (err != 0) return;

        if (command == 0xe9) {
            self.key = Buffer.alloc(0x10, 0);
            payload.copy(self.key, 0, 0x04, 0x14);

            self.id = Buffer.alloc(0x04, 0);
            payload.copy(self.id, 0, 0x00, 0x04);

            this.authorized = (Date.now() / 1000);

            self.emit('deviceReady');
        } else if (command == 0xee) {
            self.emit('payload', err, payload);
        }
        else {
            console.log('message');
        }

    });
    this.cs.on('close', function() {
//        console.log('Device [' + self.mactxt + '] disconnected');
        self.connected = false;
    });

    this.cs.bind();
    self.connected = true;
}

device.prototype.auth = function() {
    if (this.authorized < ((Date.now() / 1000) - 24*60*60)) { //Last auth request was >24h ago
        var payload = Buffer.alloc(0x50, 0);
        payload[0x04] = 0x31;
        payload[0x05] = 0x31;
        payload[0x06] = 0x31;
        payload[0x07] = 0x31;
        payload[0x08] = 0x31;
        payload[0x09] = 0x31;
        payload[0x0a] = 0x31;
        payload[0x0b] = 0x31;
        payload[0x0c] = 0x31;
        payload[0x0d] = 0x31;
        payload[0x0e] = 0x31;
        payload[0x0f] = 0x31;
        payload[0x10] = 0x31;
        payload[0x11] = 0x31;
        payload[0x12] = 0x31;
        payload[0x1e] = 0x01;
        payload[0x2d] = 0x01;
        payload[0x30] = 'T'.charCodeAt(0);
        payload[0x31] = 'e'.charCodeAt(0);
        payload[0x32] = 's'.charCodeAt(0);
        payload[0x33] = 't'.charCodeAt(0);
        payload[0x34] = ' '.charCodeAt(0);
        payload[0x35] = ' '.charCodeAt(0);
        payload[0x36] = '1'.charCodeAt(0);

        this.sendPacket(0x65, payload, 1);
    }
}

device.prototype.exit = function() {
    var self = this;
    setTimeout(function() {
        if(self.cs && self.connected)
            self.cs.close();
    }, 500);
}

device.prototype.getType = function() {
    return this.type;
}

device.prototype.sendPacket = function(command, payload, isauthpacket = 0) {

    if(!this.connected)
        this.connect();

    //ReAuthorization if it needed...
    if(!isauthpacket) //protect from infinity loop
        this.auth();

    this.count = (this.count + 1) & 0xffff;
    var packet = Buffer.alloc(0x38, 0);
    packet[0x00] = 0x5a;
    packet[0x01] = 0xa5;
    packet[0x02] = 0xaa;
    packet[0x03] = 0x55;
    packet[0x04] = 0x5a;
    packet[0x05] = 0xa5;
    packet[0x06] = 0xaa;
    packet[0x07] = 0x55;
    packet[0x24] = 0x2a;
    packet[0x25] = 0x27;
    packet[0x26] = command;
    packet[0x28] = this.count & 0xff;
    packet[0x29] = this.count >> 8;
    packet[0x2a] = this.mac[0];
    packet[0x2b] = this.mac[1];
    packet[0x2c] = this.mac[2];
    packet[0x2d] = this.mac[3];
    packet[0x2e] = this.mac[4];
    packet[0x2f] = this.mac[5];
    packet[0x30] = this.id[0];
    packet[0x31] = this.id[1];
    packet[0x32] = this.id[2];
    packet[0x33] = this.id[3];

    var checksum = 0xbeaf;
    for (var i = 0; i < payload.length; i++) {
        checksum += payload[i];
        checksum = checksum & 0xffff;
    }

    var cipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
    payload = cipher.update(payload);
    var p2 = cipher.final();

    packet[0x34] = checksum & 0xff;
    packet[0x35] = checksum >> 8;

    packet = Buffer.concat([packet, payload]);

    checksum = 0xbeaf;
    for (var i = 0; i < packet.length; i++) {
        checksum += packet[i];
        checksum = checksum & 0xffff;
    }
    packet[0x20] = checksum & 0xff;
    packet[0x21] = checksum >> 8;
    this.cs.sendto(packet, 0, packet.length, this.host.port, this.host.address);
}

device.prototype.mp1 = function() {
    this.type = "MP1";

    this.set_power = function(sid, state) {
        //"""Sets the power state of the smart power strip."""
        var sid_mask = 0x01 << (sid - 1);
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0d;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xb2 + (state ? (sid_mask << 1) : sid_mask);
        packet[0x07] = 0xc0;
        packet[0x08] = 0x02;
        packet[0x0a] = 0x03;
        packet[0x0d] = sid_mask;
        packet[0x0e] = state ? sid_mask : 0;

        this.sendPacket(0x6a, packet);
    }

    this.check_power = function() {
        //"""Returns the power state of the smart power strip in raw format."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0a;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xae;
        packet[0x07] = 0xc0;
        packet[0x08] = 0x01;

        this.sendPacket(0x6a, packet);
    }

    this.on('payload', (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                console.log("case 1 -");
                break;
            case 2:
                console.log("case 2 -");
                break;
            case 3:
                console.log("case 3 -");
                break;
            case 4:
                console.log("case 4 -");
                break;
            case 14:
                var s1 = Boolean(payload[0x0e] & 0x01);
                var s2 = Boolean(payload[0x0e] & 0x02);
                var s3 = Boolean(payload[0x0e] & 0x04);
                var s4 = Boolean(payload[0x0e] & 0x08);
                this.emit('mp_power', [s1, s2, s3, s4]);
                break;
            default:
                console.log("case default - " + param);
                break;
        }
    });
}

device.prototype.mp2 = function() {
    this.type = "MP2";

    this.set_power = function(sid, state) {
        //"""Sets the power state of the smart power strip."""
        var sid_mask = 0x01 << (sid - 1);
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0d;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xb2 + (state ? (sid_mask << 1) : sid_mask);
        packet[0x07] = 0xc0;
        packet[0x08] = 0x02;
        packet[0x0a] = 0x03;
        packet[0x0d] = sid_mask;
        packet[0x0e] = state ? sid_mask : 0;

        this.sendPacket(0x6a, packet);
    }

    this.check_power = function() {
        //"""Returns the power state of the smart power strip in raw format."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0a;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xae;
        packet[0x07] = 0xc0;
        packet[0x08] = 0x01;

        this.sendPacket(0x6a, packet);
    }

    this.on('payload', (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                console.log("case 1 -");
                break;
            case 2:
                console.log("case 2 -");
                break;
            case 3:
                console.log("case 3 -");
                break;
            case 4:
                console.log("case 4 -");
                break;
            case 0x1b:
                var s1 = Boolean(payload[0x0e] & 0x01);
                var s2 = Boolean(payload[0x0e] & 0x02);
                var s3 = Boolean(payload[0x0e] & 0x04);
                var s4 = Boolean(payload[0x0e] & 0x08);
                this.emit('mp_power', [s1, s2, s3, s4]);
                break;
            default:
                console.log("case default - " + param);
                break;
        }
    });
}

device.prototype.sp1 = function() {
    this.type = "SP1";
    this.set_power = function(state) {
        var packet = Buffer.alloc(4, 4);
        packet[0] = state;
        this.sendPacket(0x66, packet);
    }
}



device.prototype.sp2 = function() {
    var self = this;
    this.type = "SP2";
    this.set_power = function(state) {
        //"""Sets the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 2;
        packet[4] = state ? 1 : 0;
        this.sendPacket(0x6a, packet);

    }

    this.check_power = function() {
        //"""Returns the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.sendPacket(0x6a, packet);

    }

    this.check_energy = function() {
        //"""Returns the power energy consuming."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x04;
        packet[0x04] = 0xF2;
        packet[0x05] = 0x20;
        packet[0x06] = 0x02;

        this.sendPacket(0x6a, packet);
    }

    this.on('payload', (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1: //get from check_power
                var pwr = Boolean(payload[0x4]);
                this.emit('power', pwr);
                break;
            case 3:
                console.log('case 3');
                break;
            case 4:
                var enrg = (payload[0x4] & 0xFF).toString(16)*100 + (payload[0x5] & 0xFF).toString(16)*1;
                this.emit("energy", enrg);
                break;
        }
    });
}


device.prototype.sp3s = function() {
    var self = this;
    this.type = "SP3S";
    this.set_power = function(state) {
        //"""Sets the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 2;
        packet[4] = state ? 1 : 0;
        this.sendPacket(0x6a, packet);

    }

    this.check_power = function() {
        //"""Returns the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 0x01;
        this.sendPacket(0x6a, packet);

    }

    this.check_energy = function() {
        //"""Returns the power energy consuming."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x08;
        packet[0x02] = 0xFE;
        packet[0x03] = 0x01;
        packet[0x04] = 0x05;
        packet[0x05] = 0x01;
        packet[0x09] = 0x2D;

        this.sendPacket(0x6a, packet);
    }

    this.on("payload", (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1: //get from check_power
                var pwr = Boolean(payload[0x4]);
                this.emit("power", pwr);
                break;
            case 3:
                console.log('case 3');
                break;
            case 4:
                console.log('case 4');
                break;
            case 8:
                var enrg = (payload[0x7] & 0xFF).toString(16)*100 + (payload[0x6] & 0xFF).toString(16)*1;
                this.emit("energy", enrg);
                break;
        }
    });
}

device.prototype.a1 = function() {
    this.type = "A1";
    this.check_sensors = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.raw = false;
        this.sendPacket(0x6a, packet);
    }

    this.decode_payload = function(payload) {
        var temperature = (payload[0x4] * 10 + payload[0x5]) / 10.0;
        var humidity    = (payload[0x6] * 10 + payload[0x7]) / 10.0;
        var light       = payload[0x8];
        var air_quality = payload[0x0a];
        var noise       = payload[0xc];
        return  {temperature: temperature, light: light, air_quality: air_quality,  noise: noise};
    }
    
    this.on('payload', (err, payload) => {

        var info= this.decode_payload(payload);

        this.emit('temperature', info.temperature);
        this.emit('humidity', info.humidity);

        if (this.raw) {
            switch (info.light) {
            case 0:
                info.light = 'dark';
                break;
            case 1:
                info.light = 'dim';
                break;
            case 2:
                info.light = 'normal';
                break;
            case 3:
                info.light = 'bright';
                break;
            default:
                info.light = 'unknown';
            break;
            }

            switch (info.air_quality) {
            case 0:
                info.air_quality = 'excellent';
                break;
            case 1:
                info.air_quality = 'good';
                break;
            case 2:
                info.air_quality = 'normal';
                break;
            case 3:
                info.air_quality = 'bad';
                break;
            default:
                info.air_quality = 'unknown';
            break;
            }
            switch (info.noise) {
            case 0:
                info.noise = 'quiet';
                break;
            case 1:
                info.noise = 'normal';
                break;
            case 2:
                info.noise = 'noisy';
                break;
            default:
                info.noise = 'unknown';
            break;
            }

        }
        this.emit('light', info.light);
        this.emit('air_quality', info.air_quality);

        this.emit('noise', info.noise);
        this.emit('all_info', info)
    });

    this.check_sensors_raw = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.raw = true;
        this.sendPacket(0x6a, packet);
    }
}


device.prototype.rm = function() {
    this.type = "RM2";
    this.checkData = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 4;
        this.sendPacket(0x6a, packet);
    }

    this.sendData = function(data) {
        packet = new Buffer([0x02, 0x00, 0x00, 0x00]);
        packet = Buffer.concat([packet, data]);
        this.sendPacket(0x6a, packet);
    }

    this.enterLearning = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 3;
        this.sendPacket(0x6a, packet);
    }

    this.checkTemperature = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.sendPacket(0x6a, packet);
    }

    this.decodePayload = function(payload) {
        let signalType = payload[0x4].toString(16);
        switch (payload[0x4]) {
            case 0x26:
                signalType = 'ir';
                break;
            case 0xb2:
                signalType = 'ook433';
                break;
            case 0xd7:
                signalType = 'ook315';
                break;
            default:
                signalType = payload[0x4].toString(16);
                break;
        }
        let repeat = payload[0x5];
        let pulseSpaceCount = payload[0x6] | payload[0x7] << 8;
        let psc = (pulseSpaceCount + 8 < payload.length) ? pulseSpaceCount + 8 : payload.length;
        let psValue = [];
        let psCount = [];
        let nPulseSpace = 0;
        for (let i = 8; i < psc; i++) {
            let ps = payload[i];
            if (ps === 0) {  // 0 then big endian 2 bytes
                ps = (payload[i + 1] << 8) | payload[i + 2];
                i += 2;
            }
            let j = psValue.indexOf(ps);
            if (j === -1) {
                //pulseSpace.push(ps); // ms decode
                psValue[nPulseSpace] = ps + 0;
                psCount[nPulseSpace] = 1;
                nPulseSpace++;
            }
            else {
                psCount[j] += 1;
            }
        }
        let pulseSpace = [];
        for (let i = 0; i < psValue.length; i++) {
            pulseSpace[i] = {ps: psValue[i], count: psCount[i], ms: Math.round(psValue[i] * 8192 / 269)};
        }

        pulseSpace.sort((a,b) => a.ps - b.ps);

        let index = 0;
        let psv = psValue[0];
        let psct = 0;
        let i = 0;
        let minGap = (psv < 10) ? 1 : (psv < 100) ? 3 : (psv < 1000) ? 10 : 100;
        let ticks = [];
        let ms = [];
        let counts = [];
        for (; i < pulseSpace.length; i++) {
            if (pulseSpace[i].ps > psv + minGap) {
                pulseSpace[i-1].totalCount = psct;
                ticks.push(pulseSpace[i-1].ps);
                ms.push(pulseSpace[i-1].ms);
                counts.push(pulseSpace[i-1].totalCount);
                index++;
                psct = pulseSpace[i].count;
                psv = pulseSpace[i].ps;
                minGap = (psv < 10) ? 1 : (psv < 100) ? 3 : (psv < 1000) ? 10 : 100;
            }
            else {
                psct += pulseSpace[i].count;
                psv = pulseSpace[i].ps;
            }
            pulseSpace[i] = {ps: pulseSpace[i].ps, count: pulseSpace[i].count, ms: pulseSpace[i].ms, index: index};
        }
        pulseSpace[i-1].totalCount = psct;
        ticks.push(pulseSpace[i-1].ps);
        ms.push(pulseSpace[i-1].ms);
        counts.push(pulseSpace[i-1].totalCount);

        // todo: sort unique values and index them psi
        let pulseSpace2 = '';
        for (let i = 8; i < psc; i++) {
            let ps = payload[i];
            if (ps === 0) { // 0 then big endian 2 bytes
                ps = (payload[i + 1] << 8) | payload[i + 2];
                i += 2;
            }
            let psi = pulseSpace.find((a) => a.ps === ps);
            pulseSpace2 = pulseSpace2 + psi.index.toString(16);
        }
        return  {signalType: signalType, repeat: repeat, count: pulseSpaceCount,
            ticks: ticks,
            counts: counts,
            ms: ms,
            psi: pulseSpace2};
    }

    this.on('payload', (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                var temp = (payload[0x4] * 10 + payload[0x5]) / 10.0;
                this.emit('temperature', temp);
                break;
            case 4: //get from check_data
                /*
                var data = Buffer.alloc(payload.length - 4, 0);
                payload.copy(data, 0, 4);
                */
                var data = this.decodePayload(payload);

                this.emit('rawData', data);
                break;
            case 3:
                break;
            default:
                break;
        }
    });
}
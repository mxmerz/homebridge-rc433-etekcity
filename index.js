const rpi433    = require('rpi-433');
const rfEmitter = rpi433.emitter({pin: 0, pulseLength: 420});

let Service;
let Characteristic;

// command queue
let todoList = [];
let timer    = null;
let timeout  = 450; // timeout between sending rc commands (in ms)

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-rc433-etekcity', 'RC433Switch', RC433Switch);
  homebridge.registerAccessory('homebridge-rc433-etekcity', 'RC433Lightbulb', RC433Lightbulb);
};

class RC433Switch {
  constructor(log, config) {

    // config
    this.name = config['name'];
    this.id = config['id'];
    this.pulse = config['pulse'];
    this.signalOn = config['on'];
    this.signalOff = config['off'];

    // setup
    this.log = log;
    this.service = new Service.Switch(this.name);
    this.setupRcSwitchService(this.service);

    // information service
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Name, 'RC433Switch')
      .setCharacteristic(Characteristic.Manufacturer, 'CN')
      .setCharacteristic(Characteristic.Model, 'Switch ' + this.name)
      .setCharacteristic(Characteristic.SerialNumber, '1337-' + this.id);

  }

  getServices() {
    return [this.informationService, this.service];
  }

  setupRcSwitchService(service) {
    let state = false;

    service
      .getCharacteristic(Characteristic.On)
      .on('set', (value, callback) => {
        state = value;
        var signal;
        if(state) {
          signal = this.signalOn;
        } else {
          signal = this.signalOff;
        }
        todoList.push({
          'signal': signal,
          'callback': callback
        });
        if (timer == null) {
          timer = setTimeout(this.toggleNext, timeout, this);
        }
      });

    service
      .getCharacteristic(Characteristic.On)
      .on('get', (callback) => {
        callback(null, state);
      });
  }

  toggleNext(switchObject) {
    // get next todo item
    var todoItem = todoList.shift();
    var signal = todoItem['signal'];
    var callback = todoItem['callback'];
    // send signal
    rfEmitter.sendCode(signal, function(error, stdout) {
      if(error) {
        console.log('error ' + error);
      } else {
        console.log('success ' + stdout);
      };
    });
    // set timer for next todo
    if (todoList.length > 0) {
      timer = setTimeout(switchObject.toggleNext, timeout, switchObject);
    } else {
      timer = null;
    }
    // call callback
    callback();
  }
}

class RC433Lightbulb {
  constructor(log, config) {

    // config
    this.name = config['name'];
    this.id = config['id'];
    this.pulse = config['pulse'];
    this.signalOn = config['on'];
    this.signalOff = config['off'];

    // setup
    this.log = log;
    this.service = new Service.Lightbulb(this.name);
    this.setupRcSwitchService(this.service);

    // information service
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Name, 'RC433Lightbulb')
      .setCharacteristic(Characteristic.Manufacturer, 'CN')
      .setCharacteristic(Characteristic.Model, 'Lightbulb ' + this.name)
      .setCharacteristic(Characteristic.SerialNumber, '1337-' + this.id);

  }

  getServices() {
    return [this.informationService, this.service];
  }

  setupRcSwitchService(service) {
    let state = false;

    service
      .getCharacteristic(Characteristic.On)
      .on('set', (value, callback) => {
        state = value;
        var signal;
        if(state) {
          signal = this.signalOn;
        } else {
          signal = this.signalOff;
        }
        todoList.push({
          'signal': signal,
          'callback': callback
        });
        if (timer == null) {
          timer = setTimeout(this.toggleNext, timeout, this);
        }
      });

    service
      .getCharacteristic(Characteristic.On)
      .on('get', (callback) => {
        callback(null, state);
      });
  }

  toggleNext(switchObject) {
    // get next todo item
    var todoItem = todoList.shift();
    var signal = todoItem['signal'];
    var callback = todoItem['callback'];
    // send signal
    rfEmitter.sendCode(signal, function(error, stdout) {
      if(error) {
        console.log('error ' + error);
      } else {
        console.log('success ' + stdout);
      };
    });
    // set timer for next todo
    if (todoList.length > 0) {
      timer = setTimeout(switchObject.toggleNext, timeout, switchObject);
    } else {
      timer = null;
    }
    // call callback
    callback();
  }
}

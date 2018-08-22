var arDrone = require('ar-drone');
var keypress = require('keypress');

arDrone.emergency = false;
var control = arDrone.createUdpControl();
control.config('general:navdata_demo', 'TRUE');
var udpNavdataStream = new arDrone.UdpNavdataStream();
udpNavdataStream.resume();

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

udpNavdataStream
  .on('error', (e) => {
    console.log(e);
  })
  .on('navdata', handleNavdata)
  .on('data', handleNavdata);

var ref  = {};
var pcmd = {};

function handleNavdata(navData) {
  if (navData && navData.demo) {
    console.log(navData.demo.batteryPercentage);
  }
}

console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;
setTimeout(function() {
  console.log('Takeoff ...');

  ref.emergency = false;
  ref.fly       = true;

}, 1000);

setTimeout(function() {
  console.log('Turning clockwise ...');

  pcmd.clockwise = 0.5;
}, 6000);

var lastKey = null;
process.stdin.on('keypress', function (ch, key) {
  lastKey = key;
  console.log(key);

  // if (lastKey === '\u0003') {
  //   process.exit();
  // }
});

// setTimeout(function() {
//   console.log('Landing ...');

//   ref.fly = false;
//   pcmd = {};
// }, 8000);

setInterval(function () {
  if (lastKey && lastKey.ctrl && lastKey.name == 'c') {
    console.log('Landing ...');
    ref.fly = false;
    pcmd = {};

    setTimeout(process.exit, 60);
  } else {
    ref.fly = true;
  }

  if (lastKey) {
    switch (lastKey.name) {
      case 'w':
        pcmd = {};
        pcmd.front = 0.5; // fly forward with 50% speed
        break;
      case 'a':
        pcmd = {};
        pcmd.left = 0.5;
        break;
      case 's':
        pcmd = {};
        pcmd.front = -0.5; // fly forward with 50% speed
        break;
      case 'd':
        pcmd = {};
        pcmd.left = -0.5; // fly forward with 50% speed
        break;
      case 'q':
        ref.fly = false;
        pcmd = {};
        break;
      case 'e':
        ref.fly = true;
        pcmd = {};
        break;
      case 'up':
        pcmd = {};
        pcmd.up = 0.5;
        break;
      case 'down':
        pcmd = {};
        pcmd.up = -0.5;
        break;
      case 'left':
        pcmd = {};
        pcmd.clockwise = -0.5;
        break;
      case 'right':
        pcmd = {};
        pcmd.clockwise = 0.5;
        break;
      case 'j':
        pcmd = {};
        control.animate('flipLeft', 16);
        lastKey = 'e';
        break;
      case 'l':
        pcmd = {};
        control.animate('flipRight', 16);
        lastKey = 'e';
        break;
      case 'i':
        pcmd = {};
        control.animate('flipAhead', 16);
        lastKey = 'e';
        break;
      case 'k':
        pcmd = {};
        control.animate('flipBehind', 16);
        lastKey = 'e';
        break;
      default:
        console.log(lastKey);
        pcmd = {};
        break;
    }
  }

  control.ref(ref);
  control.pcmd(pcmd);
  control.flush();
}, 30);
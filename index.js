var arDrone = require('ar-drone');
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

// on any data into stdin
var tookOff = false;
var lastKey = null;
var udpControlled = false;
stdin.on('data', function (key) {
  lastKey = key;

  if (lastKey === '\u0003' && !udpControlled) {
    process.exit();
  }
});

function runScript() {
  console.log("runScript");
  var client = arDrone.createClient();
  client.config('control:altitude_max', 3000);

  client.takeoff();

  client
    .after(5000, function () {
      this.clockwise(0.5);
    })
    .after(3000, function () {
      this.animate('flipLeft', 15);
    })

    .after(1000, function () {
      this.stop();
      this.land();
    });

  // setTimeout(process.exit, 12000);
}

function runUdp() {
  var control = arDrone.createUdpControl();
  // The emergency: true option recovers your drone from emergency mode that can
  // be caused by flipping it upside down or the drone crashing into something.
  // In a real program you probably only want to send emergency: true for one
  // second in the beginning, otherwise your drone may attempt to takeoff again
  // after a crash.

  var ref = {
    fly: true
  };
  var pcmd = {};

  setInterval(() => {
    if (!tookOff && !!lastKey) {
      client.takeoff();
      tookOff = true;
    }

    // ctrl-c ( end of text )
    if (lastKey === '\u0003') {
      console.log('Landing ...');
      ref.fly = false;
      pcmd = {};

      process.exit();
    }

    switch (lastKey) {
      case 'w':
        pcmd.front = 0.5 // fly forward with 50% speed
        pcmd.left = 0;
      case 'a':
        pcmd.front = 0;
        pcmd.left = 0.5;
      case 's':
        pcmd.front = -0.5; // fly forward with 50% speed
        pcmd.left = 0;
      case 'd':
        pcmd.left = -0.5; // fly forward with 50% speed
        pcmd.front = 0;
      break;
    }
    // This causes the actual udp message to be send (multiple commands are
    // combined into one message)
    control.ref(ref);
    // This command makes sure your drone hovers in place and does not drift.
    control.pcmd(pcmd);
    control.flush();
  }, 30);
}

runScript();
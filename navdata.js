var arDrone = require('ar-drone');

var control = arDrone.createUdpControl();
control.config('general:navdata_demo', 'TRUE');
var udpNavdataStream = new arDrone.UdpNavdataStream();
udpNavdataStream.resume();

udpNavdataStream
  .on('error', (e) => {
    console.log(e);
  })
  .on('navdata', handleNavdata)
  .on('data', handleNavdata);

function handleNavdata(navData) {
  console.log("handleNavdata", navData.demo.batteryPercentage);
}


setInterval(function () {
  udpNavdataStream._requestNavdata();
}, 30);

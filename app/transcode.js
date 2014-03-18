var mongoose = require('mongoose');
var ffmpeg = require('fluent-ffmpeg');
var gm = require('gm');

var kue = require('kue')
 , jobs = kue.createQueue(); // for production: {  disableSearch: true }


jobs.process('audio mp3', function(job, done){
  var proc = new ffmpeg({ source: job.data.infile }) /* , nolog: true */
    .withAudioBitrate('196k')
    .withAudioCodec('libmp3lame')
    .withAudioChannels(2)
    .on('end', function() {
      console.log('file has been converted successfully');
      done();
    })
    .on('error', function(err) {
      console.log('encode error: ' + err.message);
      job.log('encode error: ' + err.message);
      done(err);
    })
    .on('progress', function(progress) {
      // The 'progress' event is emitted every time FFmpeg
      // reports progress information. 'progress' contains
      // the following information:
      // - 'frames': the total processed frame count
      // - 'currentFps': the framerate at which FFmpeg is currently processing
      // - 'currentKbps': the throughput at which FFmpeg is currently processing
      // - 'targetSize': the current size of the target file in kilobytes
      // - 'timemark': the timestamp of the current frame in seconds
      // - 'percent': an estimation of the progress
      console.log('Processing', JSON.stringify(progress));
      job.progress(progress.percent, 100);
    })
    .saveToFile(job.data.outfile);
});



var fs = require('fs');
var pkgcloud = require('pkgcloud');
var tmp = require('tmp');



var p = require('./peter'),
  config = p.config;
var client;
if (config.usePkgcloud)
  client = require('pkgcloud').storage.createClient(config.pkgcloudConfig);
console.log(client);

jobs.process('image thumb', function (job, done) {
  console.log('image thumb', job.data);

  tmp.file(function (err, path) {
    if (err) throw err;
    console.log("apapa", path);
    var downloadStream = fs.createWriteStream(path);
    client.download({
      container: job.data.container,
      remote: job.data.filename
    }).pipe(downloadStream);
    downloadStream.on('error', function(err){
      throw new Error(err);
    });
    downloadStream.on('end', function () {
      console.log("here");
      var writeStream = client.upload({
        container: job.data.container,
        remote: path
      });
      gm(path)
        .resize(353, 257)
        .autoOrient()
        .write(writeStream, function (err) {
          if (err) throw err;
          console.log("heaaaaaa", r);
          done(r);
        });
    });
  });
});


jobs.process('image medium', function(job, done){
  console.log(job.data.resource);
  done();
});


jobs.process('image large', function(job, done){
  console.log(job.data.resource);
  done();
});


kue.app.set('title', 'Jobs');
kue.app.listen(3001);

process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});
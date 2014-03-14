var mongoose = require('mongoose');
var ffmpeg = require('fluent-ffmpeg');

var kue = require('kue')
 , jobs = kue.createQueue(); // for production: {  disableSearch: true }

var config = require('./config');
var cms = require('./modules/cms');
var hm = require('./hackettmill')

mongoose.connect(config.mongoConnectString, {}, function (err) {
  if (err) throw err;
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

  cms.init(null, hm.models, hm.workflow.workflow);

  jobs.process('migrate', function(job, done){
    hm.migrate.migrate_data(job, done);
  });


  jobs.process('encode', function(job, done){
    var proc = new ffmpeg({ source: 'out.wav' }) /* , nolog: true */
    //  .withVideoBitrate(1024)
    //  .withVideoCodec('divx')
    //  .withAspect('16:9')
    //  .withSize('50%')
    //  .withFps(24)
    //  .addOption('-vtag', 'DIVX')
    //  .toFormat('avi')
      .withAudioBitrate('128k')
      .withAudioCodec('libmp3lame')
      .withAudioChannels(2)
      .on('end', function() {
        console.log('file has been converted succesfully');
        done();
      })
      .on('error', function(err) {
        console.log('encode error: ' + err.message);
        job.log('encode error: ' + err.message);
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
      .saveToFile('out.mp3');
  })
});



kue.app.set('title', 'Jobs');
kue.app.listen(3001);

process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});
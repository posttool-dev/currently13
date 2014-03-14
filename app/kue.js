var mongoose = require('mongoose');
var ffmpeg = require('fluent-ffmpeg');

var kue = require('kue')
 , jobs = kue.createQueue(); // for production: {  disableSearch: true }


jobs.process('encode mp3', function(job, done){
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



kue.app.set('title', 'Jobs');
kue.app.listen(3001);

process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});
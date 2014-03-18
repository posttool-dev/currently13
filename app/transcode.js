var fs = require('fs');
var tmp = require('tmp');
var uuid = require('node-uuid');
var kue = require('kue');
var mongoose = require('mongoose');
var pkgcloud = require('pkgcloud');
var ffmpeg = require('fluent-ffmpeg');
var gm = require('gm');

// arg 'app name'
var p = require('./peter'), config = p.config;

// requires pkgcloud and kue configs
var client = require('pkgcloud').storage.createClient(config.pkgcloudConfig);
var jobs = kue.createQueue(config.kueConfig);

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


// image resize
resize = function (job, width, height, options, done) {
  tmp.file(function (err, path) {
    if (err) throw err;
    var downloadStream = fs.createWriteStream(path);
    client.download({container: job.data.container, remote: job.data.filename},
      function (err, info) {
        if (err) throw err;
        job.log('download complete', info.size);
        tmp.file(function (err, path2) {
          if (err) throw err;
          var g = gm(path);
          g.resize(width, height, options);
          g.write(path2, function (err) {
            if (err) throw err;
            job.log('convert complete', path2);
            var remote = get_filename(job.data.filename);
            fs.createReadStream(path2).pipe(client.upload({container: job.data.container, remote: remote},
              function () {
                var size = fs.statSync(path2).size;
                job.log('upload complete', path2, size);
                fs.unlink(path, function (err) {
                  if (err) throw err;
                  fs.unlink(path2, function (err) {
                    if (err) throw err;
                    job.log('deleted ' + path + ' ' + path2);
                    job.set('path', remote, function () {
                      job.set('size', size, function () {
                        done();
                      });
                    });
                  })
                });
              }));
          });
        });
      }).pipe(downloadStream);
  });
}

get_filename = function(filename)
{
  var didx = filename.lastIndexOf('.');
  if (didx == -1)
    return filename + uuid.v1();
  else
    return filename.substring(0, didx) + uuid.v1() + filename.substring(didx);
}

jobs.process('image thumb', function (job, done) {
  resize(job, 320, 240, null, done);
});

jobs.process('image medium', function(job, done){
  resize(job, 480, 480, null, done);
});

jobs.process('image large', function(job, done){
  resize(job, 2300, 1500, null, done);
});


kue.app.set('title', 'Jobs');
kue.app.listen(3001);

process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});
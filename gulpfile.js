const gulp        = require('gulp');
const browserSync = require('browser-sync').create();
const sass        = require('gulp-sass');


const gutil       = require( 'gulp-util' );
const ftp         = require( 'vinyl-ftp' );

const concat        = require('gulp-concat');
const rename       = require('gulp-rename');
const minify       = require('gulp-minify');
const minifyJS 	   = require("gulp-uglify");
const gulpUtil       = require('gulp-util');
const sourcemaps   = require('gulp-sourcemaps');



sass.compiler = require('node-sass');

// Compile Sass & Inject Into Browser
gulp.task('sass', function() {
    //return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
    return gulp.src('src/scss/*.scss')
        .pipe(sass())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
});

// Move JS Files to src/js
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/popper.min.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
});



// Move Fonts to src/fonts
gulp.task('fonts', function() {
  return gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('src/fonts'))
})

// Move Font Awesome CSS to src/css
gulp.task('fa', function() {
  return gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('src/css'))
})


// Watch Sass & Serve
gulp.task('serve', ['sass'], function() {

    browserSync.init({
         // type here the URL to your src folder:
         proxy: 'http://localhost/testing/bs4starter/src/',
        port: 8080,
        open: true,
        notify: false
    });


    gulp.watch(['src/scss/*.scss'], ['sass']);

    gulp.watch("src/js/*.js").on('change', browserSync.reload);
    gulp.watch("src/*.html").on('change', browserSync.reload);

    gulp.watch(['src/**/*.php'], browserSync.reload);


});


gulp.task('default', ['sass','js','fonts', 'fa', 'serve']);



//===== FTP =====


/** Configuration **/
var user = 'ftpUSER';
var password = 'ftpPASS';
var host = 'IP';
var port = 21;
var localFilesGlob = ['./src/**/*'];
var remoteFolder = '/public_html/'


// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}
gulp.task('ftp-deploy-watch', function() {

    var conn = getFtpConnection();

    gulp.watch(localFilesGlob)
    .on('change', function(event) {
      console.log('======= Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src( [event.path], { base: './src', buffer: false } )
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});


 gulp.task('deploy', function() {

     var conn = getFtpConnection();

     return gulp.src(localFilesGlob, { base: './src', buffer: false })
         .pipe( conn.newer( remoteFolder ) ) // only upload newer files
         .pipe( conn.dest( remoteFolder ) )
     ;
 });




/**
 * Deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */


/**
 * Watch deploy task.
 * Watches the local copy for changes and copies the new files to the server whenever an update is detected
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy-watch`
 */

var gulp = require('gulp'),
gutil = require('gulp-util'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    partial = require('partial')
    markdown = require('gulp-markdown'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer = require('vinyl-buffer');

var b = browserify({
    entries: './index.es6',
    debug: true
  })
  .transform(babelify);

var watchBuild = function(){
  w = watchify(b);
  w.on("update", partial(updateBundle, w));
  updateBundle(w);
}

var updateBundle = function(b){
  b.bundle()
    .on('error', gutil.log)//.bind(gutil, 'Browserify Error')
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
};

gulp.task('build', partial(updateBundle,b));
gulp.task('watchBuild', watchBuild);
gulp.task('markdown', function(){
  return gulp.src('./**/*.md')
    .pipe(markdown())
    .pipe(rename(function(path){
      path.extname = ".html";
    }))
    .pipe(gulp.dest('.'));
});

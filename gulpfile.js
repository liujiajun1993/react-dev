var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var named = require('vinyl-named');
var connect = require('gulp-connect');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var runSequence = require('run-sequence');
var filter = require('gulp-filter')
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var useref = require('gulp-useref');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var beautify = require('gulp-beautify');

var webpackConfig = require('./webpack.config.js');


var CONFIG = {
   isDebug: false,
   isPreview: false,
   isDeploy: false
};

gulp.task('clean', function(cb){
 return del([
      'dist/**',
      'html/dest/**',
      'image/sprites/**',
      'less/sprite/**',
      'style/**',
      'script/dest/**'
   ], {force: true}, cb);
});

var AUTOPREFIXER_BROWSERS = [
   'chrome >= 34',
   'safari >= 7',
   'opera >= 23',
   'ios >= 7',
   'android >= 4',
   'bb >= 10'
];

gulp.task('less', function(){
   gulp.src('less/**/*.less')
         .pipe(less())
         // .pipe(sourcemaps.init())
         .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
         // .pipe(sourcemaps.write('.'))
         .pipe(gulp.dest('style'))
         .pipe(connect.reload());
});

gulp.task('webpack:dev', function(){
   return gulp.src('script/src/*.js')
      .pipe(named())
      .pipe(webpackStream(webpackConfig))
      .pipe(gulp.dest('script/dest/'))
      .pipe(connect.reload());
});

gulp.task('webpack:deploy', function(){

  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        'NODE_ENV': JSON.stringify('production')
      }
    })
  );

   return gulp.src('script/src/*.js')
      .pipe(named())
      .pipe(webpackStream(myConfig), (err, stats) => {
        if (err){
          console.log('[webpack:build]', stats.toString());
        }
      })
      .pipe(gulp.dest('script/dest/'))
      .pipe(connect.reload());
});

gulp.task('webserver:dev', function(){
   connect.server({
      root: './',
      port: 80,
      livereload: true
   });
});

gulp.task('webserver:deploy', function(){
   connect.server({
      root: './',
      port: 80,
      livereload: false
   });
});

gulp.task('watch', function(){
   gulp.watch('less/**/*.less', ['less']);
   gulp.watch(['script/**/*.@(js|handlebars)', '!script/dest/**/*.js'], ['webpack:dev']);
});

gulp.task('minifyHtml', function() {
   return gulp.src('./html/dest/**/*.html')
           .pipe(htmlmin({
               minifyCSS: true,
               minifyJS: true,
               collapseWhitespace: false
            }))
           .pipe(gulp.dest('dist/html'));
});

// merge multi js/css into one
gulp.task('useref', function() {
   var htmlFilter = filter('**/*.html', { restore: true });
   var jsFilter = filter('**/*.js', { restore: true });

   return gulp.src('html/*.html')
              .pipe(useref({
                 // noAssets: true,
              }))
              .pipe(jsFilter)
              .pipe(gulp.dest('./script'))
              .pipe(jsFilter.restore)
              .pipe(htmlFilter)
              .pipe(gulp.dest('./html/dest'));
});

gulp.task('rev', function(){
   var cssFilter = filter('**/*.css', { restore: true });
   var jsFilter = filter('**/*.js', { restore: true });
   var imageFilter = filter('**/*.png', { restore: true });

   var condition = function () { // TODO: add business logic
      return true;
   }
   // 'script/page/**/*.js', 
   return gulp.src(['style/page/**/*.css', 'script/dest/**/*.js'], {base: '.'})
              .pipe(cssFilter)
              // .pipe(print())
              .pipe(cssmin({
                 keepBreaks: !CONFIG['isDeploy']
              }))
              .pipe(cssFilter.restore)
              .pipe(jsFilter)
              .pipe(gulpif(CONFIG['isDeploy'], uglify({
                 output: {
                    ascii_only: true
                 }
              }), beautify()))
              .pipe(jsFilter.restore)
              // .pipe(imageFilter)
              // .pipe(imagemin())
              // .pipe(size({title: 'source images'}))
              // .pipe(imageFilter.restore)
              .pipe(rev())
              .pipe(gulp.dest('dist'))
              .pipe(rev.manifest())
              .pipe(gulp.dest('dist'));
});

gulp.task('htmlReplace', function(){
  var manifest = gulp.src('./dist/rev-manifest.json');

  return gulp.src('./dist/html/**/*.html', {base: '.'})
             .pipe(revReplace({manifest: manifest}))
             .pipe(gulp.dest('./'));
});

gulp.task('dev', function (done) {
   CONFIG['isDebug'] = true;
   runSequence(
      'clean',
      'less',
      'webpack:dev',
      'webserver:dev',
      'watch',
   done);
});

gulp.task('deploy', function(done){
   CONFIG['isDeploy'] = true;
   runSequence(
      ['clean'],
      ['less'],
      ['webpack:deploy'],
      ['useref'],
      ['minifyHtml'],
      ['rev'],
      ['htmlReplace'],
      ['webserver:deploy'],
   done);
});
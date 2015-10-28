
var gulp = require('gulp');
var less = require('gulp-less');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var browserSync = require('browser-sync');
var childProcess = require('child_process');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');

var paths = {
  jekyll: [
    '_data/*.yml',
    '_includes/*.html',
    '_layouts/*.html',
    '_posts/*.md',
    '*.md',
    '_config.yml',
    '.htaccess'
  ],
  css: [
    'fontello/build/css/fontello.css',
    'css/main.less'
  ],
  fonts: [
    'fontello/build/font/*.*'
  ],
  site: [
    '_site/**/*.*',
    '_site/**/.*'
  ]
};

gulp.task('clean', function(callback) {
  del(['_build/*', '_site/*'], callback)
});


gulp.task('watch', function() {
  gulp.watch(paths.site, ['minify']);
  gulp.watch(paths.jekyll, ['jekyll']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.fonts, ['fonts']);
});

gulp.task('jekyll', function(callback) {
  browserSync.notify('jekyll');
  childProcess.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', callback);
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('_build/font'));
});

gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(less())
    .pipe(concatCss("main.css"))
    .pipe(minifyCss())
    .pipe(gulp.dest('_build/css'))
    .pipe(rev())
    .pipe(gulp.dest('_build/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('_build/css'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('site', [], function() {
  return gulp.src(paths.site)
    .pipe(gulp.dest('_build'))
    //.pipe(browserSync.reload({stream:true}));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src(['images/speakers/*.*']).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  return spriteData.pipe(imagemin())
    .pipe(gulp.dest('images/speakers/sprite'));
});

gulp.task("revreplace", [], function() {
  var manifest = gulp.src('_build/css/rev-manifest.json');
  return gulp.src('_build/**/*.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('_build'))
});

gulp.task('minify', ['site'], function() {
  return gulp.src('_build/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true
    }))
    .pipe(gulp.dest('_build'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('browser-sync', [], function() {
  browserSync({
    server: {
      baseDir: '_build'
    },
    host: "localhost",
    port: 4000
  });
});

gulp.task('default', ['jekyll', 'css', 'fonts', 'sprite'], function() {
  gulp.start('minify', 'watch', 'browser-sync');
});
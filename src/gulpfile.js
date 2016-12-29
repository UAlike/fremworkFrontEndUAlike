//noinspection JSUnresolvedFunction
let gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    gulpsync = $.sync(gulp),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;


useSourceMaps = false;

// Server config
// --------------

let config = {
  server: {
    baseDir: "../."
  },
  host: 'localhost',
  port: 8000,
  logPrefix: ''
};

// MAIN PATHS
let paths = {
  app: '../dist/',
  // markup: 'jade/',
  styles: 'style/',
  components: 'app/',
  img: 'images/',
  fonts: 'fonts/'
};

// SOURCES CONFIG
let source = {
  index: '../',
  // indextemplates: {
  //   index: [paths.components + 'index.*'],
  //   views: [paths.components + '**/*.jade*', '!' + paths.components + 'index.*']
  // },
  styles: {
    app: [paths.styles + '*.*'],
    watch: [paths.styles + '**/*']
  }
};

// Main paths
// ----------



//-- TASKS
//---------------

// Start server
gulp.task('webserver', () => {
  browserSync(config);
});

// App sass
// ---------
gulp.task('styles:app', () => {
  log('Building application styles..');
  return gulp.src(source.styles.app)
    .pipe($.if(useSourceMaps, $.sourcemaps.init()))
    .pipe($.sass())
    .on('error', handleError)
    .pipe($.if(isProduction, $.cssnano(cssnanoOpts)))
    .pipe($.if(useSourceMaps, $.sourcemaps.write()))
    .pipe(gulp.dest(build.styles))
    .pipe(reload({
      stream: true
    }));
});


// WATCH
//---------------

// Rerun the task when a file changes
gulp.task('watch', function() {
  log('Watching source files..');

  //gulp.watch(source.scripts, ['scripts:app']);
  gulp.watch(source.styles.watch, ['styles:app']);
  // gulp.watch(source.templates.views, ['templates:views']);
  // gulp.watch(source.templates.index, ['templates:index']);
  // gulp.watch(source.templates.index, ['image:app']);
  // gulp.watch(source.templates.index, ['fonts:app']);

});

// Serve files with auto reaload
gulp.task('browsersync', function() {
  log('Starting BrowserSync..');

  browserSync({
    notify: false,
    port: 3010,
    server: {
      baseDir: '..'
    }
  });

});
gulp.task('usesources', function() {
  useSourceMaps = true;
});
// Main Tasks
// ----------
gulp.task('assets', [
  //'scripts:app',
  'styles:app'
  //'templates:index',
  //'templates:views',
  //'image:app',
  //'fonts:app'
]);


// default (no minify)
gulp.task('default', gulpsync.sync([
  'webserver',
  'assets',
  'watch'
]));

///////////////////////
// Error handler
//---------------------
function handleError(err) {
  log(err.toString());
  this.emit('end');
}

// log to console using
function log(msg) {
  $.util.log($.util.colors.blue(msg));
}

//noinspection JSUnresolvedFunction
let gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    gulpsync = $.sync(gulp),
    gulpif = require('gulp-if'),
    pug = require('gulp-pug'),
    emitty = require('emitty').setup('template', 'pug'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

// production mode (see build task)
let isProduction = false;

// style source maps
let useSourceMaps = false;

// Server config
// --------------

let config = {
  server: {
    baseDir: "../."
  },
  host: 'localhost',
  port: 8080,
  logPrefix: ''
};

// Main paths
// ----------
let paths = {
  app: '../dist/',
  // markup: 'jade/',
  styles: 'style/',
  components: 'app/',
  img: 'images/',
  fonts: 'fonts/'
};

// Source config
// --------------
let source = {
  index: '../',
  styles: {
    app: [paths.styles + '*.*'],
    watch: [paths.styles + '**/*']
  }
};

// Build target config
// -------------------
let build = {
  styles: paths.app + 'css',
};


// Plugins options
// ---------------
let cssnanoOptions = {
  safe: true,
  discardUnused: false, // no remove @font-face
  reduceIdents: false // no change on @keyframes names
};


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
    .pipe($.if(isProduction, $.cssnano(cssnanoOptions)))
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

  gulp.watch(source.styles.watch, ['styles:app']);
  gulp.watch('template/**/*.pug', ['templates']);

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

gulp.task('templates', () =>
  new Promise((resolve, reject) => {
  emitty.scan(global.changedStyleFile).then(() => {
  gulp.src('template/pages/*.pug')
  .pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
  .pipe(pug({ pretty: true }))
  .pipe(gulp.dest('../'))
  .on('end', resolve)
  .on('error', reject)
  .pipe(reload({
    stream: true
  }));
});
})
);


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

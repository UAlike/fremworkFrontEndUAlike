//noinspection JSUnresolvedFunction
let gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    gulpsync = $.sync(gulp),
    gulpif = require('gulp-if'),
    emitty = require('emitty').setup('template', 'pug'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

// production mode (see build task)
const isProduction = false;

// style source maps
let useSourceMaps = !isProduction;

// Server config
// --------------

let config = {
  server: {
    baseDir: "../dist/"
  },
  host: 'localhost',
  port: 8080,
  logPrefix: ''
};

// Main paths
// ----------
let paths = {
  app: '../dist/',
  template: 'template/',
  styles: 'style/',
  components: 'app/',
  img: 'images/',
  fonts: 'fonts/'
};

// Source config
// --------------
let source = {
  index: '../',
  template: {
    page:     paths.template + 'pages/*.pug',
    watch:    paths.template + '**/*'
  },
  styles: {
    app:    [paths.styles + '*.*'],
    watch:  [paths.styles + '**/*']
  }
};

// Build target config
// -------------------
let build = {
  template:{
    static: paths.app
  },
  styles: paths.app + 'css',
};


// Supported options
// ---------------
let supported = [
  'last 2 versions',
  'safari >= 8',
  'ie >= 10',
  'ff >= 20',
  'ios 6',
  'android 4'
];


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
    .pipe($.if(isProduction, $.cssnano({
      autoprefixer: {browsers: supported, add: true}
    })))
    .pipe($.if(useSourceMaps, $.sourcemaps.write()))
    .pipe(gulp.dest(build.styles))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('templates:static', () => {
  log('Building application static templates..');
  new Promise((resolve, reject) => {
    emitty.scan(global.changedStyleFile).then(() => {
      gulp.src(source.template.page)
        .pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
        .pipe($.pug({ pretty: true }).on('error', handleError))
        .pipe(gulp.dest(build.template.static))
        .on('end', resolve)
        .on('error', reject)
        .pipe(reload({
          stream: true
        }));
    });
  })
});


// WATCH
//---------------

// Rerun the task when a file changes
gulp.task('watch', function() {
  log('Watching source files..');

  gulp.watch(source.styles.watch, ['styles:app']);
  gulp.watch(source.template.watch, ['templates:static']);

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
  'styles:app',
  'templates:static'
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

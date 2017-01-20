//noinspection JSUnresolvedFunction
let gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    gulpsync = $.sync(gulp),
    emitty = require('emitty').setup('template', 'pug'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload

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
  images: 'images/',
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
  },
  images: {
    app: [paths.images + '*.*'],
    sprite: [paths.images + 'sprite/**/*.png']
  }
};

// Build target config
// -------------------
let build = {
  template:{
    static: paths.app
  },
  styles: paths.app + 'css',
  images: paths.app + 'images',
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
    .pipe($.sassGlob())
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

// Images TODO: Need to add images optimization and add watch
// ----------------------------------------------------------
gulp.task('images:app', () => {
  log('Copy all images from root folder');

  return gulp.src(source.images.app)
    .pipe(gulp.dest(build.images));
});

// Sprite images
// -------------
gulp.task('images:sprite', () => {
  log('Bilding Sprite images');

  var spriteData = gulp.src(source.images.sprite).pipe($.spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss'
  }));

  spriteData.img.pipe(gulp.dest(build.images));
  spriteData.css.pipe(gulp.dest(paths.styles + 'modules'));
});

gulp.task('templates:static', () => {
  log('Building application static templates..');
  new Promise((resolve, reject) => {
    emitty.scan(global.changedStyleFile).then(() => {
      gulp.src(source.template.page)
        .pipe($.if(global.watch, emitty.filter(global.emittyChangedFile)))
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
  'images:app',
  'images:sprite',
  'styles:app',
  'templates:static'
  //'templates:index',
  //'templates:views',
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

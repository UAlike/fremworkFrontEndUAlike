//noinspection JSUnresolvedFunction
let gulp = require('gulp'),
  path = require('path'),
  $ = require('gulp-load-plugins')(),
  gulpsync = $.sync(gulp),
  pngquant = require('imagemin-pngquant'),
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
  scripts: 'js/',
  images: 'images/',
  fonts: 'fonts/'
};

// Source config
// --------------
let source = {
  index: '../',
  template: {
    page:     paths.template + '/*.pug',
    watch:    paths.template + '**/*'
  },
  styles: {
    app:    [paths.styles + '*.*'],
    watch:  [paths.styles + '**/*']
  },
  scripts: {
    app : [paths.scripts + '*.js'],
    watch:  [paths.scripts + '**/*']
  },
  images: {
    app: [paths.images + '*.*'],
    sprite: [paths.images + 'sprite/**/*.png'],
    watch: [paths.images + '**/*']
  },
  fonts: {
    app:    [paths.fonts + '**/*'],
    watch:  [paths.fonts + '**/*']
  }
};

// Build target config
// -------------------
let build = {
  template:{
    static: paths.app
  },
  scripts: paths.app + 'js',
  styles: paths.app + 'css',
  images: paths.app + 'images',
  fonts: paths.app + 'fonts'
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


// TASKS
//---------------

// Start server
gulp.task('webserver', () => {
  log('Staring webserver ♥️');
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

// Images optimization and copy to dist
// --------------------------------------
gulp.task('images:app', () => {
  log('Copy all images from root folder');
  return gulp.src(source.images.app)
    .pipe($.imagemin(
      {
        progressive: true,
        use: [pngquant()]
      }
    ))
    .pipe(gulp.dest(build.images))
    .pipe(reload({stream: true}));
});

// Fonts copy
// ----------
gulp.task('fonts:copy', () => {
  log('Copy all fonts');
  return gulp.src(source.fonts.app)
    .pipe(gulp.dest(build.fonts))
    .pipe(reload({stream: true}));
});
// Sprite images
// -------------
gulp.task('images:sprite', () => {
  log('Bilding Sprite images');

  var spriteData = gulp.src(source.images.sprite).pipe($.spritesmith({
    imgName: '../images/sprite.png',
    cssName: '_sprite.scss'
  }));

  spriteData.img.pipe(gulp.dest(build.images));
  spriteData.css.pipe(gulp.dest(paths.styles + 'modules'));
});

// Templates, static
// -----------------
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

gulp.task('js:build', function () {
  log('Optimization JS');
  gulp.src(source.scripts.app)
    .pipe($.concat('scripts.js'))
    .pipe(gulp.dest(build.scripts))
    .pipe($.rename('scripts.min.js'))
    .pipe($.uglify().on('error', handleError))
    .pipe(gulp.dest(build.scripts))
    .pipe(reload({stream: true}));
});

// WATCH
//-------

// Rerun the task when a file changes
gulp.task('watch', function() {
  log('Watching source files...');

  gulp.watch(source.styles.watch, ['styles:app']);
  gulp.watch(source.scripts.watch, ['js:build']);
  gulp.watch(source.template.watch, ['templates:static']);
  gulp.watch(source.fonts.watch, ['fonts:copy']);
  gulp.watch(source.images.watch, ['images:app']);
  gulp.watch(source.images.sprite, ['images:sprite']);

});


gulp.task('usesources', function() {
  useSourceMaps = true;
});

// Main Tasks
// ----------
gulp.task('assets', [
  'images:app',
  'images:sprite',
  'js:build',
  'fonts:copy',
  'styles:app',
  'templates:static'
]);


// default
// -------
gulp.task('default', gulpsync.sync([
  'assets',
  'webserver',
  'watch'
]));

// Error handler
// ---------------
function handleError(err) {
  log(err.toString());
  this.emit('end');
}

// log to console using
function log(msg) {
  $.util.log($.util.colors.blue(msg));
}

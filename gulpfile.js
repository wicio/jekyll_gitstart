var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var concat      = require("gulp-concat");
var plumber     = require("gulp-plumber");
var minify_css  = require("gulp-minify-css");
var uglify      = require("gulp-uglify");
var sourcemaps  = require("gulp-sourcemaps");
var notify      = require("gulp-notify");
var prefix      = require("gulp-autoprefixer");
var imagemin    = require("gulp-imagemin");
var pngquant    = require("imagemin-pngquant");

var src = {
    sass: "assets/css/**/*.sass",
    js: "assets/js/*.js",
    img: "assets/img/*"
};

var dist = {
    js: "_site/assets/js",
    css: "_site/assets/css",
    img: "_site/assets/img"
};



var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
 var onError = function () {
     console.log(err);
     this.emit('end');
 };

gulp.task('sass', function () {
    return gulp.src('assets/css/main.scss')
        .pipe(plumber({
          errorHandler: onError
        }))
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(minify_css())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest('assets/css'))

        //  .pipe(gulp.dest('_site/assets/css'))
        //  .pipe(browserSync.reload({stream:true}))
        //  .pipe(gulp.dest('assets/css'));
});

// Compile JS

gulp.task('js', function () {
    return gulp.src(src.js)
        .pipe(plumber({
            errorHandler: onError
        }))
        // .pipe(jshint())
        // .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('min.js'))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist.js))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// --------------------------------------------
// images

gulp.task('img', function () {
    return gulp.src(src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViemBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dist.img))
});

// --------------------------------------------

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/css/**/', ['sass']);
    gulp.watch(src.js, ['js']);
    gulp.watch(src.img, ['img']);
    gulp.watch(['index.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch', 'sass', 'img', 'js']);

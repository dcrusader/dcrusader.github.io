const gulp = require('gulp');
const terser = require('gulp-terser');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const prefixCss = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const less = require('gulp-less');
const concat = require('gulp-concat');

gulp.task('clean', function () {
    return gulp.src(['./code/scripts/scripts.min.js', './code/content/styles.min.css'], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('css', function () {
    return gulp
        .src(['./src/css/styles.less'])
        .pipe(less())
        .pipe(prefixCss())
        .pipe(cleanCss())
        .pipe(concat("styles.min.css"))
        .pipe(gulp.dest('./gwc/content'))
        .pipe(gulp.dest('./code/content'));
});

gulp.task('vendor-js', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'node_modules/bluebird/js/browser/bluebird.js',
        'node_modules/knockout/build/output/knockout-latest.js',
        'node_modules/underscore/underscore.js',
        'node_modules/moment/moment.js',
        'node_modules/marked/marked.min.js'
    ]).pipe(concat('vendor.min.js'))
    .pipe(terser())
    .pipe(gulp.dest('./gwc/scripts'));
});

gulp.task('js', function () {
    const sources = [
        'src/scripts/**/*.js'
    ];
    return gulp.src(sources)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.min.js'))
        .pipe(terser())
        .pipe(gulp.dest('./gwc/scripts'))
        .pipe(gulp.dest('./code/scripts'));
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*'], gulp.parallel('js', 'css'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('css', 'js', 'vendor-js'), 'watch'));
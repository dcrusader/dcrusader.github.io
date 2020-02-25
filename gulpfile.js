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
        .src(['./code/content/styles.less'])
        .pipe(less())
        .pipe(prefixCss())
        .pipe(cleanCss())
        .pipe(concat("styles.min.css"))
        .pipe(gulp.dest('./code/content'));
});

gulp.task('js', function () {
    const sources = [
        'code/scripts/**/*.js',
        '!code/scripts/**/*.min.js'
    ];
    return gulp.src(sources)
        .pipe(concat('scripts.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(terser())
        .pipe(gulp.dest('./code/scripts'));
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*'], gulp.parallel('js', 'css'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('css', 'js'), 'watch'));
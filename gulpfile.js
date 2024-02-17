'use strict';
import gulp from 'gulp';
import browsersync from 'browser-sync';
import fileinclude from 'gulp-file-include';
import del from 'del';
import clean_css from 'gulp-clean-css';
import rename from 'gulp-rename';
import webp from 'gulp-webp';
import gulpSass from 'gulp-sass';
import sass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import htmlmin from 'gulp-htmlmin';

gulpSass.compiler = sass;

const { src, dest, series, parallel, watch } = gulp;

const project_folder = 'dist';
const source_folder = 'src';

const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/',
        img: project_folder + '/images/',
        js: project_folder + '/js/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css: source_folder + '/**/style.sass',
        img: source_folder + '/images/*.*',
        js: source_folder + '/js/*.js',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/**/*.sass',
        img: source_folder + '/images/*.*',
        js: source_folder + '/js/*.js',
    },
    clean: './' + project_folder + '/'
};

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    });
}

function clean() {
    return del(path.clean);
}

function html() {
    return src('src/*.html')
    .pipe(fileinclude())
     .pipe(htmlmin({ collapseWhitespace: true }))
     .pipe(dest('dist'))
     .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css)
    .pipe(gulpSass({ outputStyle: 'expanded' }))
     .pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'], cascade: true }))
     .pipe(dest(path.build.css))
     .pipe(clean_css())
     .pipe(rename({ extname: '.min.css' }))
     .pipe(dest(path.build.css))
     .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
    .pipe(dest(path.build.js))
     .pipe(uglify())
     .pipe(rename({ extname: '.min.js' }))
     .pipe(dest(path.build.js))
     .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
    .pipe(webp({ quality: 70 }))
     .pipe(dest(path.build.img))
     .pipe(browsersync.stream());
}

function fonts() {
    return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
     .pipe(browsersync.stream());
}

function watchFiles() {
    watch(path.watch.html, html);
    watch(path.watch.css, css);
    watch(path.watch.js, js);
    watch(path.watch.img, images);
}

const build = series(clean, parallel(js, css, html, images, fonts));
const dev = series(build, parallel(watchFiles, browserSync));

export {build, dev}
export default dev;

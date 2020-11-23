let project_folder = require("path").basename(__dirname); // создание папки для выгрузки проекта по имени
let source_folder = "#src"; // путь к исходникам

let fs = require('fs'); // file system для функции fontsStyle

let path = {
    build: { // Папка для выгрузки сборки ВЫГРУЗКА В
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/"
    },
    src: { // Папка откуда подгружаются файлы для сборки ВЫГРУЗКА ИЗ
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // создание исключений для всех файлов с _Name.html
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: { // Наблюдение файлов 
        html: source_folder + "/**/*.html", // "/любые файлы/любое название с расширением.html"
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    clean: "./" + project_folder + "/" // ./dist/
}

let { src, dest } = require('gulp'); // обьявление переменных
    gulp = require('gulp');
    browsersync = require('browser-sync').create(); // синхронизация закладок браузера 
    fileinclude = require('gulp-file-include'); // возможность делать вложенные файлы @@include("_name.html") 
    del = require('del'); // удаление временной сборки /dist/
    scss = require('gulp-sass');
    autoprefixer = require('gulp-autoprefixer');
    group_media = require('gulp-group-css-media-queries');
    clean_css = require('gulp-clean-css');
    rename = require('gulp-rename'); // переименование файла, для создания файлов сжатой и полной css
    uglify = require('gulp-uglify-es').default; // сжатие js файлов
    imagemin = require('gulp-imagemin'); // сжатие картинок
    webp = require('gulp-webp'); // перевод формата картинок в формат webp
    webphtml = require('gulp-webp-html'); // автоподключение webp к html
    webpcss = require('gulp-webpcss') // использование css для webp
    svgSprite = require('gulp-svg-sprite') // создание svg спрайтов
    ttf2woff = require('gulp-ttf2woff'); // конвертирует шрифты из ttf в woff
    ttf2woff2 = require('gulp-ttf2woff2'); // конвертирует шрифты
    fonter = require('gulp-fonter'); // конвертирует шрифты из otf в woff


function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/" // путь открытия
        },
        port: 3000,
        notify: false,  // уведомление о обновлении браузера
    })
}

// Создаем папку и собираем туда файлы
function html() {
    return src(path.src.html) // обращение к исходникам HTML
        .pipe(fileinclude()) // собирает файлы
        .pipe(webphtml()) // упрощает подключение webp файлов к HTML
        .pipe(dest(path.build.html)) // копирование из исходной папки в папку назначения (выгрузка в результат)
        .pipe(browsersync.stream()) // перезагрузка браузера
}

// Копирование файлов css в папку /dist/
function css() {
    return src(path.src.css) // обращение к исходникам CSS
        .pipe(scss({
            outputStyle: "expanded" // файл формируется не сжатым
        }))
        .pipe(group_media()) // собирает медиа-запросы, группирует и ставит в конец файла
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"], // поддержка последних 5 версий браузера
            cascade: true // стиль написания автопрефикса
        }))
        .pipe(webpcss()) // использование css к картинкам.webp 
        .pipe(dest(path.build.css)) // выгрузка файла css перед сжатием
        .pipe(clean_css()) // cжатие файла css
        .pipe(rename({ // после сжатия переименовываем файл {2} 
            extname: ".min.css"
        }))
        .pipe(dest(path.build.css)) // копирование из исходной папки в папку назначения (выгрузка в результат)
        .pipe(browsersync.stream()) // перезагрузка браузера
}

function js() {
    return src(path.src.js) // обращение к исходникам JS
        .pipe(fileinclude()) // собирает файлы
        .pipe(dest(path.build.js)) // выгрузка файла js перед сжатием
        .pipe(uglify()) // сжимаем файл js
        .pipe(rename({ // после сжатия переименовываем файл {2} 
            extname: ".min.js"
        }))
        .pipe(dest(path.build.js)) // копирование из исходной папки в папку назначения (выгрузка в результат)
        .pipe(browsersync.stream()) // перезагрузка браузера
}

function images() {
    return src(path.src.img)
        .pipe(webp({ // перевод в формат webp
            quality: 90
        }))
        .pipe(dest(path.build.img)) // кладем полученный webp в папку
        .pipe(src(path.src.img)) // берем оригинальный файл
        .pipe(imagemin({ // сжимаем
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // уровень сжатия изображений 0 до 7 
        }))
        .pipe(dest(path.build.img)) // кладем сжатый файл в папку
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

// Нужно открыть 2й терминал и вызвать gulp otf2ttf
gulp.task('otf2ttf', function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/')); // выгрузка в исходники
});

// Создание SVG спрайтов - вызов в ТЕРМИНАЛЕ
// Нужно открыть 2й терминал и вызвать gulp svgSprite
gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg", // Вывод готового спрайта
                    //example: true // создает html файл с примерами иконок
                }
            },
        }))
        .pipe(dest(path.build.img)) // выгружаем готовый файл в папку картинок
})

function fontsStyle() { // запись и подключение шрифтов к css
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() { // callback для функции fontsStyle
    
}

// Отслеживание изменений
function watchFiles() {
    gulp.watch([path.watch.html], html) // слежка за html
    gulp.watch([path.watch.css], css) // слежка за css
    gulp.watch([path.watch.js], js) // слежка за js
    gulp.watch([path.watch.img], images) // слежка за картинками
}

function clean() { // удаление временной сборки /dist/ 
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch; // выполняется по умолчанию при запуске Gulp
var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	rootPath = './'
;


// ASSET-LOADER
gulp.task('asset-loader', function() {
	return gulp.src(rootPath + 'asset-loader.js')
		.pipe(uglify({ mangle: true, preserveComments: 'some' }))
		.pipe(rename('asset-loader.min.js'))
		.pipe(gulp.dest(rootPath))
	;
});


// WATCH
gulp.task('watch', function() {
	gulp.watch(rootPath + 'asset-loader.js', ['asset-loader']);
});


// DEFAULT
gulp.task('default', ['watch']);

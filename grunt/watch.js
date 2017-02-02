//
// GRUNT TASK: Watch
// Watch for changes in styles and javascript and compile them on-the-fly
// -----------------

module.exports = {
  options: {
    livereload: true
  },
  styles: {
    files: ['src/stylesheets/**/*.less'],
    tasks: ['less', 'copy:dist']
  },
  js: {
    files: 'src/javascripts/**/*.js',
    tasks: ['neuter', 'copy:dist']
  },
  docs: {
    files: 'src/docs/**/*',
    tasks: ['jekyll']
  }
};

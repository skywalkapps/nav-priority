//
// GRUNT TASK: Uglify
// Minifies compiled javascript
// -----------------

module.exports = {
    options: {
      mangle: false
    },
    plugin: {
      files: {
        'dist/javascripts/<%= package.name %>.min.js': ['dist/javascripts/<%= package.name %>-util.js', 'dist/javascripts/<%= package.name %>.js']
      }
    }
};

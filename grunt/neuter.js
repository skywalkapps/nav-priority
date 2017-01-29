//
// GRUNT TASK: Neuter
// A simple ordered concatenation strategy.
// -----------------

module.exports = {
  plugin: {
    options: {
      // This should be achieved by basePath, but doesn't work for some reason
      filepathTransform: function(filepath){ return 'src/javascripts/' + filepath; },
      template: '{%= src %}'
    },
    dest:'dist/javascripts/<%= package.name %>.js',
    src: 'src/javascripts/app.js'
  },
  util: {
    options: {
      // This should be achieved by basePath, but doesn't work for some reason
      filepathTransform: function(filepath){ return 'src/javascripts/' + filepath; },
      template: '{%= src %}'
    },
    dest:'dist/javascripts/<%= package.name %>-util.js',
    src: 'src/javascripts/util.js'
  }
};

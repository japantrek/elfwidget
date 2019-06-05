(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery', 'summernote'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    require('summernote');
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.extend($.summernote.plugins, {
    'elfinder': function (context) {
      var self = this,
      ui = $.summernote.ui,
      element = context.$note;
      context.memo('button.elfinder', function () {
        var button = ui.button({
          contents: '<i class="fa fa-picture-o"/>',
          tooltip: 'Insert image from ElFinder',
          click: function () {
            if (element.is(':data(jsadmin-elfwidget)')) {
              element.elfwidget('handle');
            } else {
              alert('Elfwidget is not initialized');
            }
          }
        });

        var $elfinder = button.render();

        return $elfinder;
      })

      this.destroy = function () {
        this.$panel.remove();
        this.$panel = null;
      }
    }
  });
}));

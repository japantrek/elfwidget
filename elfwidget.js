(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery', 'jquery-ui'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    require('jquery-ui');
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  window.elfconfig = window.elfconfig || {};
  var insertAtCursor = function (textField, insertion) {
    // IE support
    if (document.selection) {
      textField.focus();
      sel = document.selection.createRange();
      sel.text = insertion;
      // MOZILLA and others
    } else if (textField.selectionStart || textField.selectionStart == '0') {
      var startPos = textField.selectionStart,
      endPos = textField.selectionEnd;

      textField.value = textField.value.substring(0, startPos) + insertion
          + textField.value.substring(endPos, textField.value.length);

      textField.selectionStart = startPos + insertion.length;
      textField.selectionEnd = startPos + insertion.length;
    } else {
      textField.value += insertion;
    }
  },
  getButtonsContainer = function (element) {
    if (!element._btncontainer) {
      var container = $('<div></div>');
      container.css('margin-top', '5px');
      container.insertAfter($(element).is(':data(summernote)') ? $(element).data('summernote').layoutInfo.editor : element);

      element._btncontainer = container.get(0);
    }

    return element._btncontainer;
  }

  $.widget('jsadmin.elfwidget', {
    options: {
      url: null,
      instance: null,
      home: '',
      callback: 'browse',
      target: false
    },

    _getCreateOptions: function () {
      return {
        url: this.element.data('elfUrl') || window.elfconfig.url || '',
        instance: this.element.data('elfInstance') || window.elfconfig.instance || null,
        home: this.element.data('elfHome'),
        callback: this.element.data('elfCallback'),
        target: this.element.data('elfTarget')
      }
    },

    _create: function () {
      var btn, widget = this,
      target = $(this.options.target).length ? $(this.options.target) : this.element;

      if ((this.options.callback == 'browse' || this.options.callback == 'insert')
          && target.is('textarea')
      ) {
        if (target.is(':data(summernote)')) {
          this.options.callback = 'summernote'
        } else if (target.is(':data(cmEditor)')) {
          this.options.callback = 'codemirror'
        } else {
          this.options.callback = 'insert'
        }
      }

      this.handler = this._getHandler(this.options.callback);

      if (this.element.filter('input[type=text]').length) {
        btn = this._createGroupAddonBtn();
      } else if ('summernote' == this.options.callback) {
        var tmpbtn = this._createBtn(),
        tmphandler = this._getHandler('summernoteins');
        $(getButtonsContainer(this.element)).css('margin-top', '-15px');
        tmpbtn.appendTo(getButtonsContainer(this.element));

        tmpbtn.on('click', function (e) {
          e.preventDefault();
          tmphandler();
        });
      } else if (
        ('imagelist' == this.options.callback)
        || this.element.is('textarea')
      ) {
        btn = this._createBtn();
        btn.appendTo(getButtonsContainer(this.element));
      } else {
        btn = this.element;
      }

      if (('insert' == this.options.callback)
        && this.element.is('textarea')
        && $.fn.summernote
      ) {
        var sBtn = this._createBtn('edit');
        sBtn.css('margin-left', '5px');
        sBtn.on('click', function (e) {
          e.preventDefault();

          window.summernote_config = window.summernote_config || {};
          widget.element.summernote(window.summernote_config);

          widget.options.callback = 'summernote';
          widget.handler = widget._getHandler(widget.options.callback);

          var tmpbtn = widget._createBtn(),
          tmphandler = widget._getHandler('summernoteins');
          tmpbtn.on('click', function (e) {
            e.preventDefault();
            tmphandler();
          });

          $(getButtonsContainer(widget.element))
            .empty()
            .css('margin-top', '-15px')
            .append(tmpbtn)
          ;
        });
        sBtn.appendTo(getButtonsContainer(this.element));
      }

      if (btn) {
        var handler = this.handler;
        btn.on('click', function (e) {
          e.preventDefault();
          handler();
        });
      }

      this._refresh();
    },

    _createGroupAddonBtn: function () {
      var btn = this._createBtn();

      this.element.wrap('<div class="input-group"></div>');

      groupBtn = $('<span></span>')
        .addClass('input-group-btn')
        .append(btn);

      groupBtn.insertAfter(this.element);

      return btn;
    },

    _getBtnIcon: function () {
      var icon;

      switch (this.options.callback) {
        case 'browse':
          icon = 'folder-open-o';
          break;
        case 'select':
          icon = 'caret-down';
          break;
        case 'insert':
        case 'summernote':
          icon = 'link';
          break;
        case 'imagelist':
          icon = 'plus-square';
          break;
      }

      return icon;
    },

    _createBtn: function (icon) {
      var icon = icon || this._getBtnIcon(),
      btn = $('<button></button>')
        .addClass('btn btn-default')
        .attr('type', 'button')
        .append(
          $('<i></i>')
            .addClass('fa fa-fw fa-' + icon)
        );

      return btn;
    },

    _getHandler: function (callback) {
      var options = {},
      childWin, cb = false, target = $(this.options.target).length ? $(this.options.target) : this.element, url;

      if (/select|summernote|summernoteins|codemirror|insert|imagelist/.test(callback)) {
        cb = Array(12).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 11);

        window[cb] = function (value, name) {
          if ('select' == callback) {
            target.val(value).trigger('change');
          } else if ('summernote' == callback) {
            target.summernote('insertImage', value, name);
          } else if ('summernoteins' == callback) {
            var codeview = target.summernote('module', 'codeview'),
            codemirror = codeview.$codable.data('cmEditor');
            if (codeview.isActivated() && codemirror) {
              codemirror.replaceSelection(value);
            } else {
              target.summernote('insertText', value);
            }
          } else if ('imagelist' == callback) {
            target.imagelistwidget('add', name, value);
          } else {
            var codemirror = target.data('cmEditor');
            if (codemirror) {
              codemirror.replaceSelection(value);
            } else {
              insertAtCursor(target.get(0), value);
              target.trigger('change');
            }
          }

          childWin.close();
          target.focus();

        }
        options['cb'] = cb;

      }

      var query = Object.keys(options)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(options[k]))
        .join('&'),
      url = this.options.url;
      if (this.options.instance) {
        url += '/'+this.options.instance;
        if (this.options.home) {
          url += '/'+this.options.home;
        }
      }
      if (query) {
        url += '?'+query;
      }

      return function () {
        childWin = window.open(url, 'popupWindow', 'height=450, width=900');

        return childWin;
      };
    },

    _refresh: function () {},

    handle: function () {
      this.handler();
    }
  });

  return $.fn.elfwidget;
}));

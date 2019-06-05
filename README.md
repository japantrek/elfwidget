# Elfwidget plugin
jQuery plugin for elfinder integration and summernote editor plugin

## Installation & configuration

### Basic usage

```js
const $ = require('jquery')
require('elfwidget')

....

$('textarea').elfwidget(options)
```

### Configuration

Global elfwidget configuration
```js
window.elfconfig = {
  url: '/elfinder', // default elfinder url
  instance: 'local' // default elfinder instance
}
```

All options can be provided as keys in options object or *data-* attributes

**url**: Url for elfinder
**instance**: Elfinder instance storage
**callback** *(optional)*: Callback for elfinder
**home** *(optional)*: home directory
**target** *(optional)*: element for callback target. Current element is used by default

### Callbacks
**browse** *(default)*: only opens elfinder  with no selection callback
**select**: replaces target value with selected object uri
**summernote** *(auto used with summernote)*: inserts selected image into summertime editor
**codemirror** *(auto used with codemirror)*: inserts selected object uri into codemirror editor
**insert** *(default for textarea)*: inserts selected object uri into target element
**imagelist**: add image to imagelist widget

For using with summertime elfwidget script must be included _after (!!!)_ summernote library.

## Summernote integration

```js
require('summernote')                    //optional
require('elfwidget/summernote.elfinder') //optional
require('elfwidget')
```

Summernote plugin for inserting image selected from elfinder.

```js
$('textarea')
  .elfwidget(options)
  .summernote()
;
```

If elfwidget detects summernote library it will also add button for creating summernote instance on target textarea if its callback is set to `insert`. Summernote is instantiated with configs in global scope:

```js
window.summernote_config =  {
...
}
```

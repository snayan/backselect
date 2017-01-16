# backselect
select component based on [backbone](https://github.com/jashkenas/backbone)
## Introduction
It is a lightweight, small size and  powerful select component,which is more beautiful than browser select.when changed,it will trigger `changed` event,which arguments will include oldVal,newVal,isDefault.
## Feature
* single select,just like radio
* multiple select,just like checkbox
* customize yourself className to change list item stylesheet
* adaptable width and height
* AMD or CMD support
* ...

## Usage
It is based on backbone. So ,it is depend on [jquery](https://github.com/jquery/jquery),[underscore](https://github.com/jashkenas/underscore),[backbone](https://github.com/jashkenas/backbone).you must install those before using backselect.
if you have installed jquery,underscore,backbone,you can use it,like below
* install it  `npm install backselect`
* include `select.js` and `select.css` in your html.

## Example
you can give options just like `new BackSelect(options)`.

options

* **el** ,just like `Backbone.View` options el ,which define parent element,always be `div`
* **collection** ,just like `Backbone.View` options collection,which must be a `Backbone.Collection` instance,and the model must include **name**,**value** attributes,also can include **className**.The **value** must be uniqued.The **className** will be added into the list item whether which is selected,which can define yourself stylesheet for list item. 
* **itemType** ,select type,must be `backbone_radio` or `backbone_check`.if it is `undefined` or `null`,it is be setted `backbone_radio`.
* **itemCount** ,show item count in a row ,just used  when **itemType** is `backbone_check`.if it is `undefined` or `null`,backselect will compute to adaptable parent element's width.
* **default** ,which item will be selected when initializing.
* **silent** ,if it is true,backselect instance will trigger **changed** event after having gived **default**
* **placeholder** ,just like input element's placeholder,default value `''`
* **empty**, whether show an empty item ,just used when **itemType** is `backbone_radio`,default value `false`
*  **disabled**,whether make backselect disabled,default value `false`

single select

```javascript
var options = {
        el: '#example_01',
        collection: collection,
        placeholder: '请选择级别',
        default: ['1'],
        silent: true,
        empty:true
    };
var roleSelect = new BackSelect(options);
var otherView = new Backbone.View();
otherView.listenTo(roleSelect, 'changed', changed);
```
multiple select

```javascript
var options = {
        el: '#example_01',
        collection: collection,
        placeholder: '请选择级别',
        itemType:'backbone_check',
        default: ['1'],
        silent: true,
    };
var roleSelect = new BackSelect(options);
var otherView = new Backbone.View();
otherView.listenTo(roleSelect, 'changed', changed);
```

## Contributing

I welcome contributions of all kinds from anyone.

* [Bug reports](https://github.com/snayan/backselect/issues) 
* [Feature requests](https://github.com/snayan/backselect/issues)
* [Pull requests](https://github.com/snayan/backselect/pulls)

##Changelog

###v1.0.11

add click text like icon

###v1.0.10

optimize css 

###v1.0.9

add auto height 

###v1.0.8

use base64 to replace image request and remove image 

###v1.0.7

add box-sizing attribute that is content-box

###v1.0.6

add disabled status,then backselect can be disabled by adding `disabled:true` in options or add `disabled` class to its parent element

###v.1.0.5

add bower command,install it using `bower install backselect`.

###v.1.0.4

* fix icon show problem
* fix placeholder problem
* fix problem when mutiple backbone instance open or close at the same time 
* add border color when opening 
* add **all** item when itemType is `backbone_check`
* add **empty** item when itemType is `backbone_radio`
* fix item width problem 
* add title attribute 

###Older releases

These releases were done before starting to maintain the above Changelog:

* [v1.0.3](https://github.com/snayan/backselect/tree/v1.0.3)
* [v1.0.2](https://github.com/snayan/backselect/tree/v1.0.2)
* [v1.0.1](https://github.com/snayan/backselect/tree/v1.0.1)
* [v1.0.0](https://github.com/snayan/backselect/tree/v1.0.0)

## License
Licensed under the MIT License

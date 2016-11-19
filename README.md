# backselect
select component based on backbone
## Introduction
It is a lightweight, small size and  powerful select component,which is more beautiful than browser select.when changed,it will trigger `changed` event,which arguments will include oldVal,newVal,isDefault.
## Surport
* single select,just like radio
* multiple select,just like checkbox
* customize yourself className to change list item stylesheet
* adaptable width and height
* AMD or CMD support
* ...

## Usage
It is based on backbone. So ,it is depend on jquery,underscore,backbone.you must install those before use backselect.
if you have installed jquery,underscore,backbone,you can use it,like below
* you need install it  `npm install backselect`
* you need include `select.js` and `src/select.css` in your html.

## Example
you can just given options just like `new BackSelect(options)`.

options
* **el** ,just like Backbone.View options el ,which define parent element,always be `div`
* **collection** ,just like Backbone.View options collection,which must be a Backbone.Collection instance,and the model must include **name**,**value** attributes.The **value** must be uniqued.
* **itemType** , define select type,must be `backbone_radio` or `backbone_check`.if it is `undefined` or `null`,it is be setted `backbone_radio`.
* **itemCount** ,define show item count in a row ,just used  when **itemType** is `backbone_check`.if it is `undefined` or `null`,backselect will compute to adaptable parent element's width.
* **default** ,define which item will be selected when initializing.
* **silent** ,if it is true,backselect instance will trigger **changed** event after having gived **default**
* **placeholder** ,just like input element's placeholder.

single select
```
var options = {
            el: '#example_01',
            collection: collection,
            placeholder: '请选择级别',
            default: ['1'],
            silent: true,
        };
var roleSelect = new BackSelect(options);
var otherView = new Backbone.View();
otherView.listenTo(roleSelect, 'changed', changed);
```
multiple select
```
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


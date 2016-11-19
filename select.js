/**
 * Created by zhangyang on 16/11/2016.
 */

;(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD (+ global for extensions)
        define(["underscore", "jquery", "backbone"], function (_, $, Backbone) {
            return (root.BackSelect = factory(_, $, Backbone));
        });
    } else if (typeof exports === "object") {
        // CommonJS
        module.exports = factory(require("underscore"), require("jquery"), require("backbone"));
    } else {
        // Browser
        root.BackSelect = factory(root._, root.$, root.Backbone);
    }
})(this, function (_, $, Backbone) {

    var defaults = {
        itemCount: null,//每行显示个数
        itemType: 'backbone_radio',//选择类型，backbone_radio:单选，backbone_check:多选,
        placeholder: '',//同input的placeholder功能
        default: [],//默认值
        silent: false//设置默认值时是否触发改变事件
    };

    var BackSelect = Backbone.View.extend({

        events: {
            'click div.backbone_select': '_dropdown',
            'click li.select_item': '_select'
        },

        initialize: function (options) {
            this.options = options;
            this._initVariable(options);
            this._initInEl();
        },

        render: function () {
            return this;
        },

        //初始化变量
        _initVariable: function (options) {
            this.params = _.extend({}, defaults, _.pick(options, 'itemCount', 'itemType', 'placeholder', 'default', 'silent'));
            this._itemtmp = _.template("<li class='select_item <%= className %> ' data-type='<%= itemType %>'  data-value='<%= value %>' data-name='<%= name %>' ><% if(itemType==='backbone_check') {%><label>&#10003</label><% } %><%= name %></li>");
            this.collection = this.collection.map(function (model) {
                return model.toJSON();
            });
            this._names = [];
            this._values = [];
            this._class = {};
            this._maps = {};

        },

        //初始化元素
        _initInEl: function () {
            this.$inel = $('<div class="backbone_select">');
            this.$el.html(this.$inel);
            this.$inel.append('<img class="xiala" src="src/ic_xiala.png">');
            this.$p = $('<p>');
            this.$inel.append(this.$p);
            var collection = this.collection;
            if (this.params.placeholder) {
                this.$p.html('<span class="placeholder">' + this.params.placeholder + '</span>')
            }
            var $list = $('<ul class="select_list">');
            this.$inel.append($list);
            if (!collection || !collection instanceof Backbone.Collection || !collection.length) {
                return;
            }
            var itemCount = this.params.itemCount,
                total = collection.length,
                maxWidth = 0,
                $item = null,
                tmodel = null;
            for (var i = 0; i < total; i++) {
                tmodel = collection[i];
                if (tmodel.hasOwnProperty('value')) {
                    this._maps[tmodel.value + ''] = tmodel.name;
                }
                if (!tmodel.hasOwnProperty('itemType')) {
                    tmodel.itemType = this.params.itemType;
                }
                if (tmodel.hasOwnProperty('className')) {
                    this._class[tmodel.value + ''] = tmodel.className;
                    tmodel.className = tmodel.itemType + ' ' + tmodel.className;
                } else {
                    tmodel.className = tmodel.itemType;
                }
                $item = $(this._itemtmp(tmodel));
                $list.append($item);
                maxWidth = Math.max(maxWidth, $item.width());
            }
            if (this.params.itemType === 'backbone_radio') {
                $list.css({padding: 0});
                $list.find('li.select_item').width(this.$el.width() - 28);
            } else {
                maxWidth = maxWidth + 10;
                if (!itemCount) {
                    itemCount = Math.floor((this.$el.width() - 30) / maxWidth);
                }
                if (itemCount === 0) {
                    itemCount = 1;
                }
                maxWidth = 100 / itemCount;
                $list.find('li.select_item').width(maxWidth + '%');
            }

            if (this.params.default) {
                this._setValue(this.params.default, this.params.silent, true);
            }

        },

        //设置值
        _setValue: function (vals, silent, isDefault) {
            if (!$.isArray(vals)) {
                vals = [vals];
            }
            vals = vals.filter(function (v) {
                return v !== null && v !== void 0 && this._maps.hasOwnProperty(v);
            }, this);
            if (!vals.length) {
                return;
            }
            var _isRadio = this.params.itemType === 'backbone_radio';
            var _span = _.template('<span class="<%= className %>"><%= name %></span>');
            var _names = this._names,
                _values = this._values,
                old = {
                    names: Array.from(_names),
                    values: Array.from(_values)
                };
            var i, j;
            if (_isRadio) {
                vals = vals.slice(0, 1);
                _names.length = _values.length = 0;
            }
            for (i = 0, j = vals.length; i < j; i++) {
                this._toggle(_values, vals[i] + '', !_isRadio);
                this._toggle(_names, this._maps[vals[i] + ''], !_isRadio);
            }
            this.$p.empty();
            for (i = 0, j = _values.length; i < j; i++) {
                this.$p.append(_span({
                    name: _names[i],
                    className: this.params.itemType + ' ' + (this._class[_values[i]] || '')
                }));
            }
            this.$inel.find('li.select_item').removeClass('selected').filter(function () {
                return ~$.inArray($(this).data('value') + '', _values);
            }).addClass('selected');

            if (!silent) {
                this._triggerChange(old, isDefault);
            }
        },

        //触发改变事件
        _triggerChange: function (old, isDefault) {
            if (old.values.join() !== this._values.join()) {
                var _isRadio = this.params.itemType === 'backbone_radio';
                setTimeout(function () {
                    this.trigger('changed', {
                        name: _isRadio ? old.names[0] : old.names,
                        value: _isRadio ? old.values[0] : old.values
                    }, {
                        name: _isRadio ? this._names[0] : Array.from(this._names),
                        value: _isRadio ? this._values[0] : Array.from(this._values)
                    }, isDefault);
                }.bind(this), 0);
            }
        },

        //显示或隐藏
        _dropdown: function (e) {
            e.preventDefault();
            var $target = $(e.target);
            if ($target.hasClass('select_list')) {
                return false;
            }
            while (!$target.is('body') && !($target.is('div') && $target.hasClass('backbone_select'))) {
                $target = $target.parent();
            }
            if (!$target.is('div') || !$target.hasClass('backbone_select')) {
                return false;
            }
            $target.toggleClass('opened');
            this._listenToBody();
        },

        //内部选择事件
        _select: function (e) {
            e.preventDefault();
            var _isRadio = this.params.itemType === 'backbone_radio';
            var $target = $(e.target);
            if (!_isRadio && !$target.is('label')) {
                return false;
            }
            if (!$target.is('li') || !$target.hasClass('select_item')) {
                $target = $target.parent();
            }
            if (!$target.is('li') || !$target.hasClass('select_item')) {
                return false;
            }
            this._setValue($target.data('value'), false, false);
            if (_isRadio) {
                this.$inel.removeClass('opened');
            }
            return false;
        },

        //body点击事件处理
        _listenToBody: function () {
            var hasDropDown = this.$inel.hasClass('opened');
            if (hasDropDown) {
                $('body').on('click.backbone_select', function (e) {
                    var $target = $(e.target);
                    var isInel = $target.hasClass('backbone_select');
                    while (!isInel && !$target.is('body')) {
                        $target = $target.parent();
                        isInel = $target.hasClass('backbone_select');
                    }
                    if (!isInel) {
                        $('div.backbone_select').removeClass('opened');
                        $('body').off('click.backbone_select')
                    }
                    return false;
                });
            } else {
                $('body').off('click.backbone_select');
            }
        },

        //向数组里增加或减少值
        _toggle: function (list, value, isRemove) {
            var _index = list.indexOf(value);
            if (!~_index) {
                return list.push(value);
            }
            if (!isRemove) {
                return list;
            }
            return list.splice(_index, 1);
        },

        //清空
        clean: function () {
            this.undelegateEvents();
            this.$inel.find('ul.select_list').empty();

            var _names = this._names,
                _values = this._values,
                old = {
                    names: Array.from(_names),
                    values: Array.from(_values)
                };
            _values.length = _names.length = 0;
            this._triggerChange(old, false);
        },

        //移除
        remove: function () {
            this.undelegateEvents();
            Backbone.View.prototype.remove.call(this);
        }

    });

    return BackSelect;
});


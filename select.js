;
(function (root, factory) {
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
        itemCount: null, //每行显示个数
        itemType: 'backbone_radio', //选择类型，backbone_radio:单选，backbone_check:多选,
        placeholder: '', //同input的placeholder功能
        default: null, //默认值
        silent: false, //设置默认值时是否触发改变事件,
        empty: false, //单选时是否加空选择项，默认为false
        disabled: false //是否禁止选择，默认为否
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
            this.params = _.extend({}, defaults, _.pick(options, 'itemCount', 'itemType', 'placeholder', 'default', 'silent', 'empty', 'disabled'));
            this._itemtmp = _.template("<li class='select_item <%= className %> ' data-type='<%= itemType %>'  data-value='<%= value %>' data-name='<%= name %>' ><% if(itemType==='backbone_check') {%><label></label><% } %><%= name %></li>");
            this.collection = this.collection.map(function (model) {
                return model.toJSON();
            });
            this._timestamp = new Date().getTime();
            this._uniqueID = this.cid + '_' + this._timestamp;
            this._allValue = 'all_' + this._timestamp;
            this._names = [];
            this._values = [];
            this._class = {};
            this._maps = {};

        },

        //初始化元素
        _initInEl: function () {
            var _isRadio = this.params.itemType === 'backbone_radio';
            this.$inel = $('<div class="backbone_select" id="' + this._uniqueID + '">');
            this.$el.html(this.$inel);
            //bug:修复图标显示问题，改成$inel的after元素
            // this.$inel.append('<img class="xiala" src="src/ic_xiala.png">');
            //bug:修复增加禁止状态
            if (this.$el.hasClass('disabled') || this.params.disabled) {
                this.$inel.addClass('disabled');
            }
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
            var total = collection.length,
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
            if (_isRadio && this.params.empty) {
                this._maps[''] = '';
                $list.prepend(this._itemtmp({
                    value: null,
                    name: '',
                    itemType: 'backbone_radio',
                    className: 'backbone_radio select_item_empty'
                }))
            }
            if (!_isRadio) {
                // this._maps['all'] = '全选';
                $list.prepend(this._itemtmp({
                    value: this._allValue,
                    name: '全选',
                    itemType: 'backbone_check',
                    className: 'backbone_check select_item_all'
                }))
            }
            if (this.params.default) {
                this._setValue(this.params.default, this.params.silent, true, false);
            }
            this._autoWidth($list, maxWidth);

        },

        //自适应宽度
        _autoWidth: function ($list, maxWidth) {
            var itemCount = this.params.itemCount;
            this.$inel.width(this.$el.width() - 34);
            if (this.params.itemType === 'backbone_radio') {
                $list.css({
                    padding: 0
                });
                $list.find('li.select_item').width(Math.max(maxWidth, this.$el.width() - 30));
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

        },

        //自适应高度
        _autoHeight: function () {
            var _isRadio = this.params.itemType === 'backbone_radio';
            var $list = this.$inel.find('ul.select_list');
            var uTop = $list.offset().top;
            var uHeight = $list.height();
            var tHeight = $('body').get(0).clientHeight;
            var remainHeight = tHeight - uTop - 10;
            if (uHeight > remainHeight) {
                if (!_isRadio) {
                    remainHeight = remainHeight - 22;//减去paddding和border
                }
                $list.height(remainHeight);
            }

        },

        //设置值
        _setValue: function (vals, silent, isDefault, isClickAll) {
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
            if (isClickAll && !this.$inel.find('li.select_item.select_item_all').hasClass('selected')) {
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
            if (!_values.length && this.params.placeholder) {
                this.$p.html('<span class="placeholder">' + this.params.placeholder + '</span>')
            }
            this.$inel.attr('title', _names.join(';'));
            this.$inel.find('li.select_item').removeClass('selected').filter(function () {
                return ~$.inArray($(this).data('value') + '', _values);
            }).addClass('selected');

            if (!_isRadio && _values.length && this.$inel.find('li.select_item.selected').length === Object.keys(this._maps).length) {
                this.$inel.find('li.select_item.select_item_all').addClass('selected');
            }

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
            var _isRadio = this.params.itemType === 'backbone_radio';
            if (this.$inel.hasClass('disabled') || this.params.disabled) {
                return false;
            }
            if ($target.hasClass('select_list')) {
                return false;
            }
            while (!$target.is('body') && !($target.is('div') && $target.hasClass('backbone_select'))) {
                $target = $target.parent();
            }
            if (!$target.is('div') || !$target.hasClass('backbone_select')) {
                return false;
            }
            var style = this.$inel.find('ul.select_list').get(0).style;
            if ($target.hasClass('opened')) {
                style.height = '0';
            } else {
                style.height = 'auto';
            }
            if (_isRadio) {
                style.padding = '0';
            }
            $target.toggleClass('opened');
            this._listenToBody();
            setTimeout(this._autoHeight.bind(this), 0);
        },

        //内部选择事件
        _select: function (e) {
            e.preventDefault();
            var _isRadio = this.params.itemType === 'backbone_radio';
            var $target = $(e.target);
            var val, isClickAll = false;
            if (this.$inel.hasClass('disabled') || this.params.disabled) {
                return false;
            }
            if (!_isRadio && !$target.is('label')) {
                return false;
            }
            if (!$target.is('li') || !$target.hasClass('select_item')) {
                $target = $target.parent();
            }
            if (!$target.is('li') || !$target.hasClass('select_item')) {
                return false;
            }
            val = $target.data('value');
            isClickAll = val === this._allValue;
            if (!_isRadio && isClickAll) {
                val = Object.keys(this._maps);
            }
            this._setValue(val, false, false, isClickAll);
            if (_isRadio) {
                if (this.$inel.hasClass('opened')) {
                    this.$inel.find('ul.select_list').get(0).style.height = "0";
                }
                this.$inel.removeClass('opened');
                this._offToBody();
                setTimeout(this._autoHeight.bind(this), 0);
            }
            return false;
        },

        //body点击事件处理
        _listenToBody: function () {
            var hasDropDown = this.$inel.hasClass('opened');
            var that = this;
            if (hasDropDown) {
                $('body').on('click.' + this._uniqueID, {
                    uniqueID: this._uniqueID
                }, function (e) {
                    var uniqueID = e.data.uniqueID;
                    var $target = $(e.target);
                    var isInel = $target.hasClass('backbone_select');
                    while (!isInel && !$target.is('body')) {
                        $target = $target.parent();
                        isInel = $target.hasClass('backbone_select');
                    }
                    if (!isInel || $target.attr('id') != uniqueID) {
                        var $uniqueID = $('#' + uniqueID);
                        $uniqueID.find('ul.select_list').get(0).style = "0";
                        $uniqueID.removeClass('opened');
                        setTimeout(that._autoHeight.bind(that), 0);
                        $('body').off('click.' + uniqueID);
                    }
                    return false;
                });
            } else {
                this._offToBody();
            }
        },

        //解除body点击事件监听
        _offToBody: function () {
            $('body').off('click.' + this._uniqueID)
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
            this._offToBody();
            this.undelegateEvents();
            Backbone.View.prototype.remove.call(this);
        }

    });

    return BackSelect;
});

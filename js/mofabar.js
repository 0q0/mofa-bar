/**
 * Mofabar.js v1.0.0
 * Licensed under MIT
 */

(function($) {

  $.fn.mofabar = function (options) {

    var defaults = {
      autoHide: true,
      padding: 2,
      initialDisplay: false
    };

    var opts = $.extend(defaults, options);

    return this.each(function () {
      if ($(this).data('mofabar')) {
        $(this).data('mofabar').destroy();
      }

      $(this).data('mofabar', new $.Mofabar(this, opts));
    });

  };

  $.Mofabar = Mofabar;

  /*
   * Mofabar pane constructor.
   *
   * el - 要添加自定义滚动条的面板(pane)元素
   * opts - 选项对象
   */

  function Mofabar (el, opts) {
    this.el = $(el); // $('.box-wrap')
    this.options = opts;

    this.autoHide = this.options.autoHide;
    this.padding = this.options.padding;

    this.inner = this.el.find('.mofabar-inner');
    this.inner.css({
        'width':  '+=' + scrollbarSize(),
        'height': '+=' + scrollbarSize()
    });

    this.refresh();
  };

  /*
   * 刷新滚动条
   */

  Mofabar.prototype.refresh = function() {

    //判断是否需要滚动条
    var needHScroll = this.inner.get(0).scrollWidth > this.el.width() + scrollbarSize(), 
        needVScroll = this.inner.get(0).scrollHeight > this.el.height() + scrollbarSize();

    //横向滚动条
    if (!this.horizontal && needHScroll) { //如果滚动条没有被构造出来，且需要滚动条
      this.horizontal = new Scrollbar.Horizontal(this); //就构造一个滚动条出来
    } else if (this.horizontal && !needHScroll)  { //如果滚动条已经存在并且不需要滚动条
      this.horizontal.destroy(); //就销毁这个滚动条
      this.horizontal = null;
    } else if (this.horizontal) { //如果滚动条已经存在，且需要滚动条
      this.horizontal.update(); //就更新这个滚动条
    }

    //纵向滚动条
    if (!this.vertical && needVScroll) {
      this.vertical = new Scrollbar.Vertical(this);
    } else if (this.vertical && !needVScroll)  {
      this.vertical.destroy();
      this.vertical = null;
    } else if (this.vertical) {
      this.vertical.update();
    }
    
  };

  /*
   * 移除并销毁滚动条
   */

  Mofabar.prototype.destroy = function () {

    if (this.horizontal) {
      this.horizontal.destroy();
      this.horizontal = null
    }

    if (this.vertical) {
      this.vertical.destroy();
      this.vertical = null
    }

    return this;
  };

  /*
   * Scrollbar constructor.
   *
   * pane - 一个 Mofabar 对象
   */

  // 
  function Scrollbar (pane) {
    this.pane = pane;
    this.pane.el.append(this.el); //在.box-wrap(即this.pane.el)后面插入滚动条(即this.el)
    this.innerEl = this.pane.inner.get(0); //$('.mofabar-inner')

    this.dragging = false;
    this.enter = false;
    this.shown = false;

    // hovering
    this.pane.el.mouseenter($.proxy(this, 'mouseenter')); //当.box-wrap发生了mouseenter事件时
    this.pane.el.mouseleave($.proxy(this, 'mouseleave')); //当.box-wrap发生了mouseleave事件时

    // dragging
    this.el.mousedown($.proxy(this, 'mousedown')); //当滚动条上发生了mousedown事件时

    // scrolling
    this.innerPaneScrollListener = $.proxy(this, 'scroll');
    this.pane.inner.scroll(this.innerPaneScrollListener);

    // 该滚动条是否在页面加载时自动显示
    if (this.pane.options.initialDisplay) {
      this.show();
      if (this.pane.autoHide) {
          this.hiding = setTimeout($.proxy(this, 'hide'), 1500);
      }
    }
  };

  /*
   * 移除滚动条，并善后
   */

  Scrollbar.prototype.destroy = function () {
    this.el.remove();
    this.pane.inner.unbind('scroll', this.innerPaneScrollListener);
    return this;
  };

  Scrollbar.prototype.mouseenter = function () {
    this.enter = true;
    this.show();
  };

  Scrollbar.prototype.mouseleave = function () {
    this.enter = false;

    if (!this.dragging) {
        if (this.pane.autoHide) {
            this.hide();
        }
    }
  };

  Scrollbar.prototype.scroll = function () {
    if (!this.shown) {
      this.show();
      if (!this.enter && !this.dragging) {
        if (this.pane.autoHide) {
            //1500ms后隐藏滚动条
            this.hiding = setTimeout($.proxy(this, 'hide'), 1500);
        }
      }
    }

    this.update();
  };

  Scrollbar.prototype.mousedown = function (ev) {
    ev.preventDefault();

    this.dragging = true;

    //发生mousedown事件时鼠标的坐标(相对于文档) - 滚动条已经滚动了的距离
    this.startPageY = ev.pageY - parseInt(this.el.css('top'), 10);
    this.startPageX = ev.pageX - parseInt(this.el.css('left'), 10);

    // IE 下防止拖动选择
    this.el[0].ownerDocument.onselectstart = function () { return false; };

    var move = $.proxy(this, 'mousemove'),
        self = this;

    $('html')
      .mousemove(move)
      .mouseup(function () {
        self.dragging = false;
        this.onselectstart = null;

        $(this).unbind('mousemove', move);

        if (!self.enter) {
          self.hide();
        }
      });
  };

  /*
   * 显示滚动条
   */

  Scrollbar.prototype.show = function () {

    //如果滚动条隐藏中，且有必要显示滚动条(内容区的尺寸大于窗口尺寸)
    if (!this.shown && this.update()) {

      // 为滚动条加一个class
      this.el.addClass('mofabar-scrollbar-shown');

      if (this.hiding) {
        clearTimeout(this.hiding);
        this.hiding = null;
      }

      this.shown = true;
    }

  };

  /*
   * 隐藏滚动条
   */

  Scrollbar.prototype.hide = function () {
    if (this.pane.autoHide && this.shown) {
      this.el.removeClass('mofabar-scrollbar-shown');
      this.shown = false;
    }
  };

  /*
   * 垂直滚动条构造函数
   */

  Scrollbar.Vertical = function (pane) {
    this.el = $('<div class="mofabar-scrollbar mofabar-scrollbar-y"/>', pane.el);
    Scrollbar.call(this, pane);
  };

  /*
   * 继承自 Scrollbar 构造函数
   */

  inherits(Scrollbar.Vertical, Scrollbar);

  /*
   * 更新垂直滚动条的长度和位置
   */

  Scrollbar.Vertical.prototype.update = function () {
    var paneHeight = this.pane.el.height(), 
        trackHeight = paneHeight - this.pane.padding * 2,
        innerEl = this.innerEl;
      
    var scrollbarHeight = trackHeight * paneHeight / innerEl.scrollHeight;
    scrollbarHeight = scrollbarHeight < 20 ? 20 : scrollbarHeight;
    
    var topPos = trackHeight * innerEl.scrollTop / innerEl.scrollHeight;
    
    if((topPos + scrollbarHeight) > trackHeight) {
        var diff = (topPos + scrollbarHeight) - trackHeight;
        topPos = topPos - diff - 3;
    }

    this.el
        .css('height', scrollbarHeight)
        .css('top', topPos);
      
      return paneHeight < innerEl.scrollHeight;
  };


  Scrollbar.Vertical.prototype.mousemove = function (ev) {
    var paneHeight = this.pane.el.height(), //.box-wrap的高度
        trackHeight = paneHeight - this.pane.padding * 2, //滚动条的轨道高度
        pos = ev.pageY - this.startPageY, //滚动条顶部距离导轨顶部的距离
        barHeight = this.el.height(), //滚动条的高度
        innerEl = this.innerEl //.mofabar-inner

    var remainHeight = trackHeight - barHeight;

    //y的值是滚动条顶部距离导轨顶部的距离，并限定了最小值是0，最大值是trackHeight-barHeight
    var y = Math.min(Math.max(pos, 0), remainHeight);

    innerEl.scrollTop = (innerEl.scrollHeight - paneHeight) * y / remainHeight;
  };

  /*
   * 水平滚动条构造函数
   */

  Scrollbar.Horizontal = function (pane) {
    this.el = $('<div class="mofabar-scrollbar mofabar-scrollbar-x"/>', pane.el);
    Scrollbar.call(this, pane);
  };

  /*
   * 继承自 Scrollbar 构造函数
   */

  inherits(Scrollbar.Horizontal, Scrollbar);

  /*
   * 更新水平滚动条的长度和位置
   */

  Scrollbar.Horizontal.prototype.update = function () {
    var paneWidth = this.pane.el.width(), //.box-wrap 的宽度
        trackWidth = paneWidth - this.pane.padding * 2, //横向滚动条的导轨的长度
        innerEl = this.pane.inner.get(0); //$('.mofabar-inner')

    this.el //水平滚动条
        .css('width', trackWidth * paneWidth / innerEl.scrollWidth) //水平滚动条的长度
        .css('left', trackWidth * innerEl.scrollLeft / innerEl.scrollWidth); //水平滚动条的位置

    return paneWidth < innerEl.scrollWidth;
  };


  Scrollbar.Horizontal.prototype.mousemove = function (ev) {
    var trackWidth = this.pane.el.width() - this.pane.padding * 2, 
        pos = ev.pageX - this.startPageX,
        barWidth = this.el.width(),
        innerEl = this.pane.inner.get(0)

    var remainWidth = trackWidth - barWidth;

    var y = Math.min(Math.max(pos, 0), remainWidth);

    innerEl.scrollLeft = (innerEl.scrollWidth - this.pane.el.width()) * y / remainWidth;
  };

  /*
   * 用于继承的函数
   * ctorA 将继承 ctorB
   */

  function inherits (ctorA, ctorB) {
    function f() {};
    f.prototype = ctorB.prototype;
    ctorA.prototype = new f;
  };

  /*
   * 计算滚动条的宽度
   */

  var size;

  function scrollbarSize () {
    if (size === undefined) {
      var div = $(
          '<div class="mofabar-inner" style="width:50px;height:50px;overflow-y:scroll;'
        + 'position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%"/>'
        + '</div>'
      );

      $('body').append(div);
      var w1 = $(div).innerWidth();
      var w2 = $('div', div).innerWidth();
      $(div).remove();

      size = w1 - w2;
    }

    return size;
  };

})(jQuery);

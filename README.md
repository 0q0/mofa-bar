Mofa Bar
========

Mofa Bar 是一个实现自定义滚动条的 jQuery 插件，该插件基于 Guillermo Rauch 的 [Antiscroll](https://github.com/LearnBoost/antiscroll) 修改而来。

##Demo

[戳这里](http://weylin.me/mofa-bar/)

## Quick start

(1) 为页面载入 [jQuery](http://jquery.com/) , mofabar.min.js 和 mofabar.css。

(2) 找到要创建自定义滚动条的可滚动内容，在其外部添加两层 div。外层 div 有一个类 `mofabar-wrap`，内层 div 有一个类 `mofabar-inner`，如下所示：
```HTML
<div class="mofabar-wrap"> <!-- 外层div -->
    <div class="mofabar-inner"> <!-- 内层div -->
        <p>...</p> <!-- 可滚动的内容 -->
    </div>
</div>
```

(3) 载入下面的 JavaScript：
```JavaScript
$(function () {
    $('.mofabar-wrap').mofabar();  
});
```

##Options

可以向 mofabar() 传递一个选项对象：
```JavaScript
$(function () {
    $('.mofabar-wrap').mofabar({
        initialDisplay:true
    });  
});
```

所有选项及其默认值如下：
```JavaScript
{
  autoHide: true, //是否自动隐藏滚动条
  padding: 2, //滚动条导轨的底部到窗口底部的距离(px)
  initialDisplay: false //带自定义滚动条的窗口首次加载时是否显示滚动条
}
```

##Browser support

已测试过的浏览器：IE8+, Chrome, Firefox, Opera

##License

Code released under the MIT license.

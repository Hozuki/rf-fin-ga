import * as FIN from "./index";

// 这一小段代码是为了能在 NW.js 的浏览器环境中方便地跑起来的。如果不想要“FIN”这个名字，修改变量 name 的值就可以了。
(function ($global:any):void {
    const name = "FIN";
    $global[name] = FIN;
})(window || global || self || {});

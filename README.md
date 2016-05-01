# 简述

瑞福你要的东西，大部分完成，剩下要微调。

开发语言是 TypeScript。怎么打开 `.ts` 代码文件？如果要读的话，记事本足够；要写的话，推荐 Notepad++、Sublime Text、Atom 或者 VS Code，有条件推荐用 WebStorm。**不要用记事本直接编辑保存代码**，因为文件编码必须是 UTF-8 without BOM 的（JavaScript 规范）。

# 使用方法

## 编译

1. 下载本工程的[源代码压缩包](https://github.com/Hozuki/rf-fin-ga/archive/master.zip)；
2. 安装 [Node.js](https://nodejs.org/en/)，将 `npm` 加入全局 `PATH` 变量（安装界面会有一个选项，选上就是）；
3. 补全代码；
4. 执行命令：

```bash
cd {项目根路径，也就是 tsconfig.json 所在的路径，不用输入两边的大括号}
npm install
gulp build
```

## 测试

目前使用了 DOM 进行节点可视化，所以必须有一个同时支持标准浏览器和 Node.js 的环境。

下载 [NW.js](http://nwjs.io/)，解压，然后将编译后生成的 `build` 文件夹拖到 NW.js 的 `nw.exe` 上，按下 F12，切换到 JavaScript 控制台，输入：

```javascript
FIN.test();
```

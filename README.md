# 简述

瑞福，这是你要的东西的一个……骨架……

开发语言是 TypeScript。怎么打开 `.ts` 代码文件？如果要读的话，记事本足够；要写的话，推荐 Notepad++、Sublime Text、Atom 或者 VS Code，有条件推荐用 WebStorm。**不要用记事本直接编辑保存代码**，因为文件编码必须是 UTF-8 without BOM 的（JavaScript 规范）。

由于我对金融真的是一窍不通，所以只好只把算法的意思写出来了，一些看得莫名其妙的东西就没写（比如，时间序列是对谁的序列啊）。

要补充完整的是如下的函数：

1. `FinNode.ts`-`computeOpBool()`，这个函数处理逻辑运算符的计算结果。
2. `FinNode.ts`-`computeOpNumber()`，这个函数处理数字运算符的计算结果。比如原文的 `Lag` 函数，在这个方法中 `op`=`FinOp.Lag`，`leftChild.value.number` 是年份(?)数，这样一个意思。
3. `FinTree.ts`-`FinTree.measureFitness()`，这个函数计算一棵树的适应度。这个适应度应该是最大收益率之类的，总之可以通过 `FinNode` 的两个函数算出来。
4. `GA.ts`-`GA.makePopulation()`，这个函数生成初始种群。我已经给 `FinNode` 类写了一些辅助方法，可以快速生成树上的节点。不过问题是，要的种群中个体的叶子节点的值应该是什么？复杂度多高？

# 使用方法

## 编译

1. 下载本工程的[源代码压缩包](https://github.com/Hozuki/rf-fin-ga/archive/master.zip)；
2. 安装 [Node.js](https://nodejs.org/en/)，将 `npm` 加入全局 `PATH` 变量（安装界面会有一个选项，选上就是）；
3. 补全代码；
4. 执行命令：

```cmd
cd {项目根路径，也就是 tsconfig.json 所在的路径，不用输入两边的大括号}
npm install
gulp build
```

## 测试

如果你喜欢命令行，在编译之后的状态下使用这个命令：

```cmd
node build/node/test.js
```

如果你喜欢稍微好看一点的交互，可以先下载 [NW.js](http://nwjs.io/)，解压，然后将编译后生成的 `build` 文件夹拖到 NW.js 的 `nw.exe` 上，按下 F12，切换到 JavaScript 控制台，输入：

```javascript
FIN.GA.simulateOneTrial();
```

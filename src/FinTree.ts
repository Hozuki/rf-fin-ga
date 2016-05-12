import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";
import {Helper} from "./Helper";
import {ModelParams} from "./ModelParams";
import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";
import {ArgumentOutOfRangeError} from "./ArgumentOutOfRangeError";

/**
 * 表示一棵树。
 */
export class FinTree {

    /**
     * 创建一棵新的树。
     * @param modelParams {ModelParams} 模型参数。
     */
    constructor(modelParams:ModelParams) {
        this._modelParams = modelParams;
        this._decisions = new Array<boolean>(modelParams.periodLength + 1);
        for (var i = 0; i < this._decisions.length; ++i) {
            this._decisions[i] = false;
        }
    }

    /**
     * 获取这棵树的根节点。
     * @returns {FinNode}
     */
    get root():FinNode {
        return this._root;
    }

    /**
     * 设置这棵树的根节点。
     * @param v {FinNode}
     */
    set root(v:FinNode) {
        this._root = v;
    }

    /**
     * 计算这棵树的适应度。
     * @returns {Number}
     */
    measureFitness():number {
        // 适应度每次计算都需要比较长的时间，而如果树不变则适应度不变，所以此处设计了一个缓存，第二次查询适应度的时候就直接返回之前计算的结果。
        if (!this._isFitnessMeasured) {
            for (var i = 0; i < this._decisions.length; ++i) {
                this._decisions[i] = this.__computeDay(i);
            }
            this._fitness = this.__computeGain();
            this._isFitnessMeasured = true;
        }
        return this._fitness;
    }

    /**
     * 判断这棵树内有没有一个能代替指定节点的节点。“可代替”的原则是两个节点的返回类型兼容。
     * @param node {FinNode} 要被代替的节点。
     * @returns {Boolean}
     */
    canFindReplacementOf(node:FinNode):boolean {
        var type = Helper.getNodeReturnType(node);
        this.__ensureNodeQueueBuilt();
        for (var i = 0; i < this._nodeQueue.length; ++i) {
            // 如果树中某个节点和准备被代替的节点返回类型兼容，按位与后不为零
            if ((Helper.getNodeReturnType(this._nodeQueue[i]) & type) !== 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取这棵树的某个子节点在树的节点队列中的索引。不可以获取根节点的索引。
     * @param node {FinNode} 待检测的节点。
     * @returns {Number}
     */
    getNodeIndex(node:FinNode):number {
        this.__ensureNodeQueueBuilt();
        return this._nodeQueue.indexOf(node);
    }

    /**
     * 获取在这棵树的节点队列中指定索引位置处的节点。
     * @param index {Number} 节点索引。
     * @returns {FinNode}
     */
    getNode(index:number):FinNode {
        this.__ensureNodeQueueBuilt();
        return this._nodeQueue[index];
    }

    /**
     * 检查一棵树是否符合（人为指定的）生成规则。该函数在生成种群时用作个体过滤。
     * @returns {Boolean}
     */
    checkValidity():boolean {
        /**
         * 这不是一个有效的数字类型。
         * @type {Number}
         */
        const NUMERIC_ERR:number = 0;
        /**
         * 这是一个汇率。
         * @type {Number}
         */
        const NUMERIC_RATE:number = 1;
        /**
         * 这是一个常数。
         * @type {Number}
         */
        const NUMERIC_CONST:number = 2;

        // 在阈值限制下（100个）生成完成，而且不超过10层
        var b1 = this.isComplete && this.maxDepth <= 10;
        if (!b1) {
            return false;
        }

        // 量纲检查。规则：
        // 乘法必须有一边是常数，一边是函数（lag/min等等）或当前汇率（简称：汇率）
        // 除法的除数必须是常数，被除数必须是汇率
        // 加减两边必须是汇率（*存疑）
        // 大于/小于两边必须是汇率
        // Norm两边必须是汇率
        if (!checkNodeValidity(this.root)) {
            return false;
        }
        this.__ensureNodeQueueBuilt();
        var q = this._nodeQueue;
        for (var i = 0; i < q.length; ++i) {
            if (!checkNodeValidity(q[i])) {
                return false;
            }
        }

        return true;

        /**
         * 承担实际检测任务的函数，检查每个返回类型为数字的节点的类型（常数或时间为一类，汇率为一类）是否符合要求。
         * （注：JavaScript 的函数定义是很自由的，可以在函数A内定义函数B，则在不使用闭包的情况下，函数B只在函数A中可见。）
         * @param node {FinNode} 待检测的节点。
         * @returns {Boolean}
         */
        function checkNodeValidity(node:FinNode):boolean {
            if (node.type === FinNodeType.Op) {
                var leftType:number, rightType:number, centerType:number;
                switch (node.value.op) {
                    case FinOp.Plus:
                    case FinOp.Minus:
                    case FinOp.Greater:
                    case FinOp.Less:
                    case FinOp.Norm:
                        leftType = identifyNumericNodeType(node.lChild);
                        rightType = identifyNumericNodeType(node.rChild);
                        return leftType === NUMERIC_RATE && rightType === NUMERIC_RATE;
                    case FinOp.Times:
                        leftType = identifyNumericNodeType(node.lChild);
                        rightType = identifyNumericNodeType(node.rChild);
                        return (leftType === NUMERIC_RATE && rightType === NUMERIC_CONST) || (leftType === NUMERIC_CONST && rightType == NUMERIC_RATE);
                    case FinOp.Divide:
                        leftType = identifyNumericNodeType(node.lChild);
                        rightType = identifyNumericNodeType(node.rChild);
                        return leftType === NUMERIC_RATE && rightType === NUMERIC_CONST;
                    case FinOp.Average:
                    case FinOp.Max:
                    case FinOp.Min:
                    case FinOp.Lag:
                        // max/min/average/lag 在生成节点的时候已经立即生成了常数子节点，安全性有保证。
                        return true;
                    case FinOp.And:
                    case FinOp.Or:
                    case FinOp.Not:
                        return true;
                    case FinOp.IfThen:
                    case FinOp.IfThenElse:
                        throw new NotImplementedError();
                    default:
                        throw new ArgumentOutOfRangeError();
                }
            } else {
                return true;
            }
        }

        /**
         * 判断节点返回的数字值类型是常数、汇率或无效。
         * @param node {FinNode} 待检测的节点。
         * @returns {Number}
         */
        function identifyNumericNodeType(node:FinNode):number {
            if (node.type === FinNodeType.Number) {
                return NUMERIC_CONST;
            } else if (node.type === FinNodeType.CurVal) {
                return NUMERIC_RATE;
            } else if (node.type === FinNodeType.Op) {
                switch (node.value.op) {
                    case FinOp.Plus:
                    case FinOp.Minus:
                    case FinOp.Times:
                    case FinOp.Divide:
                    case FinOp.Norm:
                    case FinOp.Average:
                    case FinOp.Max:
                    case FinOp.Min:
                    case FinOp.Lag:
                        return NUMERIC_RATE;
                    case FinOp.And:
                    case FinOp.Or:
                    case FinOp.Not:
                    case FinOp.Greater:
                    case FinOp.Less:
                    case FinOp.IfThen:
                    case FinOp.IfThenElse:
                        return NUMERIC_ERR;
                }
            } else {
                return NUMERIC_ERR;
            }
        }
    }

    /**
     * 从这棵树中随机抽取出一个节点。根节点不会被抽到。
     * @returns {FinNode}
     */
    selectRandomNode():FinNode {
        this.__ensureNodeQueueBuilt();
        var q = this._nodeQueue;
        var selectedIndex = (Math.random() * q.length) | 0;
        return q[selectedIndex];
    }

    /**
     * 根据这棵树的适应度函数计算这棵树在杂交时被选中的权重。
     */
    calculateRankWeight():void {
        this.__ensureFitnessMeasured();
        // this._rankWeight = Math.exp(this._fitness);
        var fitness = this._fitness;
        if (fitness < 0) {
            this._rankWeight = Math.pow(1.001, fitness);
        } else {
            this._rankWeight = 1 + Math.log(fitness + 1) / Math.log(2);
        }
    }

    /**
     * 获取这棵树的权重值。
     * @returns {Number}
     */
    get rankWeight():number {
        return this._rankWeight;
    }

    /**
     * 获取这棵树历史上的决策（长期为 true，短期为 false）。
     * @returns {Boolean[]}
     */
    get decisions():boolean[] {
        return this._decisions;
    }

    /**
     * 获取历史汇率。
     * @returns {Number[]}
     */
    get historicalExchangeRate():number[] {
        return this._modelParams.historicalExchangeRate;
    }

    /**
     * 获取这棵树的适应度。
     * @returns {Number}
     */
    get fitness():number {
        return this._fitness;
    }

    /**
     * 获取这棵树是否完整。
     * @returns {Boolean}
     */
    get isComplete():boolean {
        return this._isComplete;
    }

    /**
     * 设置这棵树是否完整。（内部使用）
     * @param v {Boolean}
     */
    set isComplete(v:boolean) {
        this._isComplete = v;
    }

    /**
     * 获取这棵树的最大深度。
     * @returns {Number}
     */
    get maxDepth():number {
        return this._maxDepth;
    }

    /**
     * 设置这棵树的最大深度。（内部使用）
     * @param v {Number}
     */
    set maxDepth(v:number) {
        this._maxDepth = v;
    }

    /**
     * 在一个 {@link HTMLElement} 上画出该 {@link FinTree} 的示意结构。
     * @param container {HTMLElement} 绘制容器。
     */
    draw(container:HTMLElement):void {
        while (container.childNodes.length > 0) {
            container.removeChild(container.childNodes[0]);
        }
        var fragment = window.document.createDocumentFragment();
        this.__drawNode(this.root, fragment);
        container.appendChild(fragment);
    }

    /**
     * 绘制一个节点。
     * @param node {FinNode} 待绘制的节点。
     * @param element {Node} 父元素。
     * @param [extra] {String} 附加信息。
     * @private
     */
    private __drawNode(node:FinNode, element:Node, extra?:string):void {
        var div = <HTMLDivElement>window.document.createElement("div");
        div.style.marginLeft = ((node.depth - 1) * 15).toString() + "px";
        if (extra) {
            var bold = window.document.createElement("strong");
            bold.textContent = extra;
            div.appendChild(bold);
        }
        var spanText = "type: " + FinNodeType[node.type];
        switch (node.type) {
            case FinNodeType.Op:
                spanText += ` (op: ${FinOp[node.value.op]})`;
                break;
            case FinNodeType.Number:
                spanText += ` (value: ${node.value.number})`;
                break;
            case FinNodeType.Bool:
                spanText += ` (value: ${node.value.bool})`;
                break;
        }
        var span = <HTMLSpanElement>document.createElement("span");
        span.textContent = spanText;
        div.appendChild(span);
        element.appendChild(div);
        if (node.lChild) {
            this.__drawNode(node.lChild, element, "(left) ");
        }
        if (node.cChild) {
            this.__drawNode(node.cChild, element, "(center) ");
        }
        if (node.rChild) {
            this.__drawNode(node.rChild, element, "(right) ");
        }
    }

    /**
     * 确保调用该函数后，就存在构造完成的节点队列。
     * @private
     */
    private __ensureNodeQueueBuilt():void {
        if (!this._isNodeQueueBuilt) {
            this.__buildNodeQueue();
        }
    }

    /**
     * 没有计算适应度时计算适应度。
     * @private
     */
    private __ensureFitnessMeasured():void {
        if (!this._isFitnessMeasured) {
            this.measureFitness();
        }
    }

    /**
     * 构造节点队列。
     * @private
     */
    private __buildNodeQueue():void {
        // 广度遍历生成一个节点选择表
        // 第一层（根节点）永远不会去动它（废话，动了的话整棵树都变成另一棵了）
        var q:FinNode[] = [];
        var node = this.root;
        if (node.lChild !== null) {
            q.push(node.lChild);
        }
        if (node.rChild !== null) {
            q.push(node.rChild);
        }
        if (node.cChild !== null) {
            q.push(node.cChild);
        }
        // 这里也遍历后来添加进去的叶子节点，用时间换空间，这样就不需要准备一个结果队列了。
        var i = 0;
        while (i < q.length) {
            node = q[i];
            if (node.lChild !== null) {
                q.push(node.lChild);
            }
            if (node.rChild !== null) {
                q.push(node.rChild);
            }
            if (node.cChild !== null) {
                q.push(node.cChild);
            }
            ++i;
        }
        this._nodeQueue = q;
        this._isNodeQueueBuilt = true;
    }

    /**
     * 计算某日的投资倾向。
     * @param day {Number} 要计算第几天。
     * @returns {Boolean}
     * @private
     */
    private __computeDay(day:number):boolean {
        return this.root.computeBool(day + this._modelParams.startDay);
    }

    /**
     * 计算总收益。
     * @returns {Number}
     * @private
     */
    private __computeGain():number {
        var decisions = this._decisions;
        var R = new Array<number>(decisions.length);
        var S = this._modelParams.historicalExchangeRate;
        var its = this._modelParams.historicalForeignInterestRate;
        var it = this._modelParams.historicalDomesticInterestRate;
        this._R = R;
        for (var t = 0; t < decisions.length - 1; ++t) {
            if (decisions[t]) {
                // long
                R[t + 1] = (S[t + 1] * (1 + its[t])) / (S[t] * (1 + it[t]));
            } else {
                // short
                R[t + 1] = 2 - (S[t + 1] * (1 + its[t])) / (S[t] * (1 + it[t]));
            }
        }
        var r = new Array<number>(decisions.length);
        this._r = r;
        for (var t = 0; t < decisions.length - 1; ++t) {
            r[t] = Math.log(S[t + 1]) - Math.log(S[t]) + Math.log(1 + its[t]) - Math.log(1 + it[t]);
        }
        var result = 0;
        for (var t = 0; t < decisions.length - 1; ++t) {
            result += (decisions[t] ? 1 : -1) * r[t];
        }
        return result;
    }

    private _modelParams:ModelParams = null;
    private _root:FinNode = null;
    private _decisions:boolean[] = null;
    private _nodeQueue:FinNode[] = null;
    private _isNodeQueueBuilt:boolean = false;
    private _isFitnessMeasured:boolean = false;
    private _rankWeight:number = 0;
    private _fitness:number = 0;
    private _maxDepth:number = 0;
    private _isComplete:boolean = false;
    private _R:number[] = null;
    private _r:number[] = null;

}

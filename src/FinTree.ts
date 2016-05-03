import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";
import {Helper} from "./Helper";
import {ModelParams} from "./ModelParams";
import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";
import {InvalidOperationError} from "./InvalidOperationError";
import {ArgumentOutOfRangeError} from "./ArgumentOutOfRangeError";

export class FinTree {

    constructor(modelParams:ModelParams) {
        this._modelParams = modelParams;
        // TODO:第0天怎么办？
        this._decisions = new Array<boolean>(modelParams.periodLength + 1);
        for (var i = 0; i < this._decisions.length; ++i) {
            this._decisions[i] = false;
        }
    }

    get root():FinNode {
        return this._root;
    }

    set root(v:FinNode) {
        this._root = v;
    }

    measureFitness():number {
        if (!this._isFitnessMeasured) {
            for (var i = 0; i < this._decisions.length; ++i) {
                this._decisions[i] = this.computeDay(i);
            }
            this._fitness = this.computeGain();
            this._isFitnessMeasured = true;
        }
        return this._fitness;
    }

    canFindReplacementOf(node:FinNode):boolean {
        var type = Helper.getNodeReturnType(node);
        this.ensureNodeQueue();
        for (var i = 0; i < this._nodeQueue.length; ++i) {
            if ((Helper.getNodeReturnType(this._nodeQueue[i]) & type) !== 0) {
                return true;
            }
        }
        return false;
    }

    getNodeIndex(node:FinNode):number {
        this.ensureNodeQueue();
        return this._nodeQueue.indexOf(node);
    }

    getNode(index:number):FinNode {
        this.ensureNodeQueue();
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
        this.ensureNodeQueue();
        var q = this._nodeQueue;
        for (var i = 0; i < q.length; ++i) {
            if (!checkNodeValidity(q[i])) {
                return false;
            }
        }

        return true;

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

    selectRandomNode():FinNode {
        this.ensureNodeQueue();
        var q = this._nodeQueue;
        var selectedIndex = (Math.random() * q.length) | 0;
        return q[selectedIndex];
    }

    calculateRankWeight():void {
        this.ensureFitnessMeasured();
        // this._rankWeight = Math.exp(this._fitness);
        var fitness = this._fitness;
        if (fitness < 0) {
            this._rankWeight = Math.pow(1.001, fitness);
        } else {
            this._rankWeight = 1 + Math.log(fitness + 1) / Math.log(2);
        }
    }

    get rankWeight():number {
        return this._rankWeight;
    }

    get decisions():boolean[] {
        return this._decisions;
    }

    get historicalExchangeRate():number[] {
        return this._modelParams.historicalExchangeRate;
    }

    get fitness():number {
        return this._fitness;
    }

    get isComplete():boolean {
        return this._isComplete;
    }

    set isComplete(v:boolean) {
        this._isComplete = v;
    }

    get maxDepth():number {
        return this._maxDepth;
    }

    set maxDepth(v:number) {
        this._maxDepth = v;
    }

    draw(container:HTMLElement):void {
        while (container.childNodes.length > 0) {
            container.removeChild(container.childNodes[0]);
        }
        var fragment = window.document.createDocumentFragment();
        this.drawNode(this.root, fragment);
        container.appendChild(fragment);
    }

    private drawNode(node:FinNode, element:Node, extra?:string):void {
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
            this.drawNode(node.lChild, element, "(left) ");
        }
        if (node.cChild) {
            this.drawNode(node.cChild, element, "(center) ");
        }
        if (node.rChild) {
            this.drawNode(node.rChild, element, "(right) ");
        }
    }

    private ensureNodeQueue():void {
        if (!this._isNodeQueueBuilt) {
            this.buildNodeQueue();
        }
    }

    private ensureFitnessMeasured():void {
        if (!this._isFitnessMeasured) {
            this.measureFitness();
        }
    }

    private buildNodeQueue():void {
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

    private computeDay(day:number):boolean {
        return this.root.computeBool(day + this._modelParams.startDay);
    }

    private computeGain():number {
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
                // R[t + 1] = S[t + 1] / S[t];
            } else {
                // short
                R[t + 1] = 2 - (S[t + 1] * (1 + its[t])) / (S[t] * (1 + it[t]));
                // R[t + 1] = 2 - S[t + 1] / S[t];
            }
        }
        var r = new Array<number>(decisions.length);
        this._r = r;
        for (var t = 0; t < decisions.length - 1; ++t) {
            r[t] = Math.log(S[t + 1]) - Math.log(S[t]) + Math.log(1 + its[t]) - Math.log(1 + it[t]);
            // r[t] = Math.log(S[t + 1]) - Math.log(S[t]);
        }
        var S = this._modelParams.historicalExchangeRate;
        var result = 0;
        for (var t = 0; t < decisions.length - 1; ++t) {
            // c=0, n*ln((1+c)/(1-c))=0
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

import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";
import {Helper} from "./Helper";
import {ModelParams} from "./ModelParams";
import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";

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
            if (Helper.getNodeReturnType(this._nodeQueue[i]) & type) {
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

    selectRandomNode():FinNode {
        this.ensureNodeQueue();
        var q = this._nodeQueue;
        var selectedIndex = (Math.random() * q.length) | 0;
        return q[selectedIndex];
    }

    calculateRankWeight():void {
        this.ensureFitnessMeasured();
        this._rankWeight = Math.exp(this._fitness);
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
                //R[t + 1] = (S[t + 1] * (1 + its[t])) / (S[t] * (1 + it[t]));
                R[t + 1] = S[t + 1] / S[t];
            } else {
                // short
                //R[t + 1] = 2 - (S[t + 1] * (1 + its[t])) / (S[t] * (1 + it[t]));
                R[t + 1] = 2 - S[t + 1] / S[t];
            }
        }
        var r = new Array<number>(decisions.length);
        this._r = r;
        for (var t = 0; t < decisions.length - 1; ++t) {
            //r[t] = Math.log(S[t + 1]) - Math.log(S[t]) + Math.log(1 + its[t]) - Math.log(1 + it[t]);
            r[t] = Math.log(S[t + 1]) - Math.log(S[t]);
        }
        var S = this._modelParams.historicalExchangeRate;
        var result = 0;
        for (var t = 0; t < decisions.length - 1; ++t) {
            // c=0, n*ln((1+c)/(1-c))=0
            //result += (decisions[t] ? 1 : -1) * r[t];
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
    private _isComplete:boolean = false;
    private _R:number[] = null;
    private _r:number[] = null;

}

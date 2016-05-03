import {FinNodeType} from "./FinNodeType";
import {FinNodeValue} from "./FinNodeValue";
import {FinOp} from "./FinOp";
import {Helper} from "./Helper";
import {InvalidOperationError} from "./InvalidOperationError";
import {NotImplementedError} from "./NotImplementedError";
import {ICloneable} from "./ICloneable";
import {FinTree} from "./FinTree";
import {ArgumentOutOfRangeError} from "./ArgumentOutOfRangeError";

/**
 * 值的存放位置：
 * 一个孩子：左子树
 * 两个孩子：左子树、右子树
 * 三个孩子：中子树(if)、左子树(then)、右子树(else)
 *
 * 如果我没猜错的话，这棵树只有最多上面两层是逻辑，下面都是数值。下面的代码是根据这个猜想写的。
 */
export class FinNode implements ICloneable<FinNode> {

    constructor(tree:FinTree, parent:FinNode, type:FinNodeType, value:FinNodeValue) {
        this._parent = parent;
        this._type = type;
        this._value = value;
        this._tree = tree;
        this._depth = parent !== null ? parent.depth + 1 : 1;
        if (this._depth > tree.maxDepth) {
            tree.maxDepth = this._depth;
        }
    }

    get parent():FinNode {
        return this._parent;
    }

    set parent(v:FinNode) {
        this._parent = v;
    }

    get lChild():FinNode {
        return this._lChild;
    }

    set lChild(v:FinNode) {
        this._lChild = v;
    }

    get rChild():FinNode {
        return this._rChild;
    }

    set rChild(v:FinNode) {
        this._rChild = v;
    }

    get cChild():FinNode {
        return this._cChild;
    }

    set cChild(v:FinNode) {
        this._cChild = v;
    }

    get value():FinNodeValue {
        return this._value;
    }

    get type():FinNodeType {
        return this._type;
    }

    get tree():FinTree {
        return this._tree;
    }

    get depth():number {
        return this._depth;
    }

    get childCount():number {
        var count = 0;
        this.lChild !== null && count++;
        this.rChild !== null && count++;
        this.cChild !== null && count++;
        return count;
    }

    get shouldHaveChild():boolean {
        return this.type === FinNodeType.Op;
    }

    /**
     *
     * @example
     * var newNumberNode = FinNode.createNumber(someParentNode, 100);
     * someParentNode.lChild = newNumberNode;
     * @param tree
     * @param parent
     * @param value
     * @returns {FinNode}
     */
    static createNumber(tree:FinTree, parent:FinNode, value:number):FinNode {
        return new FinNode(tree, parent, FinNodeType.Number, {number: value});
    }

    static createBool(tree:FinTree, parent:FinNode, value:boolean):FinNode {
        return new FinNode(tree, parent, FinNodeType.Bool, {bool: value});
    }

    static createCurVal(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.CurVal, null);
    }

    static createPlus(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Plus});
    }

    static createMinus(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Minus});
    }

    static createTimes(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Times});
    }

    static createDivide(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Divide});
    }

    static createNorm(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Norm});
    }

    static createAverage(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Average});
    }

    static createMax(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Max});
    }

    static createMin(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Min});
    }

    static createLag(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Lag});
    }

    static createAnd(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.And});
    }

    static createOr(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Or});
    }

    static createNot(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Not});
    }

    static createGreater(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Greater});
    }

    static createLess(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Less});
    }

    static createIfThen(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.IfThen});
    }

    static createIfThenElse(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.IfThenElse});
    }

    computeBool(day:number):boolean {
        switch (this.type) {
            case FinNodeType.Bool:
                return this.value.bool;
            case FinNodeType.Number:
                console.warn("[FN] Warning: Number->Bool conversion happened.");
                return Helper.bool(this.value.number);
            case FinNodeType.Op:
                return computeOpBool(this, day, this.value.op);
            case FinNodeType.CurVal:
                console.warn("[FN] Warning: CurVal->Bool conversion happened.");
                return Helper.bool(this.value.number);
        }
    }

    computeNumber(day:number):number {
        switch (this.type) {
            case FinNodeType.Bool:
                console.warn("[FN] Warning: Bool->Number conversion happened.");
                return Helper.number(this.value.bool);
            case FinNodeType.Number:
                return this.value.number;
            case FinNodeType.Op:
                return computeOpNumber(this, day, this.value.op);
            case FinNodeType.CurVal:
                return this.tree.historicalExchangeRate[day];
        }
    }

    clone():FinNode {
        var lChild = this.lChild !== null ? this.lChild.clone() : null;
        var rChild = this.rChild !== null ? this.rChild.clone() : null;
        var cChild = this.cChild !== null ? this.cChild.clone() : null;
        var n = new FinNode(this.tree, this.parent, this.type, this.cloneValue());
        n.lChild = lChild;
        n.rChild = rChild;
        n.cChild = cChild;
        return n;
    }

    private cloneValue():FinNodeValue {
        return this.value ? {
            number: this.value.number,
            bool: this.value.bool,
            op: this.value.op
        } : null;
    }

    private _parent:FinNode = null;
    private _lChild:FinNode = null;
    private _rChild:FinNode = null;
    private _cChild:FinNode = null;
    private _type:FinNodeType = FinNodeType.Number;
    private _value:FinNodeValue = null;
    private _tree:FinTree = null;
    private _depth:number = 0;

}

function computeOpBool(node:FinNode, day:number, op:FinOp):boolean {
    var leftNode = node.lChild, rightNode = node.rChild, centerNode = node.cChild, tree = node.tree;
    switch (op) {
        case FinOp.Plus:
        case FinOp.Minus:
        case FinOp.Times:
        case FinOp.Divide:
        case FinOp.Norm:
        case FinOp.Average:
        case FinOp.Max:
        case FinOp.Min:
        case FinOp.Lag:
            throw new InvalidOperationError();
        case FinOp.And:
            return leftNode.computeBool(day) && rightNode.computeBool(day);
        case FinOp.Or:
            return leftNode.computeBool(day) || rightNode.computeBool(day);
        case FinOp.Not:
            return !leftNode.computeBool(day);
        case FinOp.Greater:
            return leftNode.computeNumber(day) > rightNode.computeNumber(day);
        case FinOp.Less:
            return leftNode.computeNumber(day) < rightNode.computeNumber(day);
        case FinOp.IfThen:
            // 不确定
            if (leftNode.computeBool(day)) {
                return rightNode.computeBool(day);
            } else {
                // 另一侧难道就没有值了？怎么处理的？
                return true;
            }
        case FinOp.IfThenElse:
            // 不确定
            if (centerNode.computeBool(day)) {
                return leftNode.computeBool(day);
            } else {
                return rightNode.computeBool(day);
            }
    }
}

function computeOpNumber(node:FinNode, day:number, op:FinOp):number {
    var leftNode = node.lChild, rightNode = node.rChild, centerNode = node.cChild, tree = node.tree;
    var val:number;
    switch (op) {
        case FinOp.Plus:
            return leftNode.computeNumber(day) + rightNode.computeNumber(day);
        case FinOp.Minus:
            return leftNode.computeNumber(day) - rightNode.computeNumber(day);
        case FinOp.Times:
            return leftNode.computeNumber(day) * rightNode.computeNumber(day);
        case FinOp.Divide:
            return leftNode.computeNumber(day) / rightNode.computeNumber(day);
        case FinOp.Norm:
            return Math.abs(leftNode.computeNumber(day) - rightNode.computeNumber(day));
        case FinOp.Average:
            val = Math.round(leftNode.computeNumber(day));
            return average(tree, day, val);
        case FinOp.Max:
            val = Math.round(leftNode.computeNumber(day));
            return max(tree, day, val);
        case FinOp.Min:
            val = Math.round(leftNode.computeNumber(day));
            return min(tree, day, val);
        case FinOp.Lag:
            val = Math.round(leftNode.computeNumber(day));
            return lag(tree, day, val);
        case FinOp.And:
        case FinOp.Or:
        case FinOp.Not:
            throw new InvalidOperationError();
        case FinOp.Greater:
        case FinOp.Less:
            throw new InvalidOperationError();
        case FinOp.IfThen:
        case FinOp.IfThenElse:
            throw new InvalidOperationError();
    }
}

function average(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[AVG] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[AVG] length (${length}) > day (${day})`);
    }
    var total = 0;
    // TODO: 以下的准则也要根据 historicalExchangeRate[0] 的意义而变
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        total += history[i];
    }
    return total / length;
}

function max(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[MAX] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[MAX] length (${length}) > day (${day})`);
    }
    var arr:number[] = [];
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        arr.push(history[i]);
    }
    return Math.max.apply(null, arr);
}

function min(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[MIN] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[MIN] length (${length}) > day (${day})`);
    }
    var arr:number[] = [];
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        arr.push(history[i]);
    }
    return Math.min.apply(null, arr);
}

function lag(tree:FinTree, day:number, length:number):number {
    if (length <= 0) {
        console.warn(`[LAG] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[LAG] length (${length}) > day (${day})`);
    }
    if (length > day) {
        throw new ArgumentOutOfRangeError(undefined, "length");
    } else {
        return tree.historicalExchangeRate[day - length];
    }
}

import {FinNodeType} from "./FinNodeType";
import {FinNodeValue} from "./FinNodeValue";
import {FinOp} from "./FinOp";
import {Helper} from "./Helper";
import {InvalidOperationError} from "./InvalidOperationError";
import {ICloneable} from "./ICloneable";
import {FinTree} from "./FinTree";
import {ArgumentOutOfRangeError} from "./ArgumentOutOfRangeError";

/**
 * 树上的节点。
 * @example
 * var node = FinNode.createNumber(tree, parent, 0);
 * parent.lChild = node;
 */
export class FinNode implements ICloneable<FinNode> {

    /**
     * 创建一个新节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @param type {FinNodeType} 节点类型。
     * @param value {FinNodeValue} 节点值。
     */
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

    /**
     * 获取该节点的父节点。
     * @returns {FinNode}
     */
    get parent():FinNode {
        return this._parent;
    }

    /**
     * 设置该节点的父节点。
     * @param v {FinNode}
     */
    set parent(v:FinNode) {
        this._parent = v;
    }

    /**
     * 获取该节点的左子节点。
     * @returns {FinNode}
     */
    get lChild():FinNode {
        return this._lChild;
    }

    /**
     * 设置该节点的左子节点。
     * @param v {FinNode}
     */
    set lChild(v:FinNode) {
        this._lChild = v;
    }

    /**
     * 获取该节点的右子节点。
     * @returns {FinNode}
     */
    get rChild():FinNode {
        return this._rChild;
    }

    /**
     * 设置该节点的右子节点。
     * @param v {FinNode}
     */
    set rChild(v:FinNode) {
        this._rChild = v;
    }

    /**
     * 获取该节点的中子节点。
     * @returns {FinNode}
     */
    get cChild():FinNode {
        return this._cChild;
    }

    /**
     * 设置该节点的中子节点。
     * @param v {FinNode}
     */
    set cChild(v:FinNode) {
        this._cChild = v;
    }

    /**
     * 设置该节点的值。
     * @returns {FinNodeValue}
     */
    get value():FinNodeValue {
        return this._value;
    }

    /**
     * 获取节点的类型。
     * @returns {FinNodeType}
     */
    get type():FinNodeType {
        return this._type;
    }

    /**
     * 获取该节点所在的树。
     * @returns {FinTree}
     */
    get tree():FinTree {
        return this._tree;
    }

    /**
     * 获取该节点的深度。根节点深度为 1。
     * @returns {Number}
     */
    get depth():number {
        return this._depth;
    }

    /**
     * 获取该节点当前实际的子节点数量。
     * @returns {Number}
     */
    get childCount():number {
        var count = 0;
        this.lChild !== null && count++;
        this.rChild !== null && count++;
        this.cChild !== null && count++;
        return count;
    }

    /**
     * 获取该节点是否是叶子节点。
     * @returns {Boolean}
     */
    get isLeaf():boolean {
        return this.type === FinNodeType.Op;
    }

    /**
     * 创建一个新的数字字面量节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @param value {Number} 该节点的数字字面量值。
     * @returns {FinNode}
     */
    static createNumber(tree:FinTree, parent:FinNode, value:number):FinNode {
        return new FinNode(tree, parent, FinNodeType.Number, {number: value});
    }

    /**
     * 创建一个新的逻辑字面量节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @param value {Boolean} 该节点的逻辑字面量值。
     * @returns {FinNode}
     */
    static createBool(tree:FinTree, parent:FinNode, value:boolean):FinNode {
        return new FinNode(tree, parent, FinNodeType.Bool, {bool: value});
    }

    /**
     * 创建一个新的当前汇率值节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createCurVal(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.CurVal, null);
    }

    /**
     * 创建一个新的加法运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createPlus(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Plus});
    }

    /**
     * 创建一个新的减法运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createMinus(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Minus});
    }

    /**
     * 创建一个新的乘法运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createTimes(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Times});
    }

    /**
     * 创建一个新的除法运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createDivide(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Divide});
    }

    /**
     * 创建一个新的差的绝对值运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createNorm(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Norm});
    }

    /**
     * 创建一个新的平均汇率运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createAverage(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Average});
    }

    /**
     * 创建一个新的最大汇率运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createMax(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Max});
    }

    /**
     * 创建一个新的最小汇率运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createMin(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Min});
    }

    /**
     * 创建一个新的历史汇率运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createLag(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Lag});
    }

    /**
     * 创建一个新的逻辑与运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createAnd(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.And});
    }

    /**
     * 创建一个新的逻辑或运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createOr(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Or});
    }

    /**
     * 创建一个新的逻辑非运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createNot(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Not});
    }

    /**
     * 创建一个新的大于运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createGreater(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Greater});
    }

    /**
     * 创建一个新的小于运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createLess(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.Less});
    }

    /**
     * 创建一个新的 if then 判断运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createIfThen(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.IfThen});
    }

    /**
     * 创建一个新的 if then else 运算符节点。
     * @param tree {FinTree} 该节点所在的树。
     * @param parent {FinNode} 该节点的父节点。如果正在创建的是根节点，该参数应设为 {@link null}。
     * @returns {FinNode}
     */
    static createIfThenElse(tree:FinTree, parent:FinNode):FinNode {
        return new FinNode(tree, parent, FinNodeType.Op, {op: FinOp.IfThenElse});
    }

    /**
     * 将该节点的产出视为布尔值，计算该节点的值。如果该节点产出不是布尔值，则会抛出一个错误。
     * @param day {Number} 时间序列中的第几天。
     * @returns {Boolean}
     */
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

    /**
     * 将该节点的产出视为数字值，计算该节点的值。如果该节点产出不是数字值，则会抛出一个错误。
     * @param day {Number} 序列中的第几天。
     * @returns {Number}
     */
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

    /**
     * 克隆当前节点。
     * @returns {FinNode}
     */
    clone():FinNode {
        var lChild = this.lChild !== null ? this.lChild.clone() : null;
        var rChild = this.rChild !== null ? this.rChild.clone() : null;
        var cChild = this.cChild !== null ? this.cChild.clone() : null;
        var n = new FinNode(this.tree, this.parent, this.type, this.__cloneValue());
        n.lChild = lChild;
        n.rChild = rChild;
        n.cChild = cChild;
        return n;
    }

    /**
     * 克隆当前节点的值。
     * @returns {FinNodeValue}
     * @private
     */
    private __cloneValue():FinNodeValue {
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

/**
 * 计算一个返回布尔值的运算符的返回值。
 * @param node {FinNode} 待计算的节点。
 * @param day {Number} 序列中的第几天。
 * @param op {FinOp} 运算符类型。
 * @returns {Boolean}
 */
function computeOpBool(node:FinNode, day:number, op:FinOp):boolean {
    var leftNode = node.lChild, rightNode = node.rChild, centerNode = node.cChild;
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

/**
 * 计算一个返回数字值的运算符的返回值。
 * @param node {FinNode} 待计算的节点。
 * @param day {Number} 序列中的第几天。
 * @param op {FinOp} 运算符类型。
 * @returns {Number}
 */
function computeOpNumber(node:FinNode, day:number, op:FinOp):number {
    var leftNode = node.lChild, rightNode = node.rChild, tree = node.tree;
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

/**
 * 计算一段时间序列内的汇率平均值。
 * @param tree {FinTree} 含有汇率历史信息的树。
 * @param day {Number} 当前为序列中的第几天。
 * @param length {Number} 向前推算的时间长度，单位为天。
 * @returns {Number}
 */
function average(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[AVG] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[AVG] length (${length}) > day (${day})`);
    }
    var total = 0;
    // 注意，在这个算法下，如果时间长度超过当前天数（例如在第11天计算前20天的平均值），则超过的部分会被视为 0。
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        total += history[i];
    }
    return total / length;
}

/**
 * 计算一段时间序列内的汇率最大值。
 * @param tree {FinTree} 含有汇率历史信息的树。
 * @param day {Number} 当前为序列中的第几天。
 * @param length {Number} 向前推算的时间长度，单位为天。
 * @returns {Number}
 */
function max(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[MAX] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[MAX] length (${length}) > day (${day})`);
    }
    var arr:number[] = [];
    // 注意，在这个算法下，如果时间长度超过当前天数（例如在第11天计算前20天的最大值），则超过的部分会被视为不存在。
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        arr.push(history[i]);
    }
    return Math.max.apply(null, arr);
}

/**
 * 计算一段时间序列内的汇率最小值。
 * @param tree {FinTree} 含有汇率历史信息的树。
 * @param day {Number} 当前为序列中的第几天。
 * @param length {Number} 向前推算的时间长度，单位为天。
 * @returns {Number}
 */
function min(tree:FinTree, day:number, length:number):number {
    var history = tree.historicalExchangeRate;
    if (length <= 0) {
        console.warn(`[MIN] length (${length}) <= 0`);
        return 0;
    } else if (length > day) {
        console.warn(`[MIN] length (${length}) > day (${day})`);
    }
    var arr:number[] = [];
    // 注意，在这个算法下，如果时间长度超过当前天数（例如在第11天计算前20天的最小值），则超过的部分会被视为不存在。
    for (var i = day - 1; i >= day - length && i >= 0; --i) {
        arr.push(history[i]);
    }
    return Math.min.apply(null, arr);
}

/**
 * 计算几天前的即时汇率。
 * @param tree {FinTree} 含有汇率历史信息的树。
 * @param day {Number} 当前为序列中的第几天。
 * @param length {Number} 向前推算的时间长度，单位为天。
 * @returns {Number}
 */
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

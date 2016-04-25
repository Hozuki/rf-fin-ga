import {FinNodeType} from "./FinNodeType";
import {FinNodeValue} from "./FinNodeValue";
import {FinOp} from "./FinOp";
import {Helper} from "./Helper";
import {InvalidOperationError} from "./InvalidOperationError";
import {NotImplementedError} from "./NotImplementedError";
import {ICloneable} from "./ICloneable";

/**
 * 值的存放位置：
 * 一个孩子：左子树
 * 两个孩子：左子树、右子树
 * 三个孩子：中子树(if)、左子树(then)、右子树(else)
 *
 * 如果我没猜错的话，这棵树只有最多上面两层是逻辑，下面都是数值。下面的代码是根据这个猜想写的。
 */
export class FinNode implements ICloneable<FinNode> {

    constructor(parent:FinNode, type:FinNodeType, value:FinNodeValue) {
        this._parent = parent;
        this._type = type;
        this._value = value;
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

    /**
     *
     * @example
     * var newNumberNode = FinNode.createNumber(someParentNode, 100);
     * someParentNode.lChild = newNumberNode;
     * @param parent
     * @param value
     * @returns {FinNode}
     */
    static createNumber(parent:FinNode, value:number):FinNode {
        return new FinNode(parent, FinNodeType.Number, {number: value});
    }

    static createBool(parent:FinNode, value:boolean):FinNode {
        return new FinNode(parent, FinNodeType.Bool, {bool: value});
    }

    static createPlus(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Plus});
    }

    static createMinus(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Minus});
    }

    static createTimes(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Times});
    }

    static createDivide(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Divide});
    }

    static createNorm(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Norm});
    }

    static createAverage(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Average});
    }

    static createMax(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Max});
    }

    static createMin(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Min});
    }

    static createLag(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Lag});
    }

    static createAnd(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.And});
    }

    static createOr(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Or});
    }

    static createNot(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Not});
    }

    static createGreater(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Greater});
    }

    static createLess(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.Less});
    }

    static createIfThen(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.IfThen});
    }

    static createIfThenElse(parent:FinNode):FinNode {
        return new FinNode(parent, FinNodeType.Op, {op: FinOp.IfThenElse});
    }

    computeBool():boolean {
        switch (this.type) {
            case FinNodeType.Bool:
                return this.value.bool;
            case FinNodeType.Number:
                return Helper.bool(this.value.number);
            case FinNodeType.Op:
                return computeOpBool(this.lChild, this.rChild, this.cChild, this.value.op);
        }
    }

    computeNumber():number {
        switch (this.type) {
            case FinNodeType.Bool:
                return Helper.number(this.value.bool);
            case FinNodeType.Number:
                return this.value.number;
            case FinNodeType.Op:
                return computeOpNumber(this.lChild, this.rChild, this.cChild, this.value.op);
        }
    }

    clone():FinNode {
        var lChild = this.lChild !== null ? this.lChild.clone() : null;
        var rChild = this.rChild !== null ? this.rChild.clone() : null;
        var cChild = this.cChild !== null ? this.cChild.clone() : null;
        var n = new FinNode(this.parent, this.type, this.cloneValue());
        n.lChild = lChild;
        n.rChild = rChild;
        n.cChild = cChild;
        return n;
    }

    private cloneValue():FinNodeValue {
        return {
            number: this.value.number,
            bool: this.value.bool,
            op: this.value.op
        };
    }

    private _parent:FinNode = null;
    private _lChild:FinNode = null;
    private _rChild:FinNode = null;
    private _cChild:FinNode = null;
    private _type:FinNodeType = FinNodeType.Number;
    private _value:FinNodeValue = null;

}

function computeOpBool(leftNode:FinNode, rightNode:FinNode, centerNode:FinNode, op:FinOp):boolean {
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
            return leftNode.computeBool() && rightNode.computeBool();
        case FinOp.Or:
            return leftNode.computeBool() && rightNode.computeBool();
        case FinOp.Not:
            return !leftNode.computeBool();
        case FinOp.Greater:
        case FinOp.Less:
            throw new InvalidOperationError();
        case FinOp.IfThen:
            // 不确定
            if (leftNode.computeBool()) {
                return rightNode.computeBool();
            } else {
                // 另一侧难道就没有值了？怎么处理的？
            }
            break;
        case FinOp.IfThenElse:
            // 不确定
            if (centerNode.computeBool()) {
                return leftNode.computeBool();
            } else {
                return rightNode.computeBool();
            }
    }
}

function computeOpNumber(leftNode:FinNode, rightNode:FinNode, centerNode:FinNode, op:FinOp):number {
    switch (op) {
        case FinOp.Plus:
            return leftNode.computeNumber() + rightNode.computeNumber();
        case FinOp.Minus:
            return leftNode.computeNumber() - rightNode.computeNumber();
        case FinOp.Times:
            return leftNode.computeNumber() * rightNode.computeNumber();
        case FinOp.Divide:
            return leftNode.computeNumber() / rightNode.computeNumber();
        case FinOp.Norm:
        case FinOp.Average:
        case FinOp.Max:
        case FinOp.Min:
        case FinOp.Lag:
            // 上面这些函数的跟时间相关是怎么回事？
            throw new NotImplementedError();
        case FinOp.And:
        case FinOp.Or:
        case FinOp.Not:
            throw new InvalidOperationError();
        case FinOp.Greater:
        case FinOp.Less:
            // 这两个是什么规则？
            throw new NotImplementedError();
        case FinOp.IfThen:
            // 不确定
            if (leftNode.computeNumber()) {
                return rightNode.computeNumber();
            } else {
                // 同理，这里难道就没有值了？
            }
            break;
        case FinOp.IfThenElse:
            // 不确定
            if (centerNode.computeNumber()) {
                return leftNode.computeNumber();
            } else {
                return rightNode.computeNumber();
            }
    }
}

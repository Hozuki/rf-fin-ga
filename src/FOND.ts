import {FinNodeDescriptor} from "./FinNodeDescriptor";
import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";

/**
 * 这个类型定义只是为了：1、WebStorm 更好地提示代码输入；2、方便查错，强制让 TypeScript 编译器检查类型。
 */
type FNDMap = {[key:number]:FinNodeDescriptor};

/**
 * FinOp Node Definitions (FOND)
 * @type {FNDMap}
 */
export const FOND:FNDMap = Object.create(null);

FOND[FinOp.Plus] = {
    returnType: FinNodeType.Number,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Minus] = {
    returnType: FinNodeType.Number,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Times] = {
    returnType: FinNodeType.Number,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Divide] = {
    returnType: FinNodeType.Number,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Norm] = {
    returnType: FinNodeType.Number,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Average] = {
    returnType: FinNodeType.Number,
    childCount: 1,
    hasLeft: true,
    hasCenter: false,
    hasRight: false,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.None
};

FOND[FinOp.Max] = {
    returnType: FinNodeType.Number,
    childCount: 1,
    hasLeft: true,
    hasCenter: false,
    hasRight: false,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.None
};

FOND[FinOp.Min] = {
    returnType: FinNodeType.Number,
    childCount: 1,
    hasLeft: true,
    hasCenter: false,
    hasRight: false,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.None
};

FOND[FinOp.Lag] = {
    returnType: FinNodeType.Number,
    childCount: 1,
    hasLeft: true,
    hasCenter: false,
    hasRight: false,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.None
};

FOND[FinOp.And] = {
    returnType: FinNodeType.Bool,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Bool,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Bool
};

FOND[FinOp.Or] = {
    returnType: FinNodeType.Bool,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Bool,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Bool
};

FOND[FinOp.Not] = {
    returnType: FinNodeType.Bool,
    childCount: 1,
    hasLeft: true,
    hasCenter: false,
    hasRight: false,
    typeLeft: FinNodeType.Bool,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.None
};

FOND[FinOp.Greater] = {
    returnType: FinNodeType.Bool,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.Less] = {
    returnType: FinNodeType.Bool,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Number,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Number
};

FOND[FinOp.IfThen] = {
    returnType: FinNodeType.Bool,
    childCount: 2,
    hasLeft: true,
    hasCenter: false,
    hasRight: true,
    typeLeft: FinNodeType.Bool,
    typeCenter: FinNodeType.None,
    typeRight: FinNodeType.Bool
};

FOND[FinOp.IfThenElse] = {
    returnType: FinNodeType.Bool,
    childCount: 3,
    hasLeft: true,
    hasCenter: true,
    hasRight: true,
    typeLeft: FinNodeType.Bool,
    typeCenter: FinNodeType.Bool,
    typeRight: FinNodeType.Bool
};

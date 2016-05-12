import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";
import {FinNode} from "./FinNode";
import {FOND} from "./FOND";

/**
 * 常用函数的帮助类。
 */
export abstract class Helper {

    /**
     * 将一个值强制转换为布尔值。
     * @param value {String|Boolean|Number} 一个值。
     * @returns {Boolean}
     */
    static bool(value:string|boolean|number):boolean {
        return !!value;
    }

    /**
     * 将一个值强制转换为数字。如果这个值是布尔值，则 true 会被转换成 1，false 会被转换成 0。
     * @param value {String|Boolean|Number} 一个值。
     * @returns {Number}
     */
    static number(value:string|boolean|number):number {
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else {
            return parseFloat(<string>value);
        }
    }

    /**
     * 获取节点的返回类型，也就是实际在树中表现出的类型。
     * @param node {FinNode} 待检测的节点。
     * @returns {FinNodeType}
     */
    static getNodeReturnType(node:FinNode):FinNodeType {
        switch (node.type) {
            case FinNodeType.Bool:
                return FinNodeType.Bool;
            case FinNodeType.Number:
            case FinNodeType.CurVal:
                return FinNodeType.Number;
            case FinNodeType.Op:
                return FOND[node.value.op].returnType;
        }
    }

    /**
     * 获取节点在 {@link FOND} 表中查询所使用的索引。
     * @param node {FinNode} 待检测的节点。
     * @returns {FinOp}
     */
    static getNodeFondType(node:FinNode):FinOp {
        return node.value.op;
    }

    /**
     * 从数组中删除一个元素，并返回是否成功删除了该元素。
     * @param array {T[]} 要从中删除元素的数组。
     * @param item {T} 要删除的元素。
     * @returns {Boolean}
     */
    static removeItem<T>(array:T[], item:T):boolean {
        var index = array.indexOf(item);
        var b = index >= 0;
        if (b) {
            array.splice(index, 1);
        }
        return b;
    }

    /**
     * 从数组中删除指定索引处的元素，并返回是否成功删除了该元素。
     * @param array {T[]} 要从中删除元素的数组。
     * @param index {Number} 要删除的元素的索引。
     * @returns {Boolean}
     */
    static removeItemAt<T>(array:T[], index:number):boolean {
        var b = 0 <= index && index < array.length;
        if (b) {
            array.splice(index, 1);
        }
        return b;
    }

}

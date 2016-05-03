import {FinOp} from "./FinOp";
import {FinNodeType} from "./FinNodeType";
import {FinNode} from "./FinNode";
import {FinNodeValue} from "./FinNodeValue";
import {FOND} from "./FOND";

export abstract class Helper {

    static bool(value:any):boolean {
        return !!value;
    }

    static number(value:any):number {
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else {
            return parseFloat(value);
        }
    }

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

    static getNodeFondType(node:FinNode):FinOp {
        return node.value.op;
    }

    static removeItem<T>(array:T[], item:T):boolean {
        var index = array.indexOf(item);
        var b = index >= 0;
        if (b) {
            array.splice(index, 1);
        }
        return b;
    }

    static removeItemAt<T>(array:T[], index:number):boolean {
        var b = 0 <= index && index < array.length;
        if (b) {
            array.splice(index, 1);
        }
        return b;
    }

}

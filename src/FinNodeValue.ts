import {FinOp} from "./FinOp";

/**
 * 节点携带的值。
 * 可能的三种值在一个节点中只存在一种。
 */
export interface FinNodeValue {

    /**
     * 原始数字值。
     */
    number?:number;
    /**
     * 原始逻辑值。
     */
    bool?:boolean;
    /**
     * 运算符类型。
     */
    op?:FinOp;

}

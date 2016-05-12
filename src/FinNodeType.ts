/**
 * 节点数据类型。注意这个枚举设计上是支持掩码运算的。
 */
export enum FinNodeType {

    /**
     * 该节点无数据。
     * @type {Number}
     */
    None = 0,
    /**
     * 该节点的是数字原始值节点，类型为常数或时间。
     * @type {Number}
     */
    Number = 1,
    /**
     * 该节点是逻辑原始值节点，类型为逻辑值。
     * @type {Number}
     */
    Bool = 2,
    /**
     * 该节点是运算符节点，类型为其运算符的返回类型。
     * @type {Number}
     */
    Op = 4,
    /**
     * 该节点是当前汇率值节点，类型为汇率。
     * @type {Number}
     */
    CurVal = 8

}

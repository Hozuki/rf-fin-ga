import {FinNodeType} from "./FinNodeType";

/**
 * 对节点属性的描述，描述节点的每个子节点允许对接的类型、整个节点返回的类型和左中右子节点是否存在。
 */
export interface FinNodeDescriptor {

    /**
     * 节点的返回类型。
     */
    returnType:FinNodeType;
    /**
     * 子节点数量。
     */
    childCount:number;
    /**
     * 左子节点是否存在。
     */
    hasLeft:boolean;
    /**
     * 中子节点是否存在。
     */
    hasCenter:boolean;
    /**
     * 右子节点是否存在。
     */
    hasRight:boolean;
    /**
     * 左子节点接受的类型。
     */
    typeLeft:FinNodeType;
    /**
     * 中子节点接受的类型。
     */
    typeCenter:FinNodeType;
    /**
     * 右子节点接受的类型。
     */
    typeRight:FinNodeType;

}

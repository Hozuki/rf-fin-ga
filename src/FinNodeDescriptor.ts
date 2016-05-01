import {FinNodeType} from "./FinNodeType";

export interface FinNodeDescriptor {

    returnType:FinNodeType;
    childCount:number;
    hasLeft:boolean;
    hasCenter:boolean;
    hasRight:boolean;
    typeLeft:FinNodeType;
    typeCenter:FinNodeType;
    typeRight:FinNodeType;

}

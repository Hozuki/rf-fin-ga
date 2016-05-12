import {ErrorBase} from "./ErrorBase";

/**
 * 表示一个参数越界错误。
 */
export class ArgumentOutOfRangeError extends ErrorBase {

    /**
     * 创建一个新的 {@link ArgumentOutOfRangeError}。
     * @param message {String} 错误信息。
     * @param argumentName {String} 导致错误的参数的名称。
     */
    constructor(message:string = "Argument out of range.", argumentName:string = null) {
        super("NotImplementedError", message);
        this._argumentName = argumentName;
    }

    /**
     * 获取导致错误的参数的名称。
     * @returns {String}
     */
    get argumentName():string {
        return this._argumentName;
    }

    private _argumentName:string = null;

}

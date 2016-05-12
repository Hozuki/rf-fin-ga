import {ErrorBase} from "./ErrorBase";

/**
 * 表示一个无效操作错误。
 */
export class InvalidOperationError extends ErrorBase {

    /**
     * 创建一个新的 {@link InvalidOperationError}。
     * @param message {String} 错误信息。
     */
    constructor(message:string = "Operation is invalid.") {
        super("InvalidOperationError", message);
    }

}

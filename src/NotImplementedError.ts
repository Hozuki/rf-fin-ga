import {ErrorBase} from "./ErrorBase";

/**
 * 表示一个功能未实现错误。
 */
export class NotImplementedError extends ErrorBase {

    /**
     * 创建一个新的 {@link NotImplementedError}。
     * @param message {String} 错误信息。
     */
    constructor(message:string = "Not implemented.") {
        super("NotImplementedError", message);
    }

}

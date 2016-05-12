/**
 * 程序中的错误类的基类。
 */
export class ErrorBase implements Error {

    /**
     * 创建一个新的 {@link ArgumentOutOfRangeError}。
     * @param name {String} 本错误类型的名称。
     * @param message {String} 错误信息。
     */
    constructor(name:string, message:string) {
        this._name = name;
        this._message = message;
    }

    /**
     * 获取本错误类型的名称。
     * @returns {String}
     */
    get name():string {
        return this._name;
    }

    /**
     * 获取错误信息。
     * @returns {String}
     */
    get message():string {
        return this._message;
    }

    private _name:string = null;
    private _message:string = null;

}

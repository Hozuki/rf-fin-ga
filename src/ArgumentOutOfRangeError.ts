import {ErrorBase} from "./ErrorBase";

export class ArgumentOutOfRangeError extends ErrorBase {

    constructor(message:string = "Argument out of range.", argumentName:string = null) {
        super("NotImplementedError", message);
        this._argumentName = argumentName;
    }

    get argumentName():string {
        return this._argumentName;
    }

    private _argumentName:string = null;

}

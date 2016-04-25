import {ErrorBase} from "./ErrorBase";

export class InvalidOperationError extends ErrorBase {

    constructor(message:string = "Operation is invalid.") {
        super("InvalidOperationError", message);
    }

}

import {ErrorBase} from "./ErrorBase";

export class NotImplementedError extends ErrorBase {

    constructor(message:string = "Not implemented.") {
        super("NotImplementedError", message);
    }

}

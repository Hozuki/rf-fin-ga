export class ErrorBase implements Error {

    constructor(name:string, message:string) {
        this._name = name;
        this._message = message;
    }

    get name():string {
        return this._name;
    }

    get message():string {
        return this._message;
    }

    private _name:string = null;
    private _message:string = null;

}

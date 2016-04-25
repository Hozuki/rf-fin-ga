export abstract class Helper {

    static bool(value:any):boolean {
        return !!value;
    }

    static number(value:any):number {
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else {
            return parseFloat(value);
        }
    }

}

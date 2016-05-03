declare module "leftpad" {

    function leftpad(text:any, length:number, options?:LeftPadOptions):string;

    interface LeftPadOptions {
        char?:string;
        colors?:boolean;
        strip?:boolean;
    }

    export = leftpad;

}

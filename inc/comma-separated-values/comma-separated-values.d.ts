declare module "comma-separated-values" {

    export = CSV;

    class CSV {

        constructor(data:string, options?:any);

        encode():string;

        parse(options?:any):any;

        forEach(callback:(value:any) => void):void;

    }

}

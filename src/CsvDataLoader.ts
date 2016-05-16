import {Helper} from "./Helper";
import leftpad = require("leftpad");
import {CsvForeignInterestRate, CsvDomesticInterestRate, CsvExchangeRate} from "./CsvData";
import CSV = require("comma-separated-values");

/*
 这个对象存储解析 CSV 文本后我们要保留下来的数据。
 */
interface Records {
    exchangeRate:number[];
    domesticInterestRate:number[];
    foreignInterestRate:number[];
}

/**
 * 赶时间
 */
export abstract class CsvDataLoader {

    static get records():Records {
        return CsvDataLoader._records;
    }

    static get dataIR():any {
        return CsvDataLoader._dataIR;
    }

    static get dataD():any {
        return CsvDataLoader._dataD;
    }

    static get dataF():any {
        return CsvDataLoader._dataF;
    }

    static load():void {
        CsvDataLoader._records = Object.create(null);

        // date, hkd/cny, ?
        var csv1 = new CSV(CsvExchangeRate);
        CsvDataLoader._dataIR = csv1.parse();
        CsvDataLoader.records.exchangeRate = [];
        for (var i = 0; i < CsvDataLoader.dataIR.length; ++i) {
            CsvDataLoader.records.exchangeRate.push(CsvDataLoader.dataIR[i][1]);
        }

        var csv2 = new CSV(CsvDomesticInterestRate);
        // data = csv.parse({
        //     header: ["date", "hibor_overnight", "hibor_one_week", "hibor_one_month", "hibor_six_months"]
        // });
        CsvDataLoader._dataD = csv2.parse();
        CsvDataLoader.records.domesticInterestRate = [];
        for (var i = 0; i < CsvDataLoader.dataD.length; ++i) {
            CsvDataLoader.records.domesticInterestRate.push(CsvDataLoader.dataD[i][1]);
        }

        var csv3 = new CSV(CsvForeignInterestRate);
        // data = csv.parse({
        //     header: ["date", "shibor_overnight", "shibor_one_week"]
        // });
        CsvDataLoader._dataF = csv3.parse();
        CsvDataLoader.records.foreignInterestRate = [];
        for (var i = 0; i < CsvDataLoader.dataF.length; ++i) {
            CsvDataLoader.records.foreignInterestRate.push(CsvDataLoader.dataF[i][1]);
        }

        console.log("Cleaning CSV data...");
        for (var year = 1994; year < 2016; ++year) {
            for (var month = 1; month < 13; ++month) {
                for (var day = 1; day < 32; ++day) {
                    var dateString = `${leftpad(year, 4)}-${leftpad(month, 2)}-${leftpad(day, 2)}`;
                    var i1 = CsvDataLoader.indexOf(dateString, CsvDataLoader.dataIR),
                        i2 = CsvDataLoader.indexOf(dateString, CsvDataLoader.dataD),
                        i3 = CsvDataLoader.indexOf(dateString, CsvDataLoader.dataF);
                    if (i1 < 0 || i2 < 0 || i3 < 0) {
                        if (i1 >= 0) {
                            Helper.removeItemAt(CsvDataLoader.dataIR, i1);
                            Helper.removeItemAt(CsvDataLoader.records.exchangeRate, i1);
                        }
                        if (i2 >= 0) {
                            Helper.removeItemAt(CsvDataLoader.dataD, i2);
                            Helper.removeItemAt(CsvDataLoader.records.domesticInterestRate, i2);
                        }
                        if (i3 >= 0) {
                            Helper.removeItemAt(CsvDataLoader.dataF, i3);
                            Helper.removeItemAt(CsvDataLoader.records.foreignInterestRate, i3);
                        }
                    }
                }
            }
        }
        console.log("Done.");
    }

    static get04Jan2011Index():number {
        return CsvDataLoader.indexOf("2011-01-04");
    }

    /**
     * 在一个含日期的信息数组中查找对应日期的记录索引。
     * @param dateString {String} 日期的字符串表达式，形如“YYYY-MM-DD”。
     * @param array {*[][]} 信息数组。
     * @returns {Number}
     */
    static indexOf(dateString:string, array:any[][] = CsvDataLoader.dataIR):number {
        if (!array || array.length <= 0) {
            return -1;
        }
        for (var i = 0; i < array.length; ++i) {
            if (array[i][0] === dateString) {
                return i;
            }
        }
        return -1;
    }

    private static _records:Records = null;
    private static _dataIR:any = null;
    private static _dataD:any = null;
    private static _dataF:any = null;

}
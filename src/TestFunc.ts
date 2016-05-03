import {ModelParams} from "./ModelParams";
import {GA} from "./GA";
import {Helper} from "./Helper";
import {CsvExchangeRate, CsvDomesticInterestRate, CsvForeignInterestRate} from "./CsvData";
// hack
import CSV = require("comma-separated-values");
import leftpad = require("leftpad");

var records:{
    exchangeRate:number[],
    domesticInterestRate:number[],
    foreignInterestRate:number[]
} = {
    exchangeRate: null,
    domesticInterestRate: null,
    foreignInterestRate: null
};

export function test() {
    var startDay = prepareData();
    console.log(`Starting at 2011-01-04 (day ${startDay}).`);
    var params:ModelParams = {
        periodLength: 500,
        initialCount: 500,
        //startDay: 2187,
        startDay: startDay,
        historicalExchangeRate: records.exchangeRate,
        historicalDomesticInterestRate: records.domesticInterestRate,
        historicalForeignInterestRate: records.foreignInterestRate
    };
    var ga = new GA(params);
    ga.simulateOneTrial(window.document.body);
}

function prepareData():number {
    // date, hkd/cny, ?
    var csv1 = new CSV(CsvExchangeRate);
    var data1 = csv1.parse();
    records.exchangeRate = [];
    for (var i = 0; i < data1.length; ++i) {
        records.exchangeRate.push(data1[i][1]);
    }

    var csv2 = new CSV(CsvDomesticInterestRate);
    // data = csv.parse({
    //     header: ["date", "hibor_overnight", "hibor_one_week", "hibor_one_month", "hibor_six_months"]
    // });
    var data2 = csv2.parse();
    records.domesticInterestRate = [];
    for (var i = 0; i < data2.length; ++i) {
        records.domesticInterestRate.push(data2[i][1]);
    }

    var csv3 = new CSV(CsvForeignInterestRate);
    // data = csv.parse({
    //     header: ["date", "shibor_overnight", "shibor_one_week"]
    // });
    var data3 = csv3.parse();
    records.foreignInterestRate = [];
    for (var i = 0; i < data3.length; ++i) {
        records.foreignInterestRate.push(data3[i][1]);
    }

    console.log("Cleaning CSV data...");
    for (var year = 1994; year < 2016; ++year) {
        for (var month = 1; month < 13; ++month) {
            for (var day = 1; day < 32; ++day) {
                var dateString = `${leftpad(year, 4)}-${leftpad(month, 2)}-${leftpad(day, 2)}`;
                var i1 = indexOf(dateString, data1), i2 = indexOf(dateString, data2), i3 = indexOf(dateString, data3);
                if (i1 < 0 || i2 < 0 || i3 < 0) {
                    if (i1 >= 0) {
                        Helper.removeItemAt(data1, i1);
                        Helper.removeItemAt(records.exchangeRate, i1);
                    }
                    if (i2 >= 0) {
                        Helper.removeItemAt(data2, i2);
                        Helper.removeItemAt(records.domesticInterestRate, i2);
                    }
                    if (i3 >= 0) {
                        Helper.removeItemAt(data3, i3);
                        Helper.removeItemAt(records.foreignInterestRate, i3);
                    }
                }
            }
        }
    }
    console.log("Done.");
    return indexOf("2011-01-04", data1);

    function indexOf(dateString:string, array:any[][]):number {
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
}

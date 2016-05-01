import {ModelParams} from "./ModelParams";
import {GA} from "./GA";
// hack
import CSV = require("comma-separated-values");

import {CsvExchangeRate, CsvDomesticInterestRate, CsvForeignInterestRate} from "./CsvData";

export function test() {
    // date, hkd/cny, ?
    var csv = new CSV(CsvExchangeRate);
    var data = csv.parse();
    var exchangeRate:number[] = [];
    for (var i = 0; i < data.length; ++i) {
        exchangeRate.push(data[i][1]);
    }

    csv = new CSV(CsvDomesticInterestRate);
    // data = csv.parse({
    //     header: ["date", "hibor_overnight", "hibor_one_week", "hibor_one_month", "hibor_six_months"]
    // });
    data = csv.parse();
    var domesticInterestRate:number[] = [];
    for (var i = 0; i < data.length; ++i) {
        domesticInterestRate.push(data[i][1]);
    }

    csv = new CSV(CsvForeignInterestRate);
    // data = csv.parse({
    //     header: ["date", "shibor_overnight", "shibor_one_week"]
    // });
    data = csv.parse();
    var foreignInterestRate:number[] = [];
    for (var i = 0; i < data.length; ++i) {
        foreignInterestRate.push(data[i][1]);
    }

    var params:ModelParams = {
        periodLength: 100,
        initialCount: 15,
        startDay: 2187,
        historicalExchangeRate: exchangeRate,
        historicalDomesticInterestRate: domesticInterestRate,
        historicalForeignInterestRate: foreignInterestRate
    };
    var ga = new GA(params);
    ga.simulateOneTrial(window.document.body);
}

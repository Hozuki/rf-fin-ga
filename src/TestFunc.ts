import {ModelParams} from "./ModelParams";
import {GA} from "./GA";
import {Helper} from "./Helper";
import {CsvExchangeRate, CsvDomesticInterestRate, CsvForeignInterestRate} from "./CsvData";
// hack
import CSV = require("comma-separated-values");
import leftpad = require("leftpad");
import {CsvDataLoader} from "./CsvDataLoader";

/**
 * 主函数。
 */
export function test() {
    CsvDataLoader.load();
    var startDay = CsvDataLoader.get04Jan2011Index();
    console.log(`Starting at 2011-01-04 (day ${startDay}).`);
    var params:ModelParams = {
        periodLength: 1000,
        initialCount: 500,
        startDay: startDay,
        startDayString: "2011-01-04",
        historicalExchangeRate: CsvDataLoader.records.exchangeRate,
        historicalDomesticInterestRate: CsvDataLoader.records.domesticInterestRate,
        historicalForeignInterestRate: CsvDataLoader.records.foreignInterestRate
    };
    var ga = new GA(params, [
        // 2014-01-02 开始 500 天（预计到2015年末）
        {startDay: CsvDataLoader.indexOf("2014-01-02"), periodLength: 500, startDayString: "2014-01-02"},
        // 2011-01-04 开始 1500 天（预计到2013年末）
        {startDay: CsvDataLoader.indexOf("2011-01-04"), periodLength: 1500, startDayString: "2011-01-04"}
    ]);
    ga.simulateOneTrial(window.document.body);
}

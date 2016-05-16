import {DayLengthPair} from "./DayLengthPair";

/**
 * 模型参数。
 */
export interface ModelParams extends DayLengthPair {

    /**
     * 初始种群大小。
     */
    initialCount:number;

    /**
     * 历史汇率。
     */
    historicalExchangeRate:number[];
    /**
     * 历史拆借利率。
     */
    historicalDomesticInterestRate:number[];
    /**
     * 历史拆放利率。
     */
    historicalForeignInterestRate:number[];

}

/**
 * 模型参数。
 */
export interface ModelParams {

    /**
     * 初始种群大小。
     */
    initialCount:number;
    /**
     * 计算时间段长度，单位为天。
     */
    periodLength:number;
    /**
     * 从历史上的第几天开始。
     */
    startDay:number;
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

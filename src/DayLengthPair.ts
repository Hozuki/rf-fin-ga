/**
 * 自己看名字。
 */
export interface DayLengthPair {

    /**
     * 计算时间段长度，单位为天。
     */
    periodLength:number;
    /**
     * 从历史上的第几天开始。
     */
    startDay:number;
    /**
     * 开始日期的文字表达式。
     */
    startDayString:string;

}
import {FinTree} from "./FinTree";
import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";

/**
 * 下限可取，上限不可取
 */
type Range = {start:number, end:number};

export abstract class GA {

    static simulateOneTrial():void {
        var population = GA.makePopulation(500);
        GA.measureFitnessOfWholePopulation(population);
        var fittest = population[GA.getFittestIndexInPopulation(population)];
        var fittestValue = fittest.measureFitness();
        var newFittest = fittest;
        var newFittestValue = fittestValue;
        const BATCH_EPOCH_COUNT = 25;
        do {
            for (var i = 0; i < BATCH_EPOCH_COUNT; ++i) {
                population = GA.hybrid(population);
                GA.measureFitnessOfWholePopulation(population);
                newFittest = population[GA.getFittestIndexInPopulation(population)];
                newFittestValue = newFittest.measureFitness();
            }
        } while (newFittestValue <= fittestValue);
        fittest = newFittest;
        fittestValue = newFittestValue;

        // 此时产生的 fittest 就是表达式，fittestValue 是最优解
        console.log("Fittest:", fittest, " / value: ", fittestValue);
    }

    static getFittestIndexInPopulation(population:FinTree[]):number {
        var fittestIndex = 0;
        for (var i = 1; i < population.length; ++i) {
            if (population[i].rankWeight > population[fittestIndex].rankWeight) {
                fittestIndex = i;
            }
        }
        return fittestIndex;
    }

    /**
     * 生成一个种群。
     * @param count {Number} 种群数量。
     */
    private static makePopulation(count:number):FinTree[] {
        throw new NotImplementedError();
    }

    /**
     * 更新种群内所有个体的适应度。
     * @param population {FinTree[]}
     */
    private static measureFitnessOfWholePopulation(population:FinTree[]):void {
        for (var i = 0; i < population.length; ++i) {
            population[i].rankWeight = population[i].measureFitness();
        }
    }

    /**
     * 种群杂交，生成新的种群。修改新种群不会影响原种群。
     * @param population {FinTree[]}
     */
    private static hybrid(population:FinTree[]):FinTree[] {
        var newPopulation:FinTree[] = [];
        var weightTable = makeWeightTable(population);
        for (var i = 0; i < population.length; ++i) {
            var parentIndices = randParent(weightTable);
            var p1 = population[parentIndices.p1], p2 = population[parentIndices.p2];

            // 移花接木，randomNode1 替换为 randomNode2
            var root = p1.root.clone();
            var tree = new FinTree(root);
            var randomNode1 = tree.selectRandomNode();
            var randomNode2 = p2.selectRandomNode().clone();
            randomNode2.parent = randomNode1.parent;
            var positions = ["lChild", "rChild", "cChild"];
            for (var i = 0; i < positions.length; ++i) {
                var pos = positions[i];
                if ((<any>randomNode1.parent)[pos] === randomNode1) {
                    (<any>randomNode1.parent)[pos] = randomNode2;
                    break;
                }
            }
            newPopulation.push(tree);
        }
        return newPopulation;
    }

}

/**
 * 根据当前种群计算一个权值表。
 * @param population {FinTree[]}
 * @returns {Range[]}
 */
function makeWeightTable(population:FinTree[]):Range[] {
    var totalWeight = 0;
    for (var i = 0; i < population.length; ++i) {
        totalWeight += population[i].rankWeight;
    }
    var table:Range[] = [];
    var start = 0;
    for (var i = 0; i < population.length; ++i) {
        var section = population[i].rankWeight / totalWeight;
        var end = start + section;
        table.push({start: start, end: end});
        start = end;
    }
    return table;
}

/**
 * 根据权值表，随机选出一对父母，返回它们的索引。
 * 权值表的结构是 [个体索引, {对应的[0,1)起始值, 对应的[0,1)结束值}]。
 * @param weightTable {Range[]}
 * @returns {{p1: number, p2: number}}
 */
function randParent(weightTable:Range[]):{p1:number, p2:number} {
    var r = {p1: 0, p2: 0};
    var f1 = Math.random(), f2 = Math.random();
    for (var n = 0; n < weightTable.length; ++n) {
        if (n < weightTable.length - 1) {
            if (weightTable[n].start > f1) {
                r.p1 = n - 1;
                break;
            }
        } else {
            r.p1 = n;
        }
    }
    for (var n = 0; n < weightTable.length; ++n) {
        if (n < weightTable.length - 1) {
            if (weightTable[n].start > f2) {
                r.p2 = n - 1;
                break;
            }
        } else {
            r.p2 = n;
        }
    }
    return r;
}

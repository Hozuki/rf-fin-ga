import {FinTree} from "./FinTree";
import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";
import {ModelParams} from "./ModelParams";
import {Helper} from "./Helper";
import {FinOp} from "./FinOp";
import {FOND} from "./FOND";
import {FinNodeType} from "./FinNodeType";

/**
 * 下限可取，上限不可取
 */
type Range = {start:number, end:number};

export class GA {

    constructor(modelParams:ModelParams) {
        this._modelParams = modelParams;
    }

    simulateOneTrial(elem:HTMLElement):void {
        console.info("Creating population...");
        var population = this.makePopulation(this.modelParams.initialCount);
        console.info("Measuring fitness...");
        this.measureFitnessOfWholePopulation();
        var fittestIndex = this.getFittestIndexInPopulation();
        var fittest = population[fittestIndex];
        var newFittest:FinTree;
        const BATCH_EPOCH_COUNT = 25;
        var generationCounter = 0;
        const GENERATION_LIMIT = 2;
        console.log("Original fittest:", fittest, " / #" + fittestIndex + " / value: ", fittest.fitness);
        do {
            console.info(`Creating new batch (${generationCounter + 1}/${GENERATION_LIMIT})...`);
            for (var i = 0; i < BATCH_EPOCH_COUNT; ++i) {
                this._population = population = this.hybrid();
                console.info(`Measuring fitness (${i + 1}/${BATCH_EPOCH_COUNT})...`);
                this.measureFitnessOfWholePopulation();
                fittestIndex = this.getFittestIndexInPopulation();
                newFittest = population[fittestIndex];
                console.log(`Fittest in generation #${i + generationCounter * BATCH_EPOCH_COUNT + 1}:`, newFittest, " / #" + fittestIndex + " / value: ", newFittest.fitness);
                if (newFittest.fitness > fittest.fitness) {
                    console.info("New fittest found.");
                    fittest = newFittest;
                }
            }
            ++generationCounter;
        } while (newFittest.fitness <= fittest.fitness && generationCounter < GENERATION_LIMIT);
        if (newFittest.fitness > fittest.fitness) {
            fittest = newFittest;
        }
        fittest.draw(elem);

        // 此时产生的 fittest 就是表达式，fittestValue 是最优解
        console.log("Overall fittest:", fittest, " / value: ", fittest.fitness);
    }

    get modelParams():ModelParams {
        return this._modelParams;
    }

    private getFittestIndexInPopulation():number {
        var population = this._population;
        var fittestIndex = 0;
        for (var i = 1; i < population.length; ++i) {
            if (population[i].fitness > population[fittestIndex].fitness) {
                fittestIndex = i;
            }
        }
        return fittestIndex;
    }

    /**
     * 生成一个种群。
     * @param count {Number} 种群数量。
     */
    private makePopulation(count:number):FinTree[] {
        var population:FinTree[] = new Array<FinTree>(count);
        for (var i = 0; i < count; ++i) {
            var tree:FinTree;
            do {
                tree = this.makeSingleTree();
            } while (!tree.checkValidity());
            population[i] = tree;
        }
        this._population = population;
        return population;
    }

    /**
     * 生成一个 Lag 树，期望结果：tree._decisions 并不会恒为 true/false。
     * @returns {FinTree}
     */
    private makeSingleTreeDebug():FinTree {
        var tree = new FinTree(this.modelParams);
        var root = FinNode.createLess(tree, null);
        tree.root = root;
        var l = FinNode.createCurVal(tree, root);
        root.lChild = l;
        var r = FinNode.createLag(tree, root);
        root.rChild = r;
        var t = FinNode.createNumber(tree, r, 1);
        r.lChild = t;
        return tree;
    }

    private makeSingleTree():FinTree {
        var tree = new FinTree(this.modelParams);

        // 创建根节点
        // tree, parent, value?
        var gen:NodeGenerator;
        gen = randomIn<NodeGenerator>(NodeGen["op-bool"]);
        var root = gen(tree, null);
        tree.root = root;

        var undoneNodes:FinNode[] = [root];
        var totalNodeCount = 1;
        const NODE_THRESHOLD = 100;
        while (undoneNodes.length > 0 && totalNodeCount < NODE_THRESHOLD) {
            // 随机抽取一个节点，创建其子节点
            var parentNode = randomIn<FinNode>(undoneNodes);
            var desc = FOND[Helper.getNodeFondType(parentNode)];
            if (parentNode.childCount < desc.childCount) {
                // 选择左中右
                var expectedType:FinNodeType;
                var roulette:string[] = [], subbranches:string[] = [];
                if (desc.hasLeft && !parentNode.lChild) {
                    roulette.push("Left");
                    subbranches.push("lChild");
                }
                if (desc.hasRight && !parentNode.rChild) {
                    roulette.push("Right");
                    subbranches.push("rChild");
                }
                if (desc.hasCenter && !parentNode.cChild) {
                    roulette.push("Center");
                    subbranches.push("cChild");
                }
                // 根据期望返回类型创建新节点
                var selectedDescBranch = randomIn<string>(roulette);
                expectedType = (<any>desc)["type" + selectedDescBranch];
                var selectedNodeBranch = subbranches[roulette.indexOf(selectedDescBranch)];
                var nodeGenFuncs:NodeGenerator[];
                switch (expectedType) {
                    case FinNodeType.Bool:
                        nodeGenFuncs = NodeGen["op-bool"].slice();
                        nodeGenFuncs.push(FinNode.createBool);
                        break;
                    case FinNodeType.Number:
                        nodeGenFuncs = NodeGen["op-number"].slice();
                        nodeGenFuncs.push(FinNode.createNumber, FinNode.createCurVal);
                        break;
                    default:
                        console.error("expected type is out of range.");
                        break;
                }
                gen = randomIn<NodeGenerator>(nodeGenFuncs);

                // 创建节点，值节点单独考虑
                var node:FinNode;
                switch (gen) {
                    case FinNode.createNumber:
                        // Num: 0.8-1.2, 0.01
                        node = gen(tree, parentNode, ((Math.random() * 40 + 80) | 0) / 100);
                        break;
                    case FinNode.createBool:
                        node = gen(tree, parentNode, Math.random() >= 0.5);
                        break;
                    case FinNode.createCurVal:
                    default:
                        node = gen(tree, parentNode);
                        break;
                }
                // 特殊函数的参数特殊处理
                switch (gen) {
                    case FinNode.createAverage:
                        // AVG: 250, 150, 100, 60, 30, 20, 15
                        node.lChild = FinNode.createNumber(tree, node, randomIn<number>([250, 150, 100, 60, 30, 20, 15]));
                        ++totalNodeCount;
                        break;
                    case FinNode.createMin:
                    case FinNode.createMax:
                        // MIN/MAX: 250, 150, 60
                        node.lChild = FinNode.createNumber(tree, node, randomIn<number>([250, 150, 60]));
                        ++totalNodeCount;
                        break;
                    case FinNode.createLag:
                        // LAG: 1-10
                        node.lChild = FinNode.createNumber(tree, node, randomIn<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
                        ++totalNodeCount;
                        break;
                }

                // 设置新节点为父节点的某子节点
                (<any>parentNode)[selectedNodeBranch] = node;
                ++totalNodeCount;

                // 推送到未完成列表中
                if (node.shouldHaveChild && node.childCount < FOND[Helper.getNodeFondType(node)].childCount) {
                    undoneNodes.push(node);
                }
                // 如果父节点填满了，移除
                if (parentNode.childCount >= desc.childCount) {
                    Helper.removeItem(undoneNodes, parentNode);
                }
            } else {
                // 从未完成的节点列表中删除这个已完成的节点
                Helper.removeItem(undoneNodes, parentNode);
            }
        }
        // if (undoneNodes.length > 0) {
        //     // 清理现场
        //     //console.warn("Tree not complete!");
        // }
        tree.isComplete = undoneNodes.length === 0;
        return tree;
    }

    private makeSingleTreeLeafToRoot():FinTree {
        throw new NotImplementedError();
    }

    /**
     * 更新种群内所有个体的适应度。
     */
    private measureFitnessOfWholePopulation():void {
        var population = this._population;
        for (var i = 0; i < population.length; ++i) {
            population[i].calculateRankWeight();
        }
    }

    /**
     * 种群杂交，生成新的种群。修改新种群不会影响原种群。
     */
    private hybrid():FinTree[] {
        var population = this._population;
        var newPopulation:FinTree[] = [];
        var weightTable = makeWeightTable(population);
        for (var i = 0; i < population.length; ++i) {
            //console.log(`i: ${i}, population count: ${population.length}`);
            var parentIndices = randParent(weightTable);
            var p1 = population[parentIndices.p1], p2 = population[parentIndices.p2];

            var randomNode1 = p1.selectRandomNode();
            if (p2.canFindReplacementOf(randomNode1)) {
                // 移花接木，randomNode1 替换为 randomNode2
                // 保证返回类型兼容（返回 bool 的仍然返回 bool，返回 number 的仍然返回 number）
                var root = p1.root.clone();
                var tree = new FinTree(this.modelParams);
                tree.root = root;
                randomNode1 = tree.getNode(p1.getNodeIndex(randomNode1));
                var randomNode2:FinNode;
                do {
                    randomNode2 = p2.selectRandomNode();
                } while (Helper.getNodeReturnType(randomNode1) !== Helper.getNodeReturnType(randomNode2));
                randomNode2 = randomNode2.clone();
                randomNode2.parent = randomNode1.parent;
                var positions = ["lChild", "rChild", "cChild"];
                for (var j = 0; j < positions.length; ++j) {
                    var pos = positions[j];
                    if ((<any>randomNode1.parent)[pos] === randomNode1) {
                        (<any>randomNode1.parent)[pos] = randomNode2;
                        break;
                    }
                }
                newPopulation.push(tree);
            } else {
                // p2 无法选出可替换从 p1 中抽的节点的节点，重新进行此次替换过程
                --i;
            }
        }
        return newPopulation;
    }

    private _modelParams:ModelParams = null;
    private _population:FinTree[] = null;

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
 * @param selfHybrid {Boolean} 是否允许自交。
 * @returns {{p1: number, p2: number}}
 */
function randParent(weightTable:Range[], selfHybrid:boolean = false):{p1:number, p2:number} {
    var r = {p1: 0, p2: 0};
    var f1 = Math.random();
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
    do {
        var f2 = Math.random();
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
    } while (!selfHybrid && r.p1 === r.p2);
    return r;
}

function randomIn<T>(values:any[]):T {
    var index = (Math.random() * values.length) | 0;
    return <T>values[index];
}

type NodeGenerator = (tree:FinTree, parent:FinNode, value?:any) => FinNode;

const NodeGen:{[key:string]:NodeGenerator[]} = {
    "value": [ // 2
        FinNode.createBool,
        FinNode.createNumber,
        FinNode.createCurVal
    ],
    "op-bool": [ // 7
        FinNode.createAnd,
        FinNode.createOr,
        FinNode.createNot,
        FinNode.createGreater,
        FinNode.createLess,
        /*FinNode.createIfThen,
         FinNode.createIfThenElse*/
    ],
    "op-number": [ // 9
        FinNode.createPlus,
        FinNode.createMinus,
        FinNode.createTimes,
        FinNode.createDivide,
        FinNode.createNorm,
        FinNode.createAverage,
        FinNode.createMax,
        FinNode.createMin,
        FinNode.createLag
    ]
};

var GenMap = (function (gm:Map<NodeGenerator, FinOp>):Map<NodeGenerator,FinOp> {
    gm.set(FinNode.createNumber, FinOp.Invalid);
    gm.set(FinNode.createBool, FinOp.Invalid);
    gm.set(FinNode.createCurVal, FinOp.Invalid);
    gm.set(FinNode.createAnd, FinOp.And);
    gm.set(FinNode.createOr, FinOp.Or);
    gm.set(FinNode.createNot, FinOp.Not);
    gm.set(FinNode.createGreater, FinOp.Greater);
    gm.set(FinNode.createLess, FinOp.Less);
    gm.set(FinNode.createIfThen, FinOp.IfThen);
    gm.set(FinNode.createIfThenElse, FinOp.IfThenElse);
    gm.set(FinNode.createPlus, FinOp.Plus);
    gm.set(FinNode.createMinus, FinOp.Minus);
    gm.set(FinNode.createTimes, FinOp.Times);
    gm.set(FinNode.createDivide, FinOp.Divide);
    gm.set(FinNode.createNorm, FinOp.Norm);
    gm.set(FinNode.createAverage, FinOp.Average);
    gm.set(FinNode.createMax, FinOp.Max);
    gm.set(FinNode.createMin, FinOp.Min);
    gm.set(FinNode.createLag, FinOp.Lag);
    return gm;
})(new Map<NodeGenerator,FinOp>());

import {FinTree} from "./FinTree";
import {FinNode} from "./FinNode";
import {ModelParams} from "./ModelParams";
import {Helper} from "./Helper";
import {FOND} from "./FOND";
import {FinNodeType} from "./FinNodeType";

/**
 * 表示一个下限可取，上限不可取的范围。
 */
type Range = {start:number, end:number};

/**
 * 遗传算法的实现类。
 */
export class GA {

    /**
     * 创建新的遗传算法实现实例。
     * @param modelParams {ModelParams} 模型参数。
     */
    constructor(modelParams:ModelParams) {
        this._modelParams = modelParams;
    }

    /**
     * 模拟一次论文中描述的尝试。
     * @param elem {HTMLElement} 用来可视化显示树的 {@link HTMLElement}。
     */
    simulateOneTrial(elem:HTMLElement):void {
        console.info("Creating population...");
        var population = this.__makePopulation(this.modelParams.initialCount);
        console.info("Measuring fitness...");
        this.__measureFitnessOfWholePopulation();
        var fittestIndex = this.__getFittestIndexInPopulation();
        var fittest = population[fittestIndex];
        var newFittest:FinTree;
        // 一批25代
        const BATCH_EPOCH_COUNT = 25;
        var batchCounter = 0;
        // 最多计算2批
        const BATCH_LIMIT = 2;
        console.log("Original fittest:", fittest, " / #" + fittestIndex + " / value: ", fittest.fitness);
        do {
            console.info(`Creating new batch (${batchCounter + 1}/${BATCH_LIMIT})...`);
            // 对每一批里的每一代
            for (var i = 0; i < BATCH_EPOCH_COUNT; ++i) {
                // 杂交
                this._population = population = this.__hybrid();
                console.info(`Measuring fitness (${i + 1}/${BATCH_EPOCH_COUNT})...`);
                // 计算适应度
                this.__measureFitnessOfWholePopulation();
                // 选出本代内最优的个体
                fittestIndex = this.__getFittestIndexInPopulation();
                newFittest = population[fittestIndex];
                console.log(`Fittest in generation #${i + batchCounter * BATCH_EPOCH_COUNT + 1}:`, newFittest, " / #" + fittestIndex + " / value: ", newFittest.fitness);
                if (newFittest.fitness > fittest.fitness) {
                    console.info("New fittest found.");
                    fittest = newFittest;
                }
            }
            ++batchCounter;
        } while (newFittest.fitness <= fittest.fitness && batchCounter < BATCH_LIMIT);
        if (newFittest.fitness > fittest.fitness) {
            fittest = newFittest;
        }
        fittest.draw(elem);

        // 此时产生的 fittest 就是表达式，fittestValue 是最优解
        console.log("Overall fittest:", fittest, " / value: ", fittest.fitness);
    }

    /**
     * 获取创建遗传实例时的模型参数。
     * @returns {ModelParams}
     */
    get modelParams():ModelParams {
        return this._modelParams;
    }

    /**
     * 获取当前种群内最适宜的个体的索引。
     * @returns {Number}
     */
    private __getFittestIndexInPopulation():number {
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
     * @returns {FinTree[]}
     * @private
     */
    private __makePopulation(count:number):FinTree[] {
        var population:FinTree[] = new Array<FinTree>(count);
        for (var i = 0; i < count; ++i) {
            var tree:FinTree;
            do {
                tree = this.__makeSingleTree();
            } while (!tree.checkValidity());
            population[i] = tree;
        }
        this._population = population;
        return population;
    }

    /**
     * 生成一个 Lag 树，期望结果：tree._decisions 并不会恒为 true/false。
     * @returns {FinTree}
     * @private
     */
    private __makeSingleTreeDebug():FinTree {
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

    /**
     * 生成一棵树。
     * @returns {FinTree}
     * @private
     */
    private __makeSingleTree():FinTree {
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
                if (node.isLeaf && node.childCount < FOND[Helper.getNodeFondType(node)].childCount) {
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

    /**
     * 更新种群内所有个体的适应度。
     */
    private __measureFitnessOfWholePopulation():void {
        var population = this._population;
        for (var i = 0; i < population.length; ++i) {
            population[i].calculateRankWeight();
        }
    }

    /**
     * 种群杂交，生成新的种群。修改新种群不会影响原种群。
     * @returns {FinTree[]}
     */
    private __hybrid():FinTree[] {
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
 * 根据当前种群计算一个权重表，根据这张表抽选亲代。
 * @param population {FinTree[]} 当前种群。
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
        // 区间长度按照权重简单加和后归一化。而权重函数未必是线性函数，例如在5月版本中，就是一个指数-对数分段函数。
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
 * @param weightTable {Range[]} 权重表。
 * @param [selfHybrid] {Boolean} 是否允许自交。默认不允许自交。
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

/**
 * 在一个数组中按照依据平均随机抽取出一个元素。
 * @param values {*[]} 要抽取元素的数组。
 * @returns {T}
 */
function randomIn<T>(values:any[]):T {
    var index = (Math.random() * values.length) | 0;
    return <T>values[index];
}

type NodeGenerator = (tree:FinTree, parent:FinNode, value?:any) => FinNode;

/**
 * 节点生成函数一览对象。
 */
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

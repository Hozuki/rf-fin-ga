import {FinNode} from "./FinNode";
import {NotImplementedError} from "./NotImplementedError";

export class FinTree {

    constructor(root:FinNode) {
        this._root = root;
    }

    get root():FinNode {
        return this._root;
    }

    measureFitness():number {
        throw new NotImplementedError();
    }

    selectRandomNode():FinNode {
        // 广度遍历生成一个节点选择表
        // 第一层（根节点）永远不会去动它（废话，动了的话整棵树都变成另一棵了）
        var q:FinNode[] = [];
        var node = this.root;
        if (node.lChild !== null) {
            q.push(node.lChild);
        }
        if (node.rChild !== null) {
            q.push(node.rChild);
        }
        if (node.cChild !== null) {
            q.push(node.cChild);
        }
        // 这里也遍历后来添加进去的叶子节点，用时间换空间，这样就不需要准备一个结果队列了。
        var i = 0;
        while (i < q.length) {
            node = q[i];
            if (node.lChild !== null) {
                q.push(node.lChild);
            }
            if (node.rChild !== null) {
                q.push(node.rChild);
            }
            if (node.cChild !== null) {
                q.push(node.cChild);
            }
            ++i;
        }
        var selectedIndex = (Math.random() * q.length) | 0;
        return q[selectedIndex];
    }

    rankWeight:number = 0;

    private _root:FinNode = null;

}

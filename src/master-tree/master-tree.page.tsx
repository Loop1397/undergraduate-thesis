import { useState } from "react";
import styled from "styled-components";

const TreeWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #cf6a87;
`;

// grid=template-columnsにより各rowを何個で分けるかを決める
// --colsは下で計算する
const ParentTree = styled.div`
  display: grid;
  grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr));
  gap: 16px;
`;

// grid-template-columns: subgrid;でParentTree, ChildTreeのgrid-template-columnsの値を取ってくる
const TreeRow = styled.div`
  background-color: #574b90;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  min-height: 50px;
`;

const TreeNode = styled.div<{
  $start?: number;
  $end?: number;
  $span?: number;
}>`
  background-color:rgb(171, 128, 211);
  min-width: 50px;
  grid-column: ${({ $start, $end, $span }) => {
    if ($start != null && $end != null) return `${$start} / ${$end}`;
    if ($start != null && $span != null) return `${$start} / span ${$span}`;
    return 'auto';
  }};
`;

function MasterTree() {
  type Researcher = {
    id: number;
    parent: number[];
  };

  type Direction = 'ancestors' | 'descendants';

  // parent: [0] -> 師匠がいない
  const data: Researcher[] = [
    {
      id: 1,
      parent: [0],
    },
    {
      id: 2,
      parent: [0],
    },
    {
      id: 3,
      parent: [0],
    },
    {
      id: 4,
      parent: [0],
    },
    {
      id: 5,
      parent: [0],
    },
    {
      id: 6,
      parent: [1, 2, 3, 4],
    },
    {
      id: 7,
      parent: [5],
    },
    {
      id: 8,
      parent: [6, 7],
    },
    {
      id: 9,
      parent: [8, 900],
    },
    {
      id: 10,
      parent: [8, 900],
    },
    {
      id: 11,
      parent: [8],
    },
    {
      id: 12,
      parent: [9],
    },
    {
      id: 13,
      parent: [9],
    },
    {
      id: 14,
      parent: [9],
    },
    {
      id: 15,
      parent: [11],
    },
    {
      id: 16,
      parent: [11],
    },
    {
      id: 899,
      parent: [0],
    },
    {
      id: 900,
      parent: [899],
    },
  ];

  const [parentTree, setParentTree] = useState<number[][][]>();
  const [parentMaxCols, setParentMaxCols] = useState<number>(0);
  const [parentSpans, setParentSpans] = useState<number[][]>();

  const [childTree, setChildTree] = useState<number[][][]>();
  const [childMaxCols, setChildMaxCols] = useState<number>(0);
  const [childSpans, setChildSpans] = useState<number[][]>();

  /**
   * Treeを表すlistを作る関数
   * rootId: Treeのrootとなる研究者のid
   * maxDepth: 作られるTreeの深さ
   * direction: 作られるTreeが上(ancestors)か、下(descendants)かを決める
   * */
  const buildMasterTree = (rootId: number, maxDepth: number, direction: Direction) => {
    const tree: number[][][] = Array.from({ length: maxDepth }, () => [] as number[][]);
    const rootResearcher = data.find((d) => d.id === rootId);

    // 検索する研究者が間違っている時のエラー
    if (!rootResearcher) {
      console.error(`researcher ${rootId} is not founded!`);
      return;
    }

    // depth=1のところを初期化する
    if (direction === 'ancestors') {
      // ancestorsのときにはrootの師匠を探す
      tree[0].push(rootResearcher.parent);
    } else {
      // descendantsのときにはrootの弟子を探す
      const children = data.filter(d => d.parent.includes(rootId)).map(d => d.id);
      tree[0].push(children);
    }

    // maxColsのmaxを計算するための変数maxCount
    // 上で検索する研究者の師匠を先に入れたので、maxもそちに合わせて初期化しておく
    let maxCount = rootResearcher.parent.length;

    // 検索する研究者の師匠もしくは弟子に基づいてTreeを作っていく
    for (let i = 0; i < maxDepth - 1; i++) {
      // 現在のループのcolsを計算するための変数
      let currentRowCount = 0;

      tree[i].forEach((row) => {
        // 各idを一つずつ検索し、listに入れていく
        row.forEach((researcherId) => {
          if (direction === 'ancestors') {
            const parent = data.find((d) => d.id === researcherId);
            // もしデータを見つからなかったとき、dummy(空)のデータ(-1)を入れる。
            const parentNode = parent ? parent.parent : [0];
            tree[i + 1].push(parentNode);
            // 師匠の数をcurrentに足していく
            currentRowCount += parentNode.length;
          } else {
            const child = data.filter(d => d.parent.includes(researcherId)).map(d => d.id);
            tree[i + 1].push(child.length !== 0 ? child : [-1]);
            currentRowCount += child.length !== 0 ? child.length : 1;
          }
        });
      });
      // maxCountとcurrentを比較し、より大きい値をmaxCountに入れる
      maxCount = Math.max(maxCount, currentRowCount);
    }

    // direction === 'ancestors'の場合、Treeをreverseさせる
    if (direction === 'ancestors') {
      tree.reverse();
      // 検索結果をTreeとMaxColsに入れる
      setParentMaxCols(maxCount);
      setParentTree(tree);
      setParentSpans(computeTreeSpans(tree, direction));
    } else {
      setChildMaxCols(maxCount);
      setChildTree(tree);
      setChildSpans(computeTreeSpans(tree, direction));
    }


  };

  // 各nodeが持つ広さ(span)を求めるためのメッソド
  const computeTreeSpans = (tree: number[][][], direction: Direction): number[][] => {
    const spans: number[][] = [];
    // descendantsの場合、Treeをreverseさせる必要があるが、reverseは元のlistを変更させてしまう。
    // そのため、先にコピーすることで元のlistに影響を与えないようにする
    const tempTree = [...tree];

    // direction === 'descendants'の場合、Treeをreverseさせる
    if (direction === 'descendants') tempTree.reverse();

    console.log(tree);

    // 1行目は2行目からの準備であるため先に計算する
    spans[0] = tempTree[0].map((group) => group.length);

    for (let r = 1; r < tempTree.length; r++) {
      const prev = spans[r - 1];
      const groupSizes = tempTree[r].map((group) => group.length); // 이번 행에서 몇 개의 이전 그룹을 합치는가
      const rowSpans: number[] = [];

      let i = 0;
      for (const size of groupSizes) {
        rowSpans.push(prev.slice(i, i + size).reduce((acc, cur) => acc + cur, 0));
        i += size;
      }
      spans[r] = rowSpans;
    }

    if (direction === 'descendants') spans.reverse();

    return spans;
  }

  return (
    <>
      <button onClick={() => buildMasterTree(8, 2, 'ancestors')}>test1</button>
      <button onClick={() => buildMasterTree(8, 2, 'descendants')}>test2</button>
      <TreeWrapper>
        <ParentTree style={{ ["--cols" as any]: parentMaxCols }}>
          {parentTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === 0 ? row.flat().map(() => 1) : parentSpans![rowIdx - 1].slice();

            let curStart = 1;
            return (
              <TreeRow key={`parent-${rowIdx}`}>
                {
                  row.flat().map((id: any, idx: number) => {
                    // nodeが始まるところ
                    const start = curStart;
                    // nodeが終わるところ(start + span)
                    const end = start + spansForNodes[idx];
                    // 次のnodeが始まるところ
                    curStart += spansForNodes[idx];

                    return (
                      <TreeNode key={`${rowIdx}-${idx}`} $start={start} $end={end}>
                        {id}
                      </TreeNode>
                    );
                  })
                }
              </TreeRow>
            );
          })}
          {/* 検索を行った研究者のrow */}
          <TreeRow>
            <TreeNode key={`searchIdx`} $start={1} $end={-1}>idx</TreeNode>
          </TreeRow>
        </ParentTree>
        <ParentTree style={{ ["--cols" as any]: childMaxCols, marginTop: '16px' }}>
          {childTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === childTree.length - 1 ? row.flat().map(() => 1) : childSpans![rowIdx + 1].slice();

            let curStart = 1;
            return (
              <TreeRow key={`child-${rowIdx}`}>
                {
                  row.flat().map((id: any, idx: number) => {
                    // nodeが始まるところ
                    const start = curStart;
                    // nodeが終わるところ(start + span)
                    const end = start + spansForNodes[idx];
                    // 次のnodeが始まるところ
                    curStart += spansForNodes[idx];

                    return (
                      <TreeNode key={`${rowIdx}-${idx}`} $start={start} $end={end}>
                        {id}
                      </TreeNode>
                    );
                  })
                }
              </TreeRow>
            );
          })}
        </ParentTree>
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

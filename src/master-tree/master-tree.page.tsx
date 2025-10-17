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
  const [parentCols, setParentCols] = useState<number>(0);
  const [spans, setSpans] = useState<number[][]>();

  // ParentTreeを表すlistを作る関数
  const searchParentTree = (id: number, length: number) => {
    const parentTree: number[][][] = Array.from({ length: length }, () => [] as number[][]);
    const researcher = data.find((d) => d.id === id);

    // 検索する研究者が間違っている時のエラー
    if (!researcher) {
      console.error(`researcher ${id} is not founded!`);
      return;
    }

    // 検索する研究者の師匠を先に入れる
    parentTree[0].push(researcher.parent);

    // parentColsのmaxを計算するための変数max
    // 上で検索する研究者の師匠を先に入れたので、maxもそちに合わせて初期化しておく
    let max = researcher.parent.length;

    // 検索する研究者の師匠に基づいてparentTreeを作っていく
    for (let i = 0; i < length - 1; i++) {
      // 現在のループのcolsを計算するための変数
      let current = 0;
      parentTree[i].forEach((row) => {

        // parentのidを一つずつ検索し、listに入れていく
        row.forEach((researcherId) => {
          const parent = data.find((d) => d.id === researcherId);
          // もしデータを見つからなかったとき、dummyのデータ(-1)を入れる。
          if (parent) {
            parentTree[i + 1].push(parent.parent);
            // 師匠の数をcurrentに足していく
            current += parent.parent.length;
          } else {
            parentTree[i + 1].push([-1]);
            current += 1;
          }
        });

      });
      // maxとcurrentを比較し、より大きい値をmaxに入れる
      max = Math.max(max, current);
    }

    // 順番を師匠からにするためreverseさせる
    parentTree.reverse();

    // 検索結果をparentTreeとparentColsに入れる
    setParentCols(max);
    setParentTree(parentTree);
    setSpans(computeTreeSpans(parentTree));
  };

  // 各nodeが持つ広さ(span)を求めるためのメッソド
  const computeTreeSpans = (tree: number[][][]): number[][] => {
    const spans: number[][] = [];

    // 1行目は2行目からの準備であるため先に計算する
    spans[0] = tree[0].map((group) => group.length);

    for (let r = 1; r < tree.length; r++) {
      const prev = spans[r - 1];
      const groupSizes = tree[r].map((group) => group.length); // 이번 행에서 몇 개의 이전 그룹을 합치는가
      const rowSpans: number[] = [];

      let i = 0;
      for (const size of groupSizes) {
        rowSpans.push(prev.slice(i, i + size).reduce((acc, cur) => acc + cur, 0));
        i += size;
      }
      spans[r] = rowSpans;
    }

    return spans;
  }

  return (
    <>
      <button onClick={() => searchParentTree(8, 2)}>test</button>
      <TreeWrapper>
        <ParentTree style={{ ["--cols" as any]: parentCols }}>
          {parentTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === 0 ? row.flat().map(() => 1) : spans![rowIdx - 1].slice();

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
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

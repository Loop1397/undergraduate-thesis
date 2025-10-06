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
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
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

function MasterTree() {
  type Researcher = {
    id: number;
    parent: number[];
  };

  const data: Researcher[] = [
    {
      id: 1,
      parent: [],
    },
    {
      id: 2,
      parent: [],
    },
    {
      id: 3,
      parent: [],
    },
    {
      id: 4,
      parent: [],
    },
    {
      id: 5,
      parent: [],
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
      parent: [],
    },
    {
      id: 900,
      parent: [899],
    },
  ];

  const [parentTree, setParentTree] = useState<number[][][]>();
  const [parentCols, setParentCols] = useState<number>(0);

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
      parentTree[i].forEach((row) => {
        // 現在のループのcolsを計算するための変数
        let current = 0;

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
          }
        });

        // maxとcurrentを比較し、より大きい値をmaxに入れる
        max = Math.max(max, current);
      });
    }

    // 順番を師匠からにするためreverseさせる
    parentTree.reverse();

    // console.log(max);
    // console.log(parentTree);

    // 検索結果をparentTreeとparentColsに入れる
    setParentCols(max);
    setParentTree(parentTree);
  };

  return (
    <>
      <button onClick={() => searchParentTree(8, 2)}>test</button>
      <TreeWrapper>
        <ParentTree style={{ ["--cols" as any]: Math.max(1, parantTree.length) }}>
          <TreeRow>1</TreeRow>
          <TreeRow>2</TreeRow>
        </ParentTree>
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

import { useEffect, useState } from "react";
import { printJsonData } from "./master-tree.util";
import { TreeWrapper, AdvisorTree, TreeRow, TreeNode } from "./master-tree.component"

// import JsonData 
import researcherData from '../../data.json';

function MasterTree() {
  type Researcher = {
    id: number;
    advisor: number[];
  };

  type Direction = "ancestors" | "descendants";

  const data: Researcher[] = [
    {
      id: 1,
      advisor: [],
      advisees: [6]
    },
    {
      id: 2,
      advisor: [],
      advisees: [6]
    },
    {
      id: 3,
      advisor: [],
      advisees: [6]
    },
    {
      id: 4,
      advisor: [],
      advisees: [6]
    },
    {
      id: 5,
      advisor: [],
      advisees: [7]
    },
    {
      id: 6,
      advisor: [1, 2, 3, 4],
      advisees: [8]
    },
    {
      id: 7,
      advisor: [5],
      advisees: [8]
    },
    {
      id: 8,
      advisor: [6, 7, 100],
      advisees: [9, 10, 11]
    },
    {
      id: 9,
      advisor: [8, 900],
      advisees: [12, 13, 14]
    },
    {
      id: 10,
      advisor: [8, 900],
      advisees: []
    },
    {
      id: 11,
      advisor: [8],
      advisees: [15, 16]
    },
    {
      id: 12,
      advisor: [9],
      advisees: []
    },
    {
      id: 13,
      advisor: [9],
      advisees: []
    },
    {
      id: 14,
      advisor: [9],
      advisees: []
    },
    {
      id: 15,
      advisor: [11],
      advisees: []
    },
    {
      id: 16,
      advisor: [11],
      advisees: []
    },
    {
      id: 100,
      advisor: [],
      advisees: [8]
    },
    {
      id: 899,
      advisor: [],
      advisees: [900]
    },
    {
      id: 900,
      advisor: [899],
      advisees: [9, 10]
    },
  ];

  const [advisorTree, setAdvisorTree] = useState<number[][][]>();
  const [advisorMaxCols, setAdvisorMaxCols] = useState<number>(0);
  const [advisorSpans, setAdvisorSpans] = useState<number[][]>();

  const [adviseeTree, setAdviseeTree] = useState<number[][][]>();
  const [adviseeMaxCols, setAdviseeMaxCols] = useState<number>(0);
  const [adviseeSpans, setAdviseeSpans] = useState<number[][]>();

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
    // ancestorsのときにはrootの1個上の師匠を探す
    // descendantsのときにはrootの1個下の弟子を探す
    direction === "ancestors" ? tree[0].push(rootResearcher.advisor) : tree[0].push(rootResearcher.advisees)

    // maxColsのmaxを計算するための変数maxCount
    // 上で検索する研究者の師匠か弟子を先に入れたので、maxもそちに合わせて初期化しておく
    let maxCount = tree[0].length;

    // 検索する研究者の師匠もしくは弟子に基づいてTreeを作っていく
    for (let i = 0; i < maxDepth - 1; i++) {
      // 現在のループのcolsを計算するための変数
      let currentRowCount = 0;

      tree[i].forEach((row) => {
        // 各idを一つずつ検索し、listに入れていく
        row.forEach((researcherId) => {
          if (direction === "ancestors") {
            const advisor = data.find((d) => d.id === researcherId);
            // もしデータを見つからなかったとき、dummy(空)のデータ(-1)を入れる。
            const advisorNode = advisor ? advisor.advisor : [-1];
            tree[i + 1].push(advisorNode);
            // 師匠の数をcurrentに足していく
            currentRowCount += advisorNode.length;
          } else {
            const advisee = data.filter((d) => d.advisor.includes(researcherId)).map((d) => d.id);
            tree[i + 1].push(advisee.length !== 0 ? advisee : [-1]);
            currentRowCount += advisee.length !== 0 ? advisee.length : 1;
          }
        });
      });
      // maxCountとcurrentを比較し、より大きい値をmaxCountに入れる
      maxCount = Math.max(maxCount, currentRowCount);
    }

    // direction === 'ancestors'の場合、Treeをreverseさせる
    if (direction === "ancestors") {
      tree.reverse();
      // 検索結果をTreeとMaxColsに入れる
      setAdvisorMaxCols(maxCount);
      setAdvisorTree(tree);
      setAdvisorSpans(computeTreeSpans(tree, direction));
    } else {
      setAdviseeMaxCols(maxCount);
      setAdviseeTree(tree);
      setAdviseeSpans(computeTreeSpans(tree, direction));
    }
  };

  // 各nodeが持つ広さ(span)を求めるためのメッソド
  const computeTreeSpans = (tree: number[][][], direction: Direction): number[][] => {
    const spans: number[][] = [];
    // descendantsの場合、Treeをreverseさせる必要があるが、reverseは元のlistを変更させてしまう。
    // そのため、先にコピーすることで元のlistに影響を与えないようにする
    const tempTree = [...tree];

    // direction === 'descendants'の場合、Treeをreverseさせる
    if (direction === "descendants") tempTree.reverse();

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

    if (direction === "descendants") spans.reverse();

    return spans;
  };

  // ページローディング時に実行
  useEffect(() => {
    printJsonData();
  }, []);

  return (
    <>
      <button onClick={() => buildMasterTree(8, 2, "ancestors")}>test1</button>
      <button onClick={() => buildMasterTree(8, 2, "descendants")}>test2</button>
      <TreeWrapper>
        <AdvisorTree style={{ ["--cols" as any]: advisorMaxCols }}>
          {advisorTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === 0 ? row.flat().map(() => 1) : advisorSpans![rowIdx - 1].slice();

            let curStart = 1;
            return (
              <TreeRow key={`advisor-${rowIdx}`}>
                {row.flat().map((id: any, idx: number) => {
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
                })}
              </TreeRow>
            );
          })}
          {/* 検索を行った研究者のrow */}
          <TreeRow>
            <TreeNode key={`searchIdx`} $start={1} $end={-1}>
              idx
            </TreeNode>
          </TreeRow>
        </AdvisorTree>
        <AdvisorTree style={{ ["--cols" as any]: adviseeMaxCols, marginTop: "16px" }}>
          {adviseeTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === adviseeTree.length - 1 ? row.flat().map(() => 1) : adviseeSpans![rowIdx + 1].slice();

            let curStart = 1;
            return (
              <TreeRow key={`advisee-${rowIdx}`}>
                {row.flat().map((id: any, idx: number) => {
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
                })}
              </TreeRow>
            );
          })}
        </AdvisorTree>
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

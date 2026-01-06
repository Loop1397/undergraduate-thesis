import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { computeTreeSpans, renderLines, createLine, getResearcherInfo } from "./master-tree.util";
import { TreeWrapper, AcademicLineageTree, TreeRow, TreeNode, HumanIcon } from "./master-tree.component";

// import data
import researcherData from "../../data.json";
import relationData from "../../relation-data.json";

import "./master-tree.css";
import type { Researcher, Direction } from "../types/master-tree";

function MasterTree() {
  // TreeWrapperの状態を追跡するためのref
  const treeWrapperRef = useRef<HTMLDivElement | null>(null);
  // SVG elementを入れるためのref
  const svgRef = useRef<SVGSVGElement | null>(null);

  const data: Researcher[] = [
    {
      id: 1,
      advisors: [],
      advisees: [6],
    },
    {
      id: 2,
      advisors: [],
      advisees: [6],
    },
    {
      id: 3,
      advisors: [],
      advisees: [6],
    },
    {
      id: 4,
      advisors: [],
      advisees: [6],
    },
    {
      id: 5,
      advisors: [],
      advisees: [7],
    },
    {
      id: 6,
      advisors: [1, 2, 3, 4],
      advisees: [8],
    },
    {
      id: 7,
      advisors: [5],
      advisees: [8],
    },
    {
      id: 8,
      advisors: [6, 7, 100],
      advisees: [9, 10, 11],
    },
    {
      id: 9,
      advisors: [8, 500],
      advisees: [12, 13, 14],
    },
    {
      id: 10,
      advisors: [8, 500],
      advisees: [],
    },
    {
      id: 11,
      advisors: [8],
      advisees: [15, 16],
    },
    {
      id: 12,
      advisors: [9],
      advisees: [],
    },
    {
      id: 13,
      advisors: [9],
      advisees: [],
    },
    {
      id: 14,
      advisors: [9],
      advisees: [],
    },
    {
      id: 15,
      advisors: [11],
      advisees: [],
    },
    {
      id: 16,
      advisors: [11],
      advisees: [],
    },
    {
      id: 100,
      advisors: [],
      advisees: [8],
    },
    {
      id: 499,
      advisors: [],
      advisees: [500],
    },
    {
      id: 500,
      advisors: [499],
      advisees: [9, 10],
    },
  ];

  // 検索するindexとdepthを入れるためのstate
  const [searchIdx, setSearchIdx] = useState<number>(8);
  const [searchDepth, setSearchDepth] = useState<number>(2);

  const [inputValue, setInputValue] = useState<string>("8");

  // TreeWrapperの大きさを入れるためのstate
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

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
    direction === "ancestors" ? tree[0].push(rootResearcher.advisors) : tree[0].push(rootResearcher.advisees);

    // maxColsのmaxを計算するための変数maxCount
    // 上で検索する研究者の師匠か弟子を先に入れたので、maxもそちに合わせて初期化しておく
    let maxCount = tree[0][0].length;

    // 検索する研究者の師匠もしくは弟子に基づいてTreeを作っていく
    for (let i = 0; i < maxDepth - 1; i++) {
      // 現在のループのcolsを計算するための変数
      let currentRowCount = 0;

      tree[i].forEach((row) => {
        // 各idを一つずつ検索し、listに入れていく
        row.forEach((researcherId) => {
          // 特定のidを持つ師匠もしくは弟子を探す
          const nextData = data.find((d) => d.id === researcherId);
          // その師匠が持つもう1個上の師匠、またはその弟子が持つもう1個下の弟子を探す
          // もしない場合、[0]を入れる
          const nextNode = direction === "ancestors" ? (nextData ? nextData.advisors : [0]) : nextData ? nextData.advisees : [0];

          // nextNodeをツリーに追加
          tree[i + 1].push(nextNode.length !== 0 ? nextNode : [0]);
          // nextNodeの数をcurrentRowCountにだしていく
          currentRowCount += nextNode.length !== 0 ? nextNode.length : 1;
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

  // ページローディング時に実行
  useEffect(() => {}, []);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (!treeWrapperRef.current) return;
      const rect = treeWrapperRef.current.getBoundingClientRect();
      setWrapperSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    // ブラウザの大きさが変わるたびにupdateSizeを実行
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // searchIdxやsearchDepthが変えられたらMasterTreeを更新
  useLayoutEffect(() => {
    // SVG初期化
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    buildMasterTree(searchIdx, searchDepth, "ancestors");
    buildMasterTree(searchIdx, searchDepth, "descendants");
  }, [searchIdx, searchDepth]);

  // adviseeTreeが変わり、新しいnode達がレンダリングされたら実行
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!adviseeTree) return;

    renderLines(adviseeTree, searchIdx, svgRef.current, "descendants");
  }, [adviseeTree]);

  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!advisorTree) return;

    renderLines([...advisorTree].reverse(), searchIdx, svgRef.current, "ancestors");
  }, [advisorTree]);

  return (
    <>
      <div id="input-wrapper">
        {/* TODO
          현재는 input을 숫자로 받고 있지만 추후에 문자열(사람 이름)로 input을 받고 검색할 수 있도록 변경해야함
        */}
        <p id="input-wrapper-title">Search query</p>
        <div
          id="query-input-wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === `Enter`) setSearchIdx(Number(e.currentTarget.value));
            }}
          />
          <div
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setSearchIdx(Number(inputValue));
            }}
          >
            <p id="magnifier">⌕</p>
          </div>
        </div>
        <p id="input-wrapper-title">Depth</p>
        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={searchDepth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchDepth(Number(e.target.value));
          }}
        />
      </div>
      <div className="horizon"></div>
      {/* svgのposition:'absolute'のためにposition: 'relative'を付与 */}
      <TreeWrapper id={`tree-wrapper`} ref={treeWrapperRef} style={{ position: "relative" }}>
        {/* canvas */}
        <svg
          id="wires"
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          width={wrapperSize.width}
          height={wrapperSize.height}
          viewBox={`0 0 ${wrapperSize.width} ${wrapperSize.height}`}
          style={{
            position: "absolute",
          }}
        />

        {/**
        Adviser tree
        */}
        <AcademicLineageTree style={{ ["--cols" as any]: advisorMaxCols }}>
          {advisorTree?.map((row, rowIdx) => {
            // spansから各nodeのspan(広さ)情報を持ってくる
            // ただし、rowIdx===0のときのnodeの大きさは全て1にする
            const spansForNodes = rowIdx === 0 ? row.flat().map(() => 1) : advisorSpans![rowIdx - 1].slice();

            // rowの全ての中身が0の場合、何も出力しない
            if (row.flat().every((node: number) => node === 0)) return;

            let curStart = 1;
            return (
              <TreeRow id={`advisor-${advisorTree.length - 1 - rowIdx}`} key={`advisor-${advisorTree.length - 1 - rowIdx}`}>
                {row.flat().map((id: any, idx: number) => {
                  // nodeが始まるところ
                  const start = curStart;
                  // nodeが終わるところ(start + span)
                  const end = start + spansForNodes[idx];
                  // 次のnodeが始まるところ
                  curStart += spansForNodes[idx];

                  // advisorがいない場合、何も出力しない
                  if (id === 0) return <div></div>;

                  return (
                    <TreeNode id={`node${id !== 0 ? id : "blank"}`} className={`node${id !== 0 ? id : "blank"}`} key={`${rowIdx}-${idx}`} $start={start} $end={end}>
                      {(() => {
                        const researcherInfo = getResearcherInfo(Number(id));
                        return (
                          <>
                            <HumanIcon />
                            <p>{researcherInfo[`name`][0]}</p>
                            <p>{researcherInfo[`affiliation`]}</p>
                          </>
                        );
                      })()}
                    </TreeNode>
                  );
                })}
              </TreeRow>
            );
          })}

          {/* 検索を行った研究者のrow */}
          <TreeRow>
            <TreeNode id={`node${searchIdx}`} className={"idx"} key={`node${searchIdx}`} $start={1} $end={-1}>
              {(() => {
                const researcherInfo = getResearcherInfo(Number(searchIdx));
                return (
                  <>
                    <HumanIcon />
                    <p>{researcherInfo[`name`][0]}</p>
                    <p>{researcherInfo[`affiliation`]}</p>
                  </>
                );
              })()}
            </TreeNode>
          </TreeRow>
        </AcademicLineageTree>

        {/**
        Advisee tree
        */}
        <AcademicLineageTree style={{ ["--cols" as any]: adviseeMaxCols, marginTop: "16px" }}>
          {adviseeTree?.map((row, rowIdx) => {
            const spansForNodes = rowIdx === adviseeTree.length - 1 ? row.flat().map(() => 1) : adviseeSpans![rowIdx + 1].slice();

            // rowの全ての中身が0の場合、何も出力しない
            if (row.flat().every((node: number) => node === 0)) return;

            let curStart = 1;
            return (
              <TreeRow id={`advisee-${rowIdx}`} key={`advisee-${rowIdx}`}>
                {row.flat().map((id: any, idx: number) => {
                  const start = curStart;
                  const end = start + spansForNodes[idx];
                  curStart += spansForNodes[idx];

                  // adviseeがいない場合、何も出力しない
                  if (id === 0) return <div></div>;

                  return (
                    <TreeNode id={`node${id !== 0 ? id : "blank"}`} className={`node${id !== 0 ? id : "blank"}`} key={`${rowIdx}-${idx}`} $start={start} $end={end}>
                      {(() => {
                        const researcherInfo = getResearcherInfo(Number(id));
                        return (
                          <>
                            <HumanIcon />
                            <p>{researcherInfo[`name`][0]}</p>
                            <p>{researcherInfo[`affiliation`]}</p>
                          </>
                        );
                      })()}
                    </TreeNode>
                  );
                })}
              </TreeRow>
            );
          })}
        </AcademicLineageTree>
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

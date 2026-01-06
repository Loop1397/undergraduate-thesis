import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { computeTreeSpans, renderLines, createLine, getResearcherInfo, buildMasterTree, getResearcherIdFromName } from "./master-tree.util";
import { TreeWrapper, AcademicLineageTree, TreeRow, TreeNode, HumanIcon } from "./master-tree.component";

import "./master-tree.css";
import type { Researcher, Direction } from "../types/master-tree.type";

function MasterTree() {
  // TreeWrapperの状態を追跡するためのref
  const treeWrapperRef = useRef<HTMLDivElement | null>(null);
  // SVG elementを入れるためのref
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 検索するindexとdepthを入れるためのstate
  const [searchQuery, setSearchQuery] = useState<string>("西田 豊明");
  const [searchDepth, setSearchDepth] = useState<number>(2);

  const [inputValue, setInputValue] = useState<string>("西田 豊明");

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
  const setMasterTree = (rootId: number, maxDepth: number, direction: Direction) => {
    const { tree, maxCount } = buildMasterTree(rootId, maxDepth, direction);

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

    const searchIdx = getResearcherIdFromName(searchQuery);

    setMasterTree(searchIdx, searchDepth, "ancestors");
    setMasterTree(searchIdx, searchDepth, "descendants");
  }, [searchQuery, searchDepth]);

  // adviseeTreeが変わり、新しいnode達がレンダリングされたら実行
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!adviseeTree) return;

    const searchIdx = getResearcherIdFromName(searchQuery);
    renderLines(adviseeTree, searchIdx, svgRef.current, "descendants");
  }, [adviseeTree]);

  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!advisorTree) return;

    const searchIdx = getResearcherIdFromName(searchQuery);
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
              if (e.key === `Enter`) setSearchQuery(e.currentTarget.value);
            }}
          />
          <div
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setSearchQuery(inputValue);
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
            <TreeNode id={`node${searchQuery}`} className={"idx"} key={`node${searchQuery}`} $start={1} $end={-1}>
              {(() => {
                const researcherInfo = getResearcherInfo(getResearcherIdFromName(searchQuery));
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

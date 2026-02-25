import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { computeTreeSpans, renderLines, getResearcherInfo, buildMasterTree, getResearcherIdFromName } from "./master-tree.util";
import { TreeWrapper, AcademicLineageTree, TreeRow } from "./components/AcademicLineageTree.component";

import "./master-tree.css";
import type { Direction } from "../types/master-tree.type";
import { SearchControlPanel } from "./components/SearchControlPanel.component";
import { SearchQueryInput } from "./components/SearchQueryInput.component";
import { DepthSlider } from "./components/DepthSlider.component";
import { TreeNode } from "./components/TreeNode.component";

function MasterTree() {
  // TreeWrapperの状態を追跡するためのref
  const treeWrapperRef = useRef<HTMLDivElement | null>(null);
  // SVG elementを入れるためのref
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 検索する単語(query)とdepthを入れるためのstate
  const [searchQuery, setSearchQuery] = useState<string>("西田 豊明");
  const [searchDepth, setSearchDepth] = useState<number>(2);

  // queryを基に検索される研究者のid
  const [searchIdx, setSearchIdx] = useState<number>(getResearcherIdFromName("西田 豊明"));

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

  // searchQueryを基に検索を行う関数
  const executeSearchBySearchQuery = () => {

    // 研究者のidを検索する
    const idx = getResearcherIdFromName(searchQuery);
    // -1が返ってきたら、研究者が見つからなかったというエラーを出す
    if (idx === -1) {
      alert(`研究者"${searchQuery}"が見つかりませんでした！`);
      return 0;
    }

    setSearchIdx(idx);
  };

  // ページローディング時に実行
  useEffect(() => { }, []);

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

  // searchIdxもしくはsearchDepthが変えられたらMasterTreeを更新
  useLayoutEffect(() => {
    // SVG初期化
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    setMasterTree(searchIdx, searchDepth, "ancestors");
    setMasterTree(searchIdx, searchDepth, "descendants");
  }, [searchIdx, searchDepth]);

  // adviseeTreeが変わり、新しいnode達がレンダリングされたら実行
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!adviseeTree) return;

    renderLines(adviseeTree, searchIdx, svgRef.current, "descendants");
  }, [adviseeTree]);

  // adviseeTreeと同様に、advisorTreeが変わり、新しいnode達がレンダリングされたら実行
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    if (!advisorTree) return;

    renderLines([...advisorTree].reverse(), searchIdx, svgRef.current, "ancestors");
  }, [advisorTree]);

  const Tree = ({
    tree,
    spans,
    maxCols,
    direction,
  }: {
    tree: number[][][] | undefined;
    spans: number[][] | undefined;
    maxCols: number;
    direction: Direction;
  }) => (
    <AcademicLineageTree style={{ ["--cols" as any]: maxCols }}>
      {tree?.map((row, rowIdx) => {
        // spansから各nodeのspan(広さ)情報を持ってくる
        // ただし、rowIdx===0のときのnodeの大きさは全て1にする
        const spansForNodes =
          direction === "ancestors"
            ? rowIdx === 0
              ? row.flat().map(() => 1)
              : spans![rowIdx - 1]
            : rowIdx === tree.length - 1
              ? row.flat().map(() => 1)
              : spans![rowIdx + 1];

        // rowの全ての中身が0の場合、何も出力しない
        if (row.flat().every((node) => node === 0)) return null;

        let curStart = 1;
        const rowId = direction === "ancestors" ? `advisor-${tree.length - 1 - rowIdx}` : `advisee-${rowIdx}`;
        return (
          <TreeRow id={rowId}>
            {row.flat().map((id, idx) => {
              // nodeが始まるところ
              const start = curStart;
              // nodeが終わるところ(start + span)
              const end = start + spansForNodes[idx];
              // 次のnodeが始まるところ
              curStart += spansForNodes[idx];

              // advisorやadviseeがいない場合の空白を作るための処理
              if (id === 0) return <div key={`${rowIdx}-${idx}`}></div>;

              return (
                <TreeNode
                  id={`node${id !== 0 ? id : "blank"}`}
                  className={`node${id !== 0 ? id : "blank"}`}
                  key={`${rowIdx}-${idx}`}
                  start={start}
                  end={end}
                  researcherInfo={getResearcherInfo(Number(id))}
                />
              );
            })}
          </TreeRow>
        );
      })}
    </AcademicLineageTree>
  );

  return (
    <>
      <SearchControlPanel>
        <SearchQueryInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={executeSearchBySearchQuery}
        />
        <DepthSlider
          value={searchDepth}
          onChange={setSearchDepth}
        />
      </SearchControlPanel>
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
        <Tree tree={advisorTree} spans={advisorSpans} maxCols={advisorMaxCols} direction="ancestors" />
        {/* 検索を行った研究者のrow */}
        <TreeRow>
          <TreeNode
            id={`node${searchIdx}`}
            className={"rootResearcher"}
            key={`node${searchIdx}`}
            start={1}
            end={-1}
            researcherInfo={getResearcherInfo(Number(searchIdx))}
          />
        </TreeRow>
        {/**
        Advisee tree
        */}
        <Tree tree={adviseeTree} spans={adviseeSpans} maxCols={adviseeMaxCols} direction="descendants" />
      </TreeWrapper>
    </>
  );
}

export default MasterTree;

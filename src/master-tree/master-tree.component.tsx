import styled from "styled-components";

export const TreeWrapper = styled.div`
  width: 100%;
  height: 100vh;
  // background-color: #cf6a87;
`;

// grid=template-columnsにより各rowを何個で分けるかを決める
// --colsは下で計算する
export const AcademicLineageTree = styled.div`
  display: grid;
  grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr));
  gap: 16px;
`;

// grid-template-columns: subgrid;でAdvisorTree, AdviseeTreeのgrid-template-columnsの値を取ってくる
export const TreeRow = styled.div`
  // background-color: #574b90;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  min-height: 50px;
`;

export const TreeNode = styled.div<{
  $start?: number;
  $end?: number;
  $span?: number;
}>`
  background-color: rgb(171, 128, 211);
  min-width: 50px;
  grid-column: ${({ $start, $end, $span }) => {
    if ($start != null && $end != null) return `${$start} / ${$end}`;
    if ($start != null && $span != null) return `${$start} / span ${$span}`;
    return "auto";
  }};
`;
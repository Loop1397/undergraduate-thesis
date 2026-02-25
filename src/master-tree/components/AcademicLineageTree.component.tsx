import styled from "styled-components";

export const TreeWrapper = styled.div`
  width: 100%;
  height: 100vh;
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
  background-color: #ffffff;
  min-width: 50px;
  padding: 4px;
  border: solid 1px #eeeeee;
  border-radius: 5px;
  grid-column: ${({ $start, $end, $span }) => {
    if ($start != null && $end != null) return `${$start} / ${$end}`;
    if ($start != null && $span != null) return `${$start} / span ${$span}`;
    return "auto";
  }};
`;

export const HumanIcon = styled.img.attrs({
  src: "/humanIcon.png",
})`
  width: 28px;
  height: 28px;
  color: #6775c9;
`;

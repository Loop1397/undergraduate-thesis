import styled from "styled-components";

export const TreeWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
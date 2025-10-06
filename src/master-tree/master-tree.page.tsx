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

  const [parantTree, setParentTree] = useState([[6, 7], [8]]);

  return (
    <>
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

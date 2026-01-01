import researcherData from "../../data.json";

/**
 * 入力されたIDを持っている研究者のデータを返すメッソド
 * @param researcherId(Number): 研究者のID
 * @returns
 */
export const getResearcherInfo = (researcherId: number) => {
  return researcherData[researcherId - 1];
};

// 各nodeが持つ広さ(span)を求めるためのメッソド
export const computeTreeSpans = (tree: number[][][], direction: string): number[][] => {
  const spans: number[][] = [];
  // descendantsの場合、Treeをreverseさせる必要があるが、reverseは元のlistを変更させてしまう。
  // そのため、先にコピーすることで元のlistに影響を与えないようにする
  const tempTree = [...tree];

  // direction === 'descendants'の場合、Treeをreverseさせる
  if (direction === "descendants") tempTree.reverse();

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

/**
 * コンテナ(container)内の特定の要素(element)の特定の辺の中央座標値を求めるメッソド
 * element: 座標を求める要素
 * containter: elementが含まれているコンテナ
 * side: 上下左右の辺
 */
export const getEdgePoint = (element: HTMLDivElement, container: HTMLDivElement, side: string) => {
  const r = element.getBoundingClientRect();
  const c = container.getBoundingClientRect();

  // element의 중앙 좌표 계산
  const x = r.left + r.width / 2 - c.left;
  const y = r.top + r.height / 2 - c.top;

  if (side === "right") return { x: x + r.width / 2, y: y };
  else if (side === "left") return { x: x - r.width / 2, y: y };
  else if (side === "top") return { x: x, y: y - r.height / 2 };
  else if (side === "bottom") return { x: x, y: y + r.height / 2 };
  return { x: 0, y: 0 };
};

/**
 * 入力された座標を元に線を描くメッソド
 * x1 : 始点のx座標
 * y1 : 始点のy座標
 * x2 : 終点のx座標
 * y2 : 終点のy座標
 */
export const createLine = (x1: string, y1: string, x2: string, y2: string, svg: SVGSVGElement) => {
  // 직선 스타일
  const sw = `2`;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke-width", sw);
  svg.appendChild(line);
};

export const renderLines = (tree: number[][][], searchIdx: number, svg: SVGSVGElement, direction: string) => {
  const wrapper = document.getElementById(`tree-wrapper`) as HTMLDivElement | null;

  if (!wrapper) return;

  //   const array = [...tree];
  const array = JSON.parse(JSON.stringify(tree));

  array.unshift([[searchIdx]]);
  let type = `advisee`;

  if (direction === `ancestors`) {
    type = `advisor`;
  }

  for (let i = 0; i < array.length - 1; i++) {
    let idx = 0;
    for (let j = 0; j < array[i].length; j++) {
      console.log(`array[${i}][${j}] = ${array[i][j]}`);
      for (const node of array[i][j].values()) {
        const from = document.getElementById(`node${node}`) as HTMLDivElement | null;
        console.log(`i = ${i}, idx = ${idx}`);
        console.log(`node = ${node}`);
        console.log(array[i + 1][idx].every((node: number) => node === 0));
        console.log(array[i + 1][idx]);
        if (array[i + 1][idx].every((node: number) => node === 0)) {
          idx += 1;
          continue;
        }

        const toArray: HTMLDivElement[] = array[i + 1][idx].flatMap((n: number) => Array.from(document.querySelectorAll<HTMLDivElement>(`#${type}-${i} div.node${n !== 0 ? n : `blank`}`)));

        idx += 1;
        if (!from) return;

        if (direction === `descendants`) {
          const fromXY = getEdgePoint(from, wrapper, `bottom`);

          createLine(`${fromXY.x}`, `${fromXY.y}`, `${fromXY.x}`, `${fromXY.y + 8}`, svg);

          toArray.forEach((to) => {
            const toXY = getEdgePoint(to, wrapper, `top`);
            createLine(`${toXY.x}`, `${toXY.y}`, `${toXY.x}`, `${toXY.y - 8}`, svg);
          });

          const middleLineLeftXY = getEdgePoint(toArray[0], wrapper, "top");
          const middleLineRightXY = getEdgePoint(toArray[toArray.length - 1], wrapper, "top");
          createLine(`${middleLineLeftXY.x}`, `${middleLineLeftXY.y - 9}`, `${middleLineRightXY.x}`, `${middleLineRightXY.y - 9}`, svg);
        } else {
          const fromXY = getEdgePoint(from, wrapper, `top`);

          createLine(`${fromXY.x}`, `${fromXY.y}`, `${fromXY.x}`, `${fromXY.y - 8}`, svg);

          toArray.forEach((to) => {
            const toXY = getEdgePoint(to, wrapper, `bottom`);
            createLine(`${toXY.x}`, `${toXY.y}`, `${toXY.x}`, `${toXY.y + 8}`, svg);
          });

          const middleLineLeftXY = getEdgePoint(toArray[0], wrapper, "bottom");
          const middleLineRightXY = getEdgePoint(toArray[toArray.length - 1], wrapper, "bottom");
          createLine(`${middleLineLeftXY.x}`, `${middleLineLeftXY.y + 9}`, `${middleLineRightXY.x}`, `${middleLineRightXY.y + 9}`, svg);
        }
      }
    }
  }
};

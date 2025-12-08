import researcherData from '../../data.json';

export const printJsonData = () => {
    console.log(researcherData[0].name[0]);
}

// 各nodeが持つ広さ(span)を求めるためのメッソド
export const computeTreeSpans = (tree: number[][][], direction: string): number[][] => {
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

/**
     * コンテナ(container)内の特定の要素(element)の特定の辺の中央座標値を求める関数
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
    return { x: 0, y: 0 }
}

/**
         * 入力された座標を元に線を描く関数
         * x1 : 始点のx座標
         * y1 : 始点のy座標
         * x2 : 終点のx座標
         * y2 : 終点のy座標
         */
export const drawLine = (x1: string, y1: string, x2: string, y2: string, svg: SVGSVGElement) => {
    // 직선 스타일
    const stroke = "#c9c9c9";
    const sw = `2`;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", sw);
    svg.appendChild(line);
};

// function drawParentsToChild(pLeft, pRight, child, svg) {
//     // 부모 두 카드의 맞닿는 내부 가장자리 중간점 계산
//     const tree = svg.parentElement;
//     const a = edgePoint(pLeft, tree, "right");
//     const b = edgePoint(pRight, tree, "left");
//     const midX = (a.x + b.x) / 2;
//     const junctionY = (a.y + b.y) / 2;

//     // 자식 카드의 상단 중앙점
//     const childTopCenter = edgePoint(child, tree, "top");

//     // SVG 초기화
//     svg.setAttribute("viewBox", `0 0 ${ tree.clientWidth } ${ tree.clientHeight } `);
//     svg.setAttribute("width", tree.clientWidth);
//     svg.setAttribute("height", tree.clientHeight);
//     svg.innerHTML = "";

//     const c = edgePoint(pLeft, tree, "bottom");
//     const d = edgePoint(pRight, tree, "bottom");

//     const centerX = (c.x + d.x) / 2;
//     const centerY = (c.y + childTopCenter.y) / 2;

//     drawLine(c.x, c.y, c.x, centerY);
//     drawLine(d.x, d.y, d.x, centerY);
//     drawLine(c.x, centerY, d.x, centerY);
//     drawLine(centerX, centerY, centerX, childTopCenter.y);
// }

// TODO
// advisorTree에 대한 작업도 해야함
export const renderLines = (tree: number[][][], svg: SVGSVGElement) => {
    // SVG初期化
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    const wrapper = document.getElementById(`treeWrapper`) as HTMLDivElement | null;

    if (!wrapper) return;

    const array = [...tree];
    array.unshift([[8]]);
    console.log(array);

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array[i].length; j++) {
            console.log(i, j);
            array[i][j].forEach((node, idx) => {
                console.log(`START!!!!!!!!`);
                const from = document.getElementById(`node${node}`) as HTMLDivElement | null;;
                const to: HTMLDivElement[] = array[i + 1][idx]
                    .flatMap(n =>
                        Array.from(document.querySelectorAll<HTMLDivElement>(`#advisee-${i + 1} div.node${n !== 0 ? n : `blank`}`))
                    );

                if (!from) return;

                const fromXY = getEdgePoint(from, wrapper, `bottom`);

                console.log(fromXY);
                drawLine(`${fromXY.x}`, `${fromXY.y}`, `${fromXY.x}`, `${fromXY.y + 100}`, svg)

                console.log(`END!!!!!!!!`);
            });
        }

    }
};

import styled from "styled-components";
import type { Researcher } from "../../types/master-tree.type";

export const Node = styled.div<{
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

// start, end, spanはTreeNodeが配置される位置を決めるためのprops
// researcherInfoは研究者の情報を表示するためのprops
// 例えば、start=1, end=3の場合、grid-column: 1 / 3となり、1列目から2列目までのスペースを占めることになる
// React.HTMLAttributes<HTMLDivElement>は、idやclassNameなど、div要素の標準的な属性を一緒に受け取るための型
type TreeNodeProps = React.HTMLAttributes<HTMLDivElement> & {
    start?: number;
    end?: number;
    span?: number;
    researcherInfo: Researcher;
};

export const TreeNode = ({
    start,
    end,
    span,
    researcherInfo,
    /** 
     * ...rest = React.HTMLAttributes<HTMLDivElement>のpropsを展開して、
     * TreeNodeコンポーネントに渡すための記述
     * */
    ...rest
}: TreeNodeProps) => {
    return (
        <Node
            $start={start}
            $end={end}
            $span={span}
            // id, className, keyをはじめとする、div要素の標準的な属性をNodeStyleコンポーネントに渡す
            {...rest}
        >
            <HumanIcon />
            <p>{researcherInfo[`names`][0]}</p>
            <p>{researcherInfo[`affiliation`]}</p>
        </Node>
    );
};
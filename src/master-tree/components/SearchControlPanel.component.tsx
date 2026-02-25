import styled from "styled-components";

const PanelWrapper = styled.div`
    width: 100%;
    height: 50px;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 40px;
    gap: 20px;
`;

export const SearchControlPanel = ({ children }: any) => {
    return <PanelWrapper>{children}</PanelWrapper>;
};
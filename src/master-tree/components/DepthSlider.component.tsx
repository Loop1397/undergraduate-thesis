import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

export const RangeInput = styled.input.attrs({ type: "range" })`
    -webkit-appearance: none;
    width: 80px;
    height: 4px;
    background: #dddddd;
    border-radius: 2px;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: #6775c9;
        border-radius: 50%;
        cursor: pointer;
    }
`;

export const DepthSlider = ({
    value,
    onChange
}: { value: number, onChange: (value: number) => void }) => {
    return (
        <Wrapper>
            <p>Depth</p>
            <RangeInput
                type="range"
                min={1}
                max={3}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </Wrapper>
    );
};
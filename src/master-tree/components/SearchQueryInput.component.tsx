import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

const InputWrapper = styled.div`
    width: 180px;
    background-color:  #f3f7f9;
    padding: 3px 0px;
    border-radius: 5px;
    display: flex;
`;

const Input = styled.input`
    background-color: #f3f7f9;
    border: none;
    min-width: 0px;
    color: #505050;
    padding: 0px 6px;

    &:focus {
        outline: none;
    }
`;

const SearchButton = styled.div`
    width: 24px;
    height: 24px;
    color: #999999;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`

export const SearchQueryInput = ({
    value,
    onChange,
    onSubmit
}: {
    value: string,
    onChange: (value: string) => void,
    onSubmit: () => void
}) => {
    return (
        <Wrapper>
            <p>Search Query</p>
            <InputWrapper>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSubmit();
                    }}
                />
                <SearchButton onClick={onSubmit}>⌕</SearchButton>
            </InputWrapper>
        </Wrapper>
    );
};
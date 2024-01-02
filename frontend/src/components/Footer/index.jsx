import styled from "styled-components";

const StyledFooter = styled.footer`
    position: absolute;
    height: 2.5rem;
    line-height: 2.5rem;
    text-align: center;
    bottom: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const Footer = () => {
    return (
        <StyledFooter className="bg-light w-100">
            Copyright &copy; 2023 by Brandon Wu and Andy Wang
        </StyledFooter>
    );
};
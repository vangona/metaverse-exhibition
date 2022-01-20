import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    :hover {
        cursor: pointer;
    }
`;


const Invitation = ({onInvitationClick}) => {
    return (
        <Container onClick={onInvitationClick}>
            어서오세오. 시작하시려면 클릭하세오
        </Container>
    );
};

export default Invitation;
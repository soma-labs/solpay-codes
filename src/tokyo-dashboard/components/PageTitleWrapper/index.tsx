import {FC, ReactNode} from 'react';
import PropTypes from 'prop-types';
import {Box, Container, styled} from '@mui/material';

const PageTitle = styled(Box)(({theme}) => `
    padding: ${theme.spacing(3)};
    @media screen and (max-width: ${theme.breakpoints.values.md}px) {
        padding: ${theme.spacing(3)} ${theme.spacing(1)};
    }
`);

interface PageTitleWrapperProps {
    children?: ReactNode;
}

const PageTitleWrapper: FC<PageTitleWrapperProps> = ({children}) => {
    return (
        <PageTitle className="MuiPageTitle-wrapper">
            <Container maxWidth="xl">{children}</Container>
        </PageTitle>
    );
};

PageTitleWrapper.propTypes = {
    children: PropTypes.node.isRequired
};

export default PageTitleWrapper;

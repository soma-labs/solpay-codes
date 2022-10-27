import {useContext, useState} from "react";
import {AuthContext} from "../src/providers/auth-provider";
import Link from "next/link";
import AffiliateAccount from "../src/program/affiliate-accounts/affiliate-account";
import redeemReward from "../src/program/affiliate-accounts/redeem-reward";
import LoadingIcon from "../src/components/loading-icon";
import useAffiliateAccounts from "../src/hooks/useAffiliateAccounts";
import {PopupMessageContext, PopupMessageTypes} from "../src/providers/popup-message-provider";
import SimplePagination from "../src/components/simple-pagination";
import useQueryParamsPagination from "../src/hooks/useQueryParamsPagination";
import AffiliateAccountsTable from "../src/components/affiliates/affiliate-accounts-table";
import AuthenticatedPage from "../src/components/authenticated-page";
import {Box, Button, Card, CardHeader, Container, Divider, Typography} from "@mui/material";
import PageTitleWrapper from "../src/tokyo-dashboard/components/PageTitleWrapper";

export default function MyEarnings() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [refreshAffiliateAccounts, setRefreshAffiliateAccounts] = useState<number>(Date.now());
    const paginationOptions = useQueryParamsPagination();
    const {affiliateAccountsLoading, affiliateAccounts, pagination} = useAffiliateAccounts(
        {
            affiliate: wallet?.publicKey?.toString(),
        },
        refreshAffiliateAccounts,
        paginationOptions
    );

    const onClaimReward = async (affiliateAccount: AffiliateAccount) => {
        try {
            await redeemReward(
                {
                    owner: affiliateAccount.data.project_owner_pubkey,
                    candyMachineId: affiliateAccount.data.candy_machine_id,
                },
                wallet,
                connection
            );

            setRefreshAffiliateAccounts(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    const claimRewardButton = (affiliateAccount: AffiliateAccount) =>
        affiliateAccount.hasReachedTarget() ?
            <Button
                variant="contained"
                size="small"
                onClick={onClaimReward.bind(null, affiliateAccount)}
            >
                Claim Reward
            </Button>
            :
            <span style={{ cursor: 'not-allowed' }} title="Claim not available yet">
                <Button disabled size="small" variant="outlined">Claim Reward</Button>
            </span>;

    return (
        <AuthenticatedPage>
            <PageTitleWrapper>
                <Typography variant="h3" component="h3">
                    My Earnings
                </Typography>
            </PageTitleWrapper>

            <Container maxWidth="md" sx={{paddingBottom: 4}}>
                {affiliateAccountsLoading ? <LoadingIcon/> :
                    !affiliateAccounts.length ?
                        <Typography variant="h4" component="h4">
                            You must register as an affiliate with one of our
                            <Link href={`/`}><a className="link">projects</a></Link>
                            before you can see your earnings.
                        </Typography>
                        :

                        <Card>
                            <CardHeader title="Affiliated NFT Projects"/>

                            <Divider/>

                            <AffiliateAccountsTable affiliateAccounts={affiliateAccounts} actions={[claimRewardButton]}/>

                            {pagination.pageCount < 2 ? null :
                                <Box p={2}>
                                    <SimplePagination pagination={pagination} classVariation={`earnings-list`}/>
                                </Box>
                            }
                        </Card>
                }
            </Container>
        </AuthenticatedPage>
    );
}

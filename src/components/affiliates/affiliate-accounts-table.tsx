import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import AffiliateAccountRow from "./affiliate-account-row";

export type AffiliateAccountsTablePropsType = {
    affiliateAccounts: AffiliateAccount[],
    actions: any[],
};

export default function AffiliateAccountsTable({affiliateAccounts,  actions}: AffiliateAccountsTablePropsType) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Mints</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        affiliateAccounts.map(
                            (affiliateAccount, index) =>
                                <AffiliateAccountRow
                                    key={index}
                                    affiliateAccount={affiliateAccount}
                                    actions={actions}
                                />
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}

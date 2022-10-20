import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import AffiliateAccountRow from "./affiliate-account-row";

export type AffiliateAccountsTablePropsType = {
    affiliateAccounts: AffiliateAccount[],
    actions: any[],
};

export default function AffiliateAccountsTable({affiliateAccounts,  actions}: AffiliateAccountsTablePropsType) {
    return (
        <table className="affiliate-accounts-table table table-dark table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Mints</th>
                    <th>Progress</th>
                    <td>Actions</td>
                </tr>
            </thead>
            <tbody>
                {
                    affiliateAccounts.map(
                        (affiliateAccount, index) =>
                            <AffiliateAccountRow
                                key={index}
                                rowIndex={index}
                                affiliateAccount={affiliateAccount}
                                actions={actions}
                            />
                    )
                }
            </tbody>
        </table>
    );
}

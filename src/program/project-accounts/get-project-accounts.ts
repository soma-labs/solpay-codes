import {Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import ProjectAccount, {ProjectAccountDiscriminator} from "./project-account";
import {getPaginatedAccounts, PaginationOptionsType, PaginationType} from "../pagination-utils";

export type GetProjectAccountsOptionsType = {
    owner?: PublicKey,
} & PaginationOptionsType;

export type GetProjectAccountsReturnType = {
    items: ProjectAccount[],
    pagination: PaginationType
};

const getProjectAccounts = async (
    connection: Connection,
    options?: GetProjectAccountsOptionsType
): Promise<GetProjectAccountsReturnType> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(ProjectAccountDiscriminator))
            }
        }
    ];

    if (options?.owner) {
        filters.push({
            memcmp: {
                offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
                    + 1
                    + 1,
                bytes: bs58.encode(options.owner.toBuffer())
            }
        });
    }

    const accountsWithoutData = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            dataSlice: {
                offset: 0,
                length: 0,
            },
            filters: filters
        }
    );

    const accountKeys = accountsWithoutData.map(account => account.pubkey);
    const paginatedAccounts = await getPaginatedAccounts(
        connection,
        accountKeys,
        {
            page: options?.page,
            perPage: options?.perPage
        }
    );

    return {
        items: (paginatedAccounts.items
            .map(account => ProjectAccount.deserialize(account?.data))
            .filter(projectAccount => projectAccount !== null) as ProjectAccount[]),
        pagination: paginatedAccounts.pagination
    };
};

export default getProjectAccounts;

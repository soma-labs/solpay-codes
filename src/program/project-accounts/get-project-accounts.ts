import {Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import {bs58} from "@project-serum/anchor/dist/cjs/utils/bytes";
import ProjectAccount, {ProjectAccountDiscriminator} from "./project-account";
import {getPaginatedAccounts, PaginationOptionsType, PaginationType} from "../utils/pagination";
import {Buffer} from "buffer";
import {OrderOptionsType,} from "../utils/ordering";
import {DefaultProjectOrderOptions, ProjectTitleDataSlice} from "./ordering-helpers";

export type GetProjectAccountsOptionsType = {
    owner?: PublicKey,
    title?: string,
} & PaginationOptionsType & OrderOptionsType;

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

    //TODO: Consider searching in memory on the client side to avoid having to write the exact title
    if (options?.title) {
        filters.push({
            memcmp: {
                offset: ProjectTitleDataSlice.offset + 4,
                bytes: bs58.encode(Buffer.from(options.title))
            }
        });
    }

    let {dataSlice, getSliceFromAccountData, orderMethod} = DefaultProjectOrderOptions.orderBy!;
    let orderDir = DefaultProjectOrderOptions.orderDir!;

    if (options?.orderBy) {
        dataSlice = options.orderBy.dataSlice;
        getSliceFromAccountData = options.orderBy.getSliceFromAccountData;
        orderMethod = options.orderBy.orderMethod;
    }

    if (options?.orderDir) {
        orderDir = options.orderDir;
    }

    const accountsWithOrderingData = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            dataSlice: dataSlice,
            filters: filters
        }
    );

    orderMethod(accountsWithOrderingData, getSliceFromAccountData, orderDir);

    const accountKeys = accountsWithOrderingData.map(account => account.pubkey);
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

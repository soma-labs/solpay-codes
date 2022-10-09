import {AccountInfo, Connection, PublicKey} from "@solana/web3.js";

export const DefaultPerPage = 20;

export type PaginationOptionsType = {
    page?: number,
    perPage?: number,
};

export const DefaultPaginationOptions: PaginationOptionsType = {
    page: 1,
    perPage: DefaultPerPage
};

export type PaginationType = {
    pageCount: number,
    currentPage: number,
    prevPage: number | null,
    nextPage: number | null,
};

export type PaginatedAccountsReturnType = {
    items: Array<AccountInfo<Buffer>>,
    pagination: PaginationType,
};

export async function getPaginatedAccounts(
    connection: Connection,
    accountKeys: PublicKey[],
    options?: PaginationOptionsType
): Promise<PaginatedAccountsReturnType> {
    let page = 1;
    let perPage = DefaultPerPage;

    if (options?.perPage) {
        perPage = options?.perPage;
    }

    if (options?.page) {
        page = options.page;
    }

    if (page < 1) {
        page = 1;
    }

    if (perPage !== -1 && perPage < 1) {
        perPage = 1;
    }

    let pageCount: number;
    let accountInfos: (AccountInfo<Buffer> | null)[];

    if (perPage === -1) {
        pageCount = 1;
        accountInfos = await connection.getMultipleAccountsInfo(accountKeys);
    } else {
        pageCount = Math.ceil(accountKeys.length / perPage);
        accountInfos = await connection.getMultipleAccountsInfo(accountKeys.slice((page - 1) * perPage, page * perPage));
    }

    const nonNullAccountInfos = (accountInfos.filter(account => account !== null) as Array<AccountInfo<Buffer>>);

    return {
        items: nonNullAccountInfos,
        pagination: {
            pageCount: pageCount,
            currentPage: page,
            prevPage: perPage !== -1 && (page - 1 > 0) ? page - 1 : null,
            nextPage: perPage !== -1 && (page + 1 <= pageCount) ? page + 1 : null
        }
    };
}

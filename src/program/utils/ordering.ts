import {AccountInfo, PublicKey} from "@solana/web3.js";
import {Buffer} from "buffer";
import {DataSlice} from "@solana/web3.js";

export type OrderDirType = 'asc' | 'desc';

export const OrderDirOptions = {
    'asc': `ASC`,
    'desc': `DESC`,
};

export type OrderMethodType = (
    accounts: Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }>,
    getSliceFromAccountData: GetSliceFromAccountData,
    orderDir: OrderDirType
) => void;

export type OrderByType = {
    orderMethod: OrderMethodType,
    dataSlice: DataSlice,
    getSliceFromAccountData: GetSliceFromAccountData,
};

export type OrderOptionsType = {
    orderBy?: OrderByType,
    orderDir?: OrderDirType,
};

export type GetSliceFromAccountData = (b: Buffer) => Buffer;

export const orderByDate: OrderMethodType = (
    accounts: Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }>,
    getSliceFromAccountData: GetSliceFromAccountData,
    orderDir: OrderDirType = 'asc'
) => {
    accounts.sort((a: {
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }, b: {
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }) => {
        const timestampA = parseInt(getSliceFromAccountData(a.account.data).readBigUInt64LE().toString());
        const timestampB = parseInt(getSliceFromAccountData(b.account.data).readBigUInt64LE().toString());

        if (orderDir === 'asc') {
            return timestampA - timestampB;
        }

        return timestampB - timestampA;
    });
};

export const orderAlphabetically: OrderMethodType = (
    accounts: Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }>,
    getSliceFromAccountData: GetSliceFromAccountData,
    orderDir: OrderDirType = 'asc'
) => {
    accounts.sort((a: {
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }, b: {
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }) => {
        const sliceAData = getSliceFromAccountData(a.account.data);
        const sliceBData = getSliceFromAccountData(b.account.data);

        if (orderDir === 'asc') {
            return sliceBData.compare(sliceAData);
        }

        return sliceAData.compare(sliceBData);
    });
};

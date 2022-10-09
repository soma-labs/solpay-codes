import {Buffer} from "buffer";
import {
    GetSliceFromAccountData, orderAlphabetically, orderByDate, OrderByType, OrderOptionsType
} from "../utils/ordering";
import {DataSlice} from "@solana/web3.js";
import {ProjectAccountDiscriminator, ProjectTitleMaxLength} from "./project-account";

export type ProjectOrderColumnsType = 'title' | 'createdAt';

export const ProjectOrderColumnsOptions = {
    'createdAt': 'Created at',
    'title': 'Title',
};

export const ProjectTitleDataSlice: DataSlice = {
    offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
        // is_initialized
        + 1
        // data_version
        + 1
        // project_owner_pubkey
        + 32
        // candy_machine_id
        + 32
        // affiliate_fee_percentage
        + 8
        // affiliate_target_in_sol
        + 1
        // max_affiliate_count
        + 1
        // affiliate_count
        + 1,
    length: 4 + 4 * ProjectTitleMaxLength + 8,
};

export const ProjectCreatedAtDataSlice = ProjectTitleDataSlice;

export const getProjectCreatedAtDataSlice: GetSliceFromAccountData = (b: Buffer): Buffer => {
    return b.slice(4 + b.readUInt32LE(0), 64);
};

export const getProjectTitleDataSlice: GetSliceFromAccountData = (b: Buffer): Buffer => {
    const titleLength = b.readUInt32LE(0);
    return b.slice(4, 4 + titleLength);
};

export const ProjectOrderByMap = new Map<ProjectOrderColumnsType, OrderByType>();

ProjectOrderByMap.set('createdAt', {
    dataSlice: ProjectCreatedAtDataSlice,
    getSliceFromAccountData: getProjectCreatedAtDataSlice,
    orderMethod: orderByDate
});

ProjectOrderByMap.set('title', {
    dataSlice: ProjectTitleDataSlice,
    getSliceFromAccountData: getProjectTitleDataSlice,
    orderMethod: orderAlphabetically
});

export const DefaultProjectOrderOptions: OrderOptionsType = {
    orderBy: ProjectOrderByMap.get('createdAt'),
    orderDir: 'desc',
};

import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {DefaultPerPage, PaginationOptionsType} from "../program/utils/pagination";

export default function useQueryParamsPagination() {
    const router = useRouter();
    const {page, perPage} = router.query;
    const [paginationOptions, setPaginationOptions] = useState<PaginationOptionsType>({} as PaginationOptionsType);

    useEffect(() => {
        if (!page && !perPage) {
            return;
        }

        const paginationOptions = {
            page: page ? parseInt(page as string) : 1,
            perPage: perPage ? parseInt(perPage as string) : DefaultPerPage,
        };

        setPaginationOptions(paginationOptions);
    }, [page, perPage]);

    return paginationOptions;
}

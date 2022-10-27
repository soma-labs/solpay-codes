import {PaginationType} from "../program/utils/pagination";
import Link from "next/link";
import { Box, Button } from "@mui/material";

export default function SimplePagination({pagination, classVariation}: {pagination: PaginationType, classVariation?: string}) {
    const getPaginationLink = (page: number | null, text: string, classVariation?: string) => {
        if (!page) {
            return null;
        }

        let queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', page.toString());

        return (
            <Link href={`${window.location.pathname}?${queryParams.toString()}`}>
                <a className={`pagination__link ${classVariation ? `pagination__link--${classVariation}` : ''} link`}>
                    <Button size="small">
                        {text}
                    </Button>
                </a>
            </Link>
        );
    };

    return (
        <>
            {pagination.pageCount && pagination.pageCount <= 1 ? null :
                <Box className={`pagination ${classVariation ? `pagination--${classVariation}` : ''}`} display="flex" justifyContent="center">
                    {getPaginationLink(pagination.prevPage, `Prev`, 'prev-page')}
                    <Button size="small">{pagination.currentPage}</Button>
                    {getPaginationLink(pagination.nextPage, `Next`, 'next-page')}
                </Box>
            }
        </>
    );
}

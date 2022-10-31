import {useEffect, useRef} from "react";
import {useRouter} from "next/router";
import {Box, Button, IconButton, TextField} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function AccountsSearchFilter({label, defaultSearch}: {label: string, defaultSearch?: string}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const updateRouterSearchQuery = async (search: string): Promise<void> => {
        if (search.trim() === '') {
            delete router.query.search;
        } else {
            router.query.search = inputRef.current?.value;
        }

        await router.push({
            pathname: router.pathname,
            query: router.query
        }, undefined, {shallow: true});
    };
    const onSearch = async (e: any) => {
        e.preventDefault();
        updateRouterSearchQuery(inputRef.current!.value);
    };
    const clearInput = () => {
        inputRef.current && (inputRef.current.value = '');
        updateRouterSearchQuery('');
    };

    useEffect(() => {
        if (!defaultSearch) {
            clearInput();
        }
    }, [defaultSearch]);

    return (
        <Box component="form" onSubmit={onSearch} display="flex" alignItems="center" justifyContent="space-between">
            <TextField
                inputRef={inputRef}
                label={label}
                sx={{mr: 1}}
                size="small"
                defaultValue={defaultSearch}
            />

            <Button variant="contained" className="button button--hollow" sx={{mr: 1}} size="small">
                Search
            </Button>

            <IconButton onClick={clearInput.bind(null)} title="Clear search" size="small" color="secondary">
                <CloseIcon fontSize="small"/>
            </IconButton>
        </Box>
    );
}

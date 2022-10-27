import React, {useEffect, useState} from 'react';
import {Theme, ThemeProvider} from '@mui/material';
import {themeCreator} from './base';

export const ThemeContext = React.createContext((themeName: string): void => {
});

const ThemeProviderWrapper = (props: any) => {
    const [themeName, _setThemeName] = useState<string>('PureLightTheme');
    const [theme, setTheme] = useState<Theme>(themeCreator(themeName));
    const setThemeName = (themeName: string): void => {
        window.localStorage.setItem('appTheme', themeName);
        _setThemeName(themeName);
    };

    useEffect(() => {
        if (!window) {
            return;
        }

        const curThemeName = window.localStorage.getItem('appTheme') || 'PureLightTheme';
        const theme = themeCreator(curThemeName);

        setTheme(theme);
    }, []);

    return (
        <ThemeContext.Provider value={setThemeName}>
            <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProviderWrapper;

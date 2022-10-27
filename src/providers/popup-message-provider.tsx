import React, {useState} from "react";
import Snackbar from '@mui/material/Snackbar';
import {Alert} from "@mui/material";
import {AlertColor} from "@mui/material/Alert/Alert";

export type PopupMessageContextType = {
    setMessage: any,
};

export enum PopupMessageTypes {
    Success = 'success',
    Error = 'error',
    Notification = 'info',
}

export const PopupMessageContext = React.createContext<PopupMessageContextType>({} as PopupMessageContextType);

export default function PopupMessageProvider({children}: {children: any}) {
    let [message, setMessage] = useState<string|null>(null);
    let [type, setType] = useState<PopupMessageTypes>(PopupMessageTypes.Notification);

    const dismissMessage = () => {
        setType(PopupMessageTypes.Notification);
        setMessage(null);
    };

    const defaultValue: PopupMessageContextType = {
        setMessage: (messageText: string, messageType: PopupMessageTypes = PopupMessageTypes.Notification) => {
            setType(messageType);
            setMessage(messageText);
        },
    };

    return (
        <PopupMessageContext.Provider value={defaultValue}>
            {children}
            {!message ? null :
                <Snackbar open={true} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} onClose={dismissMessage}>
                    <Alert variant="filled" onClose={dismissMessage} severity={type} sx={{ width: '100%' }}>
                        <span dangerouslySetInnerHTML={{__html: message}}/>
                    </Alert>
                </Snackbar>
            }
        </PopupMessageContext.Provider>
    );
};

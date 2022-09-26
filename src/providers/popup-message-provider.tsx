import React, {useState} from "react";

export type PopupMessageContextType = {
    setMessage: any,
};

export enum PopupMessageTypes {
    Error = 'danger',
    Success = 'success',
    Notification = 'primary',
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
                <div className={`popup-message popup-message--${type}`}>
                    <div className={`alert alert-${type} alert-dismissible d-flex" role="alert`}>
                        <div className="popup-message__text" dangerouslySetInnerHTML={{__html: message}}/>
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={dismissMessage}></button>
                    </div>
                </div>
            }
        </PopupMessageContext.Provider>
    );
};

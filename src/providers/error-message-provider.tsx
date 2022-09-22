import React, {useState} from "react";

export type ErrorMessageContextType = {
    setErrorMessage: any,
};

export const ErrorMessageContext = React.createContext<ErrorMessageContextType>({} as ErrorMessageContextType);

export default function ErrorMessageProvider({children}: {children: any}) {
    let [errorMessage, setErrorMessage] = useState<string|null>(null);

    const dismissErrorMessage = () => setErrorMessage(null);

    const defaultErrorMessageContextValue: ErrorMessageContextType = {
        setErrorMessage,
    };

    return (
        <ErrorMessageContext.Provider value={defaultErrorMessageContextValue}>
            {children}
            {!errorMessage ? null :
                <div className="error-message">
                    <div className="alert alert-danger alert-dismissible" role="alert">
                        <strong>{errorMessage}</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={dismissErrorMessage}></button>
                    </div>
                </div>
            }
        </ErrorMessageContext.Provider>
    );
};

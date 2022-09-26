const LoadingIcon = ({extraClasses}: { extraClasses?: string }) =>
    <div className={`cma-loading d-flex justify-content-center align-items-center ${extraClasses ?? ''}`}>
        <span className="cma-loading__icon"></span>
        <span className="cma-loading__icon"></span>
        <span className="cma-loading__icon"></span>
    </div>;

export default LoadingIcon;

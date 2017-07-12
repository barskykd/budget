import * as React from "react";

type InlineConfirmationProps = {
    message: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: ()=>void,
    onCancel: ()=>void
}

export default class InlineConfirmation extends React.Component<InlineConfirmationProps, {}> {
    private rootDiv: any;
    private confirmButton: any;

    constructor(props: InlineConfirmationProps) {
        super(props);

        this.onfocusout = this.onfocusout.bind(this);
    }    

    onConfirmClick() {
        this.removeListeners();
        this.props.onConfirm();
    }

    onCancelClick() {
        this.props.onCancel();
    }

    onfocusout() {               
       this.onCancelClick();
    }

    render() {
        return <div ref={x=>{this.rootDiv = x}} className="inline-confirmation">
                <div>{this.props.message}</div>
                <div className="inline-confirmation-buttons">
                    <button ref={x=>{this.confirmButton = x}} onClick={()=>this.onConfirmClick()}>Delete</button>
                    <button onClick={()=>this.onCancelClick()}>Cancel</button>
                </div>
            </div>;
    }

    removeListeners() {        
        this.rootDiv.removeEventListener('blur', this.onfocusout);
        this.onCancelClick = ()=>{};
    }

    componentDidMount() {
        this.rootDiv.addEventListener("blur", this.onfocusout, true);
        this.confirmButton.focus();
    }

    componentWillUnmount() {        
        this.removeListeners();
    }
}
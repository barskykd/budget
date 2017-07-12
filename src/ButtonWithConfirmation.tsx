import * as React from "react";
import InlineConfirmation from './InlineConfirmation'

type ButtonWithConfirmationProps = {
    buttonText: string,
    confirmMessage: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: ()=>void
}

type ButtonWithConfirmationState = {
    isConfirming?: boolean
}

export default class ButtonWithConfirmation extends React.Component<ButtonWithConfirmationProps, ButtonWithConfirmationState> {
    render() {
        if (this.state && this.state.isConfirming) {
            return <InlineConfirmation
                        message={this.props.confirmMessage}
                        confirmLabel={this.props.confirmLabel}
                        cancelLabel={this.props.cancelLabel}
                        onConfirm={()=>this.props.onConfirm()}
                        onCancel={()=>{this.setState({isConfirming: false})}}
                    />                                                       
        }
        return <button onClick={()=> this.setState({isConfirming: true})}>&times;</button>
    }
}
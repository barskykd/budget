import * as React from "react";
import * as ReactDOM from "react-dom";

type InplaceInputProps = {
    value: string,
    onChange: (value:string) => void
};

type InplaceInputState = {
    editing: boolean,
    newValue: string
}

class InplaceInput extends React.Component<InplaceInputProps, InplaceInputState> {
    constructor(props: any) {
        super(props);
        this.state = {editing: false, newValue: props.value};
    }

    public componentDidUpdate(prevProps : any, prevState:any) {
        if (!prevState.editing && this.state.editing) {
            var node = ReactDOM.findDOMNode<HTMLInputElement>(this.refs["editField"]);
            node.focus();
            node.setSelectionRange(0, node.value.length);
        }     
    }

    render() {
        if (!this.state.editing) {
            return <span onClick={e => this.startEditing()}>
                {this.props.value}
            </span>
        } else {
            return <input ref="editField" value={this.state.newValue} 
                onBlur={e => this.endEditing()}
                onChange={e => this.setState({newValue: e.target.value})}
                onKeyUp = {e => this.onKeyUp(e)}
                style={{width: '100%'}}
                >
            </input>
        }        
    }

    startEditing() {
        this.setState({editing: true});
    }

    endEditing() {
        this.setState({editing: false});
        this.props.onChange(this.state.newValue);
    }

    onKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter") {
            e.preventDefault();
            this.endEditing();
            return false;
        } else if (e.key == "Escape") {
            // Discarding new value
            this.setState({editing: false});
        }
    }
}

export default InplaceInput
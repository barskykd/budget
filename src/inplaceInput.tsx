import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Decimal from 'decimal.js'

type InplaceInputProps = {
    value: string,
    onChange: (value:string) => void,
    inputType?: string,
    className?: string
    crossed?: boolean
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
            if (!this.props.inputType) {
                node.setSelectionRange(0, node.value.length);
            }
            
        }     
    }

    render() {
        if (!this.state.editing) {
            let crossedClass = this.props.crossed ? 'inplace-input-crossed' : '';
            let classNames = `inplace-input_notediting ${this.props.className || ''} ${crossedClass}`;            
            return <span className={classNames} onClick={e => this.startEditing()}>
                {this.props.value}&nbsp;
            </span>
        } else {
            return <input ref="editField" value={this.state.newValue} type={this.props.inputType}
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
        if (this.props.value != this.state.newValue) {
            this.props.onChange(this.state.newValue);
        }        
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

function toMoney(value: string) {
    try {
        let amount = new Decimal(value || '0.00').toFixed(2);
        return amount;
    } catch (e) {
        if (e.message.startsWith('[DecimalError]')) {
            // all ok. Just invalid number as input.
        } else {
            throw e;
        }            
    }   
}

export class MoneyInput extends React.Component<InplaceInputProps, {}> {
    render () {
        let newProps: InplaceInputProps = {
            ...this.props,
            value: toMoney(this.props.value) || '0.00',
            className: 'moneyinput',
            onChange: (value: string) => {
                let newValue = toMoney(value);
                if (newValue !== undefined) {
                    this.props.onChange(newValue)
                }
            }
        }        
        return React.createElement(InplaceInput, newProps);
    }
}
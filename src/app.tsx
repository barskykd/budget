import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import * as dbx from './dropbox';
import * as Decimal from 'decimal.js'
import * as Model from './model';
import * as Actions from './actions';
import Accounts from './accounts';
import Envelopes from './envelopes';
import Monthlies from './monthlies';
import Goals from './goals';
import MiddleWare from './middleware'

import { connect, Provider } from 'react-redux'
import { createStore, applyMiddleware} from 'redux'

declare var window: any;
declare var Redux: any;

import Reducers from './reducers';

let redux_store = createStore<Model.State>(Reducers, {
    accounts: [],
    envelopes: [],
    monthlies: [],
    goals: [],
    loggedInDropbox: dbx.loggedIn(),
    loadingState: "LOADING"
}, applyMiddleware(MiddleWare))

interface WithId {
    id: string
}

interface Account {
    name: string,
    balance: number
}

interface Envelope {
    weekStart: Date,
    amount: number
}

interface Monthly {
    name: string,
    amount: number,
    payedThisMonth?: number,
    thisMonth?: Date
}

interface Goal {
    name: string,
    amount: number,
    goalAmount: number,
    goalDate: string    
}

interface AccountItemState {
    editingTitle?: boolean,
    editingBalance?: boolean
}

class InplaceInput extends React.Component<{value: string}, {editing: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = {editing: false};
    }

    public componentDidUpdate(prevProps : any, prevState:any) {
        if (!prevState.editing && this.state.editing) {
            var node = ReactDOM.findDOMNode<HTMLInputElement>(this.refs["editField"]);
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }     
    }

    render() {
        if (!this.state.editing) {
            return <span 
                onClick={e => this.setState({editing: true})}>
                {this.props.value}
            </span>
        } else {
            return <input ref="editField" value={this.props.value} 
                onBlur={e => this.setState({editing: false})}>
            </input>
        }        
    }
}

var appDiv = document.getElementById('app'); 

type AppProps = {
    data: Model.State, 
    loadData: () => void
}

class App extends React.Component<AppProps, {}> {
    componentWillMount() {
        this.props.loadData();
    }

    render() {
        if (!this.props.data.loggedInDropbox) {
            return <ReactModal isOpen={true} contentLabel="Log in">
                <a id="login_link" href={dbx.auth_url()}>Login to dropbox</a>
            </ReactModal >
        }
        if (this.props.data.loadingState == "LOADING") {
            return <div className="load-indicator"><img src="spinner.gif"/></div>
        }
        return <div>
                <div className="page-header">
                        <h1>Hello!</h1>
                    </div>
                    <Accounts/>
                    <Envelopes/>                    
                    <Monthlies/>
                    <Goals/>
                </div>
        }
}

const AppC = connect(
        (state: Model.State) => ({data: state}), 
       (dispatch: (action: Actions.Action) => void) => ({
        loadData() {
            dispatch({type: 'DATA_START_LOADING'})
        }
    })
    )(App)

if (appDiv) {
    ReactDOM.render(
        <Provider store={redux_store}>
            <AppC/>
        </Provider>,
        appDiv  
    );
}

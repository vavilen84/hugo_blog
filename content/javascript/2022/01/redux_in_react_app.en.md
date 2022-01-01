---
title: "Creating a blog on MERN (part №1): Redux in React app"
publishdate: "2022-01-01"
summary: "javascript"
categories:
- "javascript"
tags:
- "mern"
- "mongodb"
- "react"
- "node"
- "express"
---

Sources:
- [Official Docs](https://redux.js.org/introduction/getting-started)
- [Example app sources](https://github.com/vavilen84/react_node_blog)
- [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

# Redux

Redux is a predictable state container for JavaScript apps.

# Main parts

1. Store - the whole global state of your app is stored in an object tree inside a single store.
2. Reducer - a function that takes prev state and returns new by taking an "action" object.
3. Action - an object describing what happened.

# Create store

Example [source link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/index.js)
```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/layout/app/App';
import reportWebVitals from './reportWebVitals';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension'
import {rootReducer} from './reducers';
import {Provider} from 'react-redux';

// Note: this API requires redux@>=3.1.0
const store = createStore(
    combineReducers({rootReducer}),
    composeWithDevTools(
        applyMiddleware(thunk, logger)
    )
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
  ,
  document.getElementById('root')
);
```

In an example above we used:
1. [combineReducers](https://redux.js.org/api/combinereducers) in order to have the possibility to extend our app in the future.
2. 2nd "enhancer" param [composeWithDevTools()](https://github.com/zalmoxisus/redux-devtools-extension) which adds devTools to our middlewares - [here](https://www.youtube.com/watch?v=IlM7497j6LY) you can find a great demo.
3. [thunk](https://github.com/reduxjs/redux-thunk) middleware for Redux - it allows us to return a function with a "dispatch" param in our "actions" instead of a simple object.
4. [logger](https://www.npmjs.com/package/redux-logger) - Logger for Redux.

# Reducer

A reducer's function signature is: (state, action) => newState

[Rules of Reducers](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers):
- They should only calculate the new state value based on the state and action arguments
- They are not allowed to modify the existing state. Instead, they must make immutable updates, by copying the existing state and making changes to the copied values.
- They must not do any asynchronous logic or other "side effects"

Example [source link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/reducers/index.js)
```
import {CHANGE_ROUTE, SHOW_ALERT, LOGIN, LOGOUT, SWITCH_MODE} from "../actionTypes";
import {showAlert, clearAlert, defaultState, login, logout, switchMode} from "../mutations";

export function rootReducer(state = defaultState, action) {
    let st = Object.assign({},state);
    switch (action.type) {
        case SHOW_ALERT:
            return showAlert(st, action);
        case CHANGE_ROUTE:
            return clearAlert(st);
        case LOGIN:
            return login(st, action);
        case LOGOUT:
            return logout(st);
        case SWITCH_MODE:
            return switchMode(st, action);
        default:
            return state
    }
}
```

Mutations abstraction is not mandatory - just to separate mutation logic from the reducer.

As we can see, our reducer:
- takes 2 params: "state" & "action"
- "state" param has initial "defaultState" value
- we don`t pass "state" param to mutation, but create new object instead

Mutations [source link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/mutations/index.js)
```
import {frontendMode} from "../constants/constants";

export const defaultState = {
    type: null,
    showAlert: false,
    mode: frontendMode,
    alert: {
        code: null,
        data: [],
        message: null,
        visible: false
    },
    auth: {
        accessToken: null,
        refreshToken: null
    }
};

export function showAlert(state, action) {
    state.showAlert = true;
    state.alert.visible = true;
    state.alert.code = action.code || null;
    state.alert.data = action.data || [];
    state.alert.message = action.message || null;

    return state;
}

export function clearAlert(state) {
    state.showAlert = false;
    state.alert.code = null;
    state.alert.visible = false;
    state.alert.data = [];
    state.alert.message = null;

    return state;
}

export function login(state, action) {
    state.auth = {
        accessToken: action.accessToken,
        refreshToken: action.refreshToken
    };

    return state;
}

export function logout(state) {
    state.auth = {
        accessToken: null,
        refreshToken: null
    };

    return state;
}

export function switchMode(state, action) {
    state.mode = action.mode;
    return state;
}
```

# Action

Official docs suggests 2 types of actions:
- "simple" action represented as a plain Javascript object [link](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#designing-actions)
- "thunk" action, which may: contain logic, call dispatch and getState methods [link](https://redux.js.org/tutorials/essentials/part-5-async-logic#thunks-and-async-logic) 

# "simple" action

"simple" action should have a simple object with data for updating the store. It should have 'type' property. Example [link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/actions/index.js):
```
import {CHANGE_ROUTE, SHOW_ALERT, LOGIN, LOGOUT, SWITCH_MODE} from "../actionTypes";

export function showAlertAction(code, data, message) {
    return {
        type: SHOW_ALERT,
        code: code,
        data: data,
        message: message
    };
}

export function loginAction(accessToken, refreshToken) {
    return {
        type: LOGIN,
        accessToken: accessToken,
        refreshToken: refreshToken
    };
}

export function logoutAction() {
    return {
        type: LOGOUT,
    };
}

export function changeRouteAction() {
    return {
        type: CHANGE_ROUTE
    };
}

export function switchModeAction(mode) {
    return {
        type: SWITCH_MODE,
        mode: mode
    };
}
```

call "simple" action from component example [link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/components/pages/admin/posts/create/PostsCreate.js):
```
import React from "react";
import {connect} from 'react-redux'
import {Navigate} from "react-router";
import {adminPostsIndexRoute, defaultErr} from "../../../../../constants/constants";
import PostsCreateForm from "./PostsCreateForm";
import {getURL, POSTS_BASE_URL} from "../../../../../helpers";
import {showAlertAction} from "../../../../../actions";

class PostsCreate extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            created: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(post) {

        let formData = new FormData();
        formData.append('url', post.url);
        formData.append('image', post.image);
        formData.append('content', post.content);

        await fetch(getURL(POSTS_BASE_URL), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.props.accessToken
            },
            body: formData
        })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    this.setState({created: true});
                }
                this.props.showAlert(json.code, json.data, json.message);
            })
            .catch(err => {
                console.log(err);
                this.props.showAlert(500, null, defaultErr);
            });
    }

    render() {

        const content = this.state.created
            ? <Navigate to={adminPostsIndexRoute} replace={true}/>
            : <PostsCreateForm handleSubmit={this.handleSubmit}/>

        return (content);
    }
}

const mapDispatchToProps = dispatch => (
    {
        showAlert: (code, data, message) => dispatch(showAlertAction(code, data, message))
    }
)


const mapStateToProps = (state) => {
    let auth = state.rootReducer.auth;

    return {
        accessToken: auth.accessToken,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostsCreate);
```

As we can see, we have used "connect" method from 'react-redux' package in order to define mapDispatchToProps:
```
const mapDispatchToProps = dispatch => (
    {
        showAlert: (code, data, message) => dispatch(showAlertAction(code, data, message))
    }
)
...
export default connect(mapStateToProps, mapDispatchToProps)(PostsCreate);
```
this gives the ability to define showAlert action as a component property and call it
```
class PostsCreate extends React.Component {
    constructor(props) {
        super(props);
        ...
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    async handleSubmit(post) {
        ...
        await fetch(getURL(POSTS_BASE_URL), {
            ...
        })
            .then(res => res.json())
            .then(json => {
                ...
                this.props.showAlert(json.code, json.data, json.message);
            })
    ...
```

# Thunk action

Example of "thunk" action call [link](https://github.com/vavilen84/react_node_blog/blob/master/frontend/src/components/pages/frontend/login/LoginForm.js)
```
import React from "react";
import { connect } from 'react-redux'
import {authenticateUserThunkAction} from "../../../../actions/thunk/authenticateUser";

class LoginForm extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            username: '',
            password: ''
        };

        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeUsername(event) {
        this.setState({username: event.target.value});
    }

    handleChangePassword(event) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.authenticateUser(this.state.username, this.state.password);
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="">Username</label>
                        <input type="text" className="form-control" placeholder="Enter username" onChange={this.handleChangeUsername}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Password</label>
                        <input type="password" className="form-control" placeholder="Password" onChange={this.handleChangePassword}/>
                    </div>
                    <input type="submit" value="Submit" className="btn btn-success"/>
                </form>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => (
    {
        authenticateUser: (username, password) => dispatch(authenticateUserThunkAction(username, password))
    }
)

export default connect(null, mapDispatchToProps)(LoginForm);
```
as we can see, we also used connect & mapDispatchToProps methods here. Thunk action:
```
import {getURL, USERS_BASE_URL} from "../../helpers";
import {loginAction, showAlertAction} from "../index";
import {accessToken, defaultErr, refreshToken, tokensEmptyErr} from "../../constants/constants";

export function authenticateUserThunkAction(username, password) {
    return (dispatch) => {
        fetch(getURL(USERS_BASE_URL + "/" + username + "/authenticate"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    const accessTokenData = json.data.accessToken;
                    const refreshTokenData = json.data.refreshToken;
                    if (!accessTokenData || !refreshTokenData) {
                        return Promise.reject(tokensEmptyErr);
                    }
                    localStorage.setItem(accessToken, accessTokenData.token);
                    localStorage.setItem(refreshToken, refreshTokenData.token);
                    dispatch(loginAction(accessTokenData.token, refreshTokenData.token));
                }
                dispatch(showAlertAction(json.code, json.data, json.message));
            })
            .catch(err => {
                console.log(err);
                dispatch(showAlertAction(500, null, defaultErr));
            });
    };
}
```
as we can see - we are able to call "simple" actions from "thunk" actions.

The end of the article!
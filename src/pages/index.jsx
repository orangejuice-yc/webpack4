import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './login/index.jsx'
import Home from './home/index.jsx'
//首页模块
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
        <Router>
            <Route path="/" component={Login} />
            <Route path="/home" component={Home} />
        </Router>
    )
  }
}


export default Index
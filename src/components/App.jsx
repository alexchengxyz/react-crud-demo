import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Grid , Menu } from 'semantic-ui-react';
import Member from '../pages/Member';
import Index from '../pages/Index';
import '../assets/css/style.css';

function App() {
  return (
    <Router>
      <Menu as="header" className="fixed mythmeme-headder" />
        <Grid className="mytheme-main">
          <Grid.Column width={2}>
            <Menu
              as="nav"
              vertical
              inverted
              className="mythene-nav"
            >
              <Link to="/" className="link item">首頁</Link>
              <Link to="/member" className="link item">會員管理</Link>
            </Menu>
          </Grid.Column>
          <Grid.Column width={14}>
            <div className="mytheme-content">
              <Route exact path="/" component={Index} />
              <Route path="/member" component={Member} />
            </div>
          </Grid.Column>
        </Grid>
      <Menu
        as="footer"
        className="fixed mythmeme-footer"
      />
    </Router>
  );
}

export default App;

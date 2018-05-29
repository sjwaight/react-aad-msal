//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';
import { AzureAD, LoginType, MsalAuthProviderFactory } from 'react-aad-msal';

class SampleAppRedirectOnLaunch extends React.Component {
  constructor(props) {
    super(props);

    this.interval = null;
    let redirectEnabled = sessionStorage.getItem("redirectEnabled") || false;
    this.state = {
      counter: 5,
      redirectEnabled: redirectEnabled
    }
  }

  handleCheck = () => {
    this.setState({ redirectEnabled: !this.state.redirectEnabled }, () => {
      if (!this.state.redirectEnabled) {
        this.clearRedirectInterval();
      } else {
        sessionStorage.setItem("redirectEnabled", true);
      }
    });
  }

  unauthenticatedFunction = loginFunction => {
    if (this.state.redirectEnabled && !this.interval) {
      this.interval = setInterval(() => {
        if (this.state.counter > 0) {
          this.setState({ counter: this.state.counter - 1 });
        } else {
          this.clearRedirectInterval();
          this.setState({ redirectEnabled: false });
          loginFunction();
        }
      }, 1000);
    }
    
    if (this.state.redirectEnabled) {
      return (<div>Redirecting in {this.state.counter} seconds...</div>);
    }
    
    return (<div />);
  };

  clearRedirectInterval() {
    clearInterval(this.interval);
    this.setState({ counter: 5 });
    sessionStorage.removeItem("redirectEnabled");
    this.interval = null;
  }

  userJustLoggedIn = receivedUserInfo => {
    this.props.userInfoCallback(receivedUserInfo);
  }

  authenticatedFunction = logout => {
    return (<div><button onClick={() => {
      logout();
    }} className="Button">Logout</button></div>);
  }

  render() {
    return (
      <div>
        {!this.props.userInfo?
          <div>
            <input type="checkbox" value={this.state.redirectEnabled} onChange={this.handleCheck} /> Enable redirect
          </div> : <div/>}
        <AzureAD
          provider={new MsalAuthProviderFactory({
            authority: process.env.REACT_APP_AUTHORITY,
            clientID: process.env.REACT_APP_AAD_APP_CLIENT_ID,
            scopes: ["openid", "offline_access", "https://graph.microsoft.com/mail.read"],
            type: LoginType.Redirect,
            persistLoginPastSession: true,
          })}
          unauthenticatedFunction={this.unauthenticatedFunction}
          userInfoCallback={this.userJustLoggedIn}
          authenticatedFunction={this.authenticatedFunction} />
      </div>
    );
  }
}

export default SampleAppRedirectOnLaunch;
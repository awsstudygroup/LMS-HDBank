import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { Navigate } from "react-router-dom";
import { TopNavigation, Input } from "@cloudscape-design/components";
import AWSLogo from "./Logo";

export default function NavBar(props) {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     authChecked: false,
  //     authenticated: false,
  //     redirectAuth: false,
  //     user: null,
  //     theme: '',
  //   };
  // }
  const [state, setState] = useState({
    authChecked: false,
    authenticated: false,
    redirectAuth: false,
    user: null,
    theme: "",
  });

  // componentDidMount() {
  //   Auth.currentAuthenticatedUser({
  //     // Optional, By default is false. If set to true,
  //     // this call will send a request to Cognito to get the latest user data
  //     bypassCache: false,
  //   })
  //     .then((user) => {
  //       this.setState({
  //         authChecked: true,
  //         authenticated: true,
  //         user: user,
  //       });
  //     })
  //     .catch((err) => {
  //       this.setState({
  //         authChecked: true,
  //         authenticated: false,
  //       });
  //     });
  // }
  useEffect(() => {
    Auth.currentAuthenticatedUser({
      // Optional, By default is false. If set to true,
      // this call will send a request to Cognito to get the latest user data
      bypassCache: false,
    })
      .then((user) => {
        setState({
          ...state,
          authChecked: true,
          authenticated: true,
          user: user,
        });
      })
      .catch((err) => {
        setState({ ...state, authChecked: true, authenticated: false });
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('color-scheme', state.theme);
  }, [state.theme])

  const startAuthentication = () => {
    setState({ ...state, redirectAuth: true });
  };

  const startSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error signing out: ", error);
      Auth.userHasAuthenticated(false);
    }

    setState({ ...state, authChecked: true, authenticated: false });
    window.location.reload();
  };

  return state.redirectAuth ? (
    <Navigate to="/auth" />
  ) : (
    <div id="h" style={{ position: "sticky", top: 0, zIndex: 1002 }}>
      <TopNavigation
        identity={{
          href: "/",
          title: "AWS Cloud Academy Studio",
          logo: {
            src: AWSLogo,
            alt: "AWS Logo",
          },
        }}
        search={
          <Input
            type="search"
            placeholder="Search"
            ariaLabel="Search"
            onChange={() => {}}
          />
        }
        utilities={
          !state.authChecked
            ? []
            : !state.authenticated
            ? [
                {
                  type: "button",
                  text: "Sign in",
                  onClick: () => {
                    startAuthentication();
                  },
                },
                {
                  type: "button",
                  variant: "primary-button",
                  text: "Sign up",
                  onClick: () => {
                    startAuthentication();
                  },
                },
              ]
            : [
                {
                  type: "menu-dropdown",
                  text: state.user.attributes.email,
                  iconName: "user-profile",
                  items: [
                    {
                      id: "signout",
                      text: "Sign out",
                    },
                  ],
                  onItemClick: (e) => {
                    if (e.detail.id === "signout") {
                      startSignOut();
                    }
                  },
                },
              ].concat({
                type: "menu-dropdown",
                text: "Change theme",
                // iconName: '',
                items: [
                  {
                    id: "default",
                    text: "Default",
                  },
                  {
                    id: "binh",
                    text: "Blue theme",
                  },
                ],
                onItemClick: (e) => {
                  if (e.detail.id === "default") {
                    setState({ ...state, theme: "" });
                  } else {
                    setState({ ...state, theme: e.detail.id });
                  }
                },
              })
        }
      />
    </div>
  );
}

import { I18n } from 'aws-amplify';
import { useState } from 'react';
import {
  Authenticator,
  View,
  Image,
  Text,
  Heading,
  Button,
  useTheme,
  useAuthenticator,
  Theme,
  ThemeProvider
} from "@aws-amplify/ui-react";
import { Auth, API } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";
import { Navigate, useLocation } from "react-router-dom";
import './AuthForm.css';
import { translations } from '@aws-amplify/ui-react';
import { 
  apiName, 
  usersPath
} from "../../utils/api"
I18n.putVocabularies(translations);
I18n.setLanguage('vn');

I18n.putVocabularies({
  vn: {
    'Sign In': 'Đăng Nhập',
    'Sign in': 'Đăng nhập',
    'Create Account': "Tạo tài khoản",
    'Forgot your password?': 'Quên mật khẩu?',
    'Signing in': "Đăng nhập ...",
    'Creating Account': "Tạo tài khoản ..."
  },
});

const formFields = {
  signIn: {
    username: {
      label: "Email:",
      placeholder: "Nhập email của bạn",
      order: 1
    },
    password: {
      label: "Mật khẩu:",
      placeholder: "Nhập mật khẩu của bạn",
      isRequired: false,
      order: 2,
    },
  },
  signUp: {
    email: {
      label: "Email:",
      placeholder: "Nhập email của bạn",
      order: 1
    },
    password: {
      label: "Mật khẩu:",
      placeholder: "Nhập mật khẩu của bạn",
      isRequired: false,
      order: 2,
    },
    confirm_password: {
      label: "Xác nhận mật khẩu:",
      placeholder: "Mời bạn nhập lại mật khẩu lần nữa",
      order: 3,
    },
    'custom:name_on_certificate': {
      placeholder: 'Nhập tên bạn muốn để trên chứng chỉ',
      isRequired: true,
      label: "Nhập tên trên chứng chỉ",
      order: 4
    }
  },
};

// const signUpAttributes= ['family_name', 'name_on_certificate']

export default function AuthForm(props) {
  const [state, setState] = useState({
    authChecked: false,
    authenticated: false,
  })
  const { tokens } = useTheme();
  // console.log(tokens)
  const location = useLocation();

  const startSignOut = async() => {
    try {
      await Auth.signOut({global: true});
      console.log("log out");
    } catch (error) {
      console.log("error signing out: ", error);
      Auth.userHasAuthenticated(false);
    }
    setState({
      authChecked: true,
      authenticated: false,
    });
  }
  
  const services = {
    async handleSignIn(formData) {
      let { username, password, attributes } = formData;
      let user = null;
      // try {
      //   const res = await Auth.signOut({ global: true });
      //   // await API.get(apiName, usersPath + user.signInUserSession.refreshToken.token)
      //   // console.log("Revoke done")
      // } catch (error) {
      //   console.log('error signing out: ', error);
      // }

      startSignOut();
      console.log("after log out");
      // return user
      return Auth.signIn({
        username,
        password,
        attributes,
        autoSignIn: {
          enabled: true,
        },
      });
    },
  };

  const theme: Theme = {
    name: 'Auth Example Theme',
    tokens: {
      colors: {
        brand: {
          primary: {
            '10': tokens.colors.teal['100'],
            '80': tokens.colors.teal['40'],
            '90': tokens.colors.teal['20'],
            '100': tokens.colors.teal['10'],
          },
        },
      },
      components: {
        tabs: {
          item: {
            _focus: {
              color: {
                value: '#0073bb',
              }
            },
            _hover: {
              color: {
                value: '#0073bb',
              },
            },
            _active: {
              color: {
                value: '#0073bb',
              },
              borderColor: {
                value: '#0073bb'
              }
            },
          },
        }
      },
    },
  };
  return (
    <ThemeProvider theme={theme}>
    <Authenticator initialState={location.state.action ? location.state.action : "signIn"} formFields={formFields} services={services}>
      <Navigate to={location.state.path ? location.state.path : "/"} replace={true} />
    </Authenticator>
    </ThemeProvider>
  );
}

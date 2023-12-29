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
import "@aws-amplify/ui-react/styles.css";
import { Navigate, useLocation } from "react-router-dom";
import './AuthForm.css';


const formFields = {
  signUp: {
    email: {
      order: 1
    },
    password: {
      label: "Password:",
      placeholder: "Enter your Password:",
      isRequired: false,
      order: 2,
    },
    confirm_password: {
      label: "Confirm Password:",
      order: 3,
    },
    'custom:name_on_certificate': {
      placeholder: 'Enter your Name on Certificate',
      isRequired: true,
      label: "Name on Certificate",
      order: 4
    }
  },
};

// const signUpAttributes= ['family_name', 'name_on_certificate']

export default function AuthForm(props) {
  const { tokens } = useTheme();
  const location = useLocation();
  console.log(location.state);
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
                value: '#EC7211',
              }
            },
            _hover: {
              color: {
                value: '#ffa963',
              },
            },
            _active: {
              color: {
                value: '#EC7211',
              },
              borderColor: {
                value: '#EC7211'
              }
            },
          },
        },
      },
    },
  };
  return (
    <ThemeProvider theme={theme}>
    <Authenticator initialState={location.state.action ? location.state.action : "signIn"} formFields={formFields} >
      <Navigate to={location.state.path ? location.state.path : "/"} replace={true} />
    </Authenticator>
    </ThemeProvider>
  );
}

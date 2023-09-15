import { Authenticator,
  Theme,
  ThemeProvider,
  useTheme
 } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Navigate } from 'react-router-dom';
import './AuthForm.css';

export default function AuthForm() {
  const { tokens } = useTheme();
  console.log(tokens);
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
    <Authenticator>
      <Navigate to="/" replace={true} />
    </Authenticator>
    </ThemeProvider>
  );
}

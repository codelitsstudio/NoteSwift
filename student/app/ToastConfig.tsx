import React from 'react';
import { BaseToast } from 'react-native-toast-message';

const text1Style = { fontSize: 14 };
const text2Style = { fontSize: 12 };

const InfoToast = (props: any) => (
  <BaseToast
    {...props}
    animationInTiming={0}     
    animationOutTiming={0}      
    style={{ borderLeftColor: '#3592F2' }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const SuccessToast = (props: any) => (
  <BaseToast
    {...props}
    animationInTiming={0}
    animationOutTiming={0}
    style={{ borderLeftColor: 'green' }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const ErrorToast = (props: any) => (
  <BaseToast
    {...props}
    animationInTiming={0}
    animationOutTiming={0}
    style={{ borderLeftColor: 'red' }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

export const toastConfig = {
  info: InfoToast,
  success: SuccessToast,
  error: ErrorToast,
};

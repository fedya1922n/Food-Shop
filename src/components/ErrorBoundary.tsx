import { t } from 'i18next';
import React, { Component, ReactNode } from 'react';
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
}

const ErrorMessage: React.FC = () => {
  const { t } = useTranslation();
  return <h1>{t('error.globalError')}</h1>;
};

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
      return <ErrorMessage />;
  }

  render() {
    if (this.state.hasError) {
      return <h1>{t('error.globalError')}</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
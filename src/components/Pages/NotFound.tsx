
import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
      const { t} = useTranslation();
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{t('error.notFound')}</h1>
    </div>
  );
};

export default NotFound;

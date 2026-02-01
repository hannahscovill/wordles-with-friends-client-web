import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import './NotFoundPage.scss';

export const NotFoundPage = (): ReactElement => {
  return (
    <div className="not-found-page">
      <div className="not-found-page__forest">
        <div className="not-found-page__tree not-found-page__tree--1" />
        <div className="not-found-page__tree not-found-page__tree--2" />
        <div className="not-found-page__tree not-found-page__tree--3" />
        <div className="not-found-page__tree not-found-page__tree--4" />
        <div className="not-found-page__tree not-found-page__tree--5" />
      </div>
      <div className="not-found-page__content">
        <h1 className="not-found-page__title">404</h1>
        <p className="not-found-page__subtitle">Page Not Found</p>
        <p className="not-found-page__message">
          Like Bigfoot, this page is a mystery.
          <br />
          Some say it never existed at all...
        </p>
        <Link to="/" className="not-found-page__link">
          Return to safety
        </Link>
      </div>
    </div>
  );
};

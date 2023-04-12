/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

// const CompLibrary = require('../../core/CompLibrary.js');

// const Container = CompLibrary.Container;
// const GridBlock = CompLibrary.GridBlock;

const HomeSplash: React.FC<any> = (props) => {
  const { siteConfig, language = '' } = useDocusaurusContext();
  const { baseUrl, docsUrl } = siteConfig;
  const docsPart = `${docsUrl ? `/${docsUrl}` : ''}`;
  const langPart = `${language ? `/${language}` : ''}`;

  const SplashContainer = (props) => (
    <div className={styles.homeContainer}>
      <div className="homeSplashFade">
        <div className="wrapper homeWrapper">{props.children}</div>
      </div>
    </div>
  );

  const Logo = (props) => (
    <div className={styles.projectLogo}>
      <img src={props.img_src} alt="Project Logo" />
    </div>
  );

  const ProjectTitle = (props) => (
    <h2 className={styles.projectTitle}>
      {props.title}
      <small>{props.tagline}</small>
    </h2>
  );

  const PromoSection = (props) => (
    <div className="section promoSection">
      <div className="promoRow">
        <div className="pluginRowBlock">{props.children}</div>
      </div>
    </div>
  );

  const Button = (props) => (
    <div className="pluginWrapper buttonWrapper">
      <a className="button" href={props.href} target={props.target}>
        {props.children}
      </a>
    </div>
  );

  return (
    <SplashContainer>
      <Logo img_src={`${baseUrl}img/undraw_monitor.svg`} />
      <div className="inner">
        <ProjectTitle tagline={siteConfig.tagline} title={siteConfig.title} />
        <PromoSection>
          <Button href={`${docsPart}/ts-endpoint/intro`}>docs</Button>
        </PromoSection>
      </div>
    </SplashContainer>
  );
};

const Index: React.FC = () => {
  const { siteConfig, language = '' } = useDocusaurusContext();
  const { baseUrl } = siteConfig;

  const Block = ({ children }) => (
    <div
      className={styles.block}
    >
      {children.map((c) => (
        <div key={c.title} className={styles.blockColumn}>
          <h4>{c.title}</h4>
          <img src={c.image} />
          <p>{c.content}</p>
        </div>
      ))}
    </div>
  );

  const Features = () => (
    <Block>
      {[
        {
          content: 'Only define your endpoints once',
          image: `${baseUrl}img/undraw_code_review.svg`,
          imageAlign: 'top',
          title: 'Define once',
        },
        {
          content: 'Use your endpoint definitions in the client and the server',
          image: `${baseUrl}img/undraw_operating_system.svg`,
          imageAlign: 'top',
          title: 'Use everywhere',
        },
      ]}
    </Block>
  );

  return (
    <Layout>
      <HomeSplash siteConfig={siteConfig} language={language} />
      <div className={styles.mainContainer}>
        <Features />
      </div>
    </Layout>
  );
};

export default Index;

import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Readme from './README.md';
import EditableText from '.';

storiesOf(`EditableText`, module)
  .addParameters({
    readme: {
      sidebar: Readme,
    },
    props: { propTables: [EditableText] },
  })
  .add('all', () => {
    return <EditableText />;
  });

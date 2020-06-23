import { configure, addDecorator, addParameters } from '@storybook/react';
import { addReadme } from 'storybook-readme';
import { withPropsTable } from 'storybook-addon-react-docgen';

addParameters({
  options: { theme: {} },
});

addDecorator(addReadme);

addDecorator(
  withPropsTable({
    propTablesExclude: ['ReadmeContent'],
  })
);

function loadStories() {
  const req = require.context('../packages', true, /\.stories\.tsx$/);
  req.keys().forEach((filename) => {
    if (filename.includes('node_modules') || filename.includes('lib')) {
      return;
    }

    return req(filename);
  });
}

configure(loadStories, module);

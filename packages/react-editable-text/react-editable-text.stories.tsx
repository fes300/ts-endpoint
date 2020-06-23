import * as React from 'react';
import EditableText from '.';

// export default {
//   title: 'EditableText',
//   component: EditableText,
// };

export const basic = () => {
  const [text, setText] = React.useState('some initial text');
  return (
    <EditableText
      text={text}
      onSetText={setText}
      RenderText={({ TextComponent }) => <TextComponent />}
      RenderInput={({ InputComponent }) => <InputComponent />}
    />
  );
};

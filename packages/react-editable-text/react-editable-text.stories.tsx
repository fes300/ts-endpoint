import * as React from 'react';
import EditableText from '.';

export default {
  title: 'EditableText',
  component: EditableText,
};

export const basic = () => {
  const [text, setText] = React.useState('try editing this text');
  return (
    <EditableText
      text={text}
      onSetText={setText}
      RenderText={({ TextComponent }) => <TextComponent />}
      RenderInput={({ InputComponent }) => <InputComponent />}
    />
  );
};

export const typesGallery = () => {
  const [telText, setTelText] = React.useState('this text uses a tel type');
  const [urlText, setUrlText] = React.useState('this text uses an url type');
  const [weekText, setWeekText] = React.useState('this text uses a week type');
  const [dateText, setDateText] = React.useState('this text uses a date type');
  const [colorText, setColorText] = React.useState('this text uses a color type');
  const [fileText, setFileText] = React.useState('this text uses a file type');
  const [monthText, setMonthText] = React.useState('this text uses a month type');
  const [datetimeLocalText, setDatetimeLocalText] = React.useState(
    'this text uses a datetime-local type'
  );

  return (
    <div>
      <EditableText
        text={telText}
        onSetText={setTelText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="tel" />}
      />
      <EditableText
        text={urlText}
        onSetText={setUrlText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="url" />}
      />
      <EditableText
        text={weekText}
        onSetText={setWeekText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="week" />}
      />
      <EditableText
        text={dateText}
        onSetText={setDateText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="date" />}
      />
      <EditableText
        text={colorText}
        onSetText={setColorText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="color" />}
      />
      <EditableText
        text={fileText}
        onSetText={setFileText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="file" />}
      />
      <EditableText
        text={monthText}
        onSetText={setMonthText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="month" />}
      />
      <EditableText
        text={datetimeLocalText}
        onSetText={setDatetimeLocalText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent type="datetime-local" />}
      />
    </div>
  );
};

export const mirrorText = () => {
  const [text, setText] = React.useState('try editing this text');
  const [mirroredText, setMirroredText] = React.useState('');

  return (
    <div>
      <EditableText
        text={text}
        onChangeText={setMirroredText}
        onSetText={setText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent />}
      />
      this is mirroredText: {mirroredText}
    </div>
  );
};

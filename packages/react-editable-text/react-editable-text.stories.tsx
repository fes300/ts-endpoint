import { alt, some, none, Option, getOrElse } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as React from 'react';
import EditableText from '.';

export const basic = () => {
  const [text, setText] = React.useState(some('try editing this text'));

  return (
    <EditableText
      text={text}
      onSetText={setText}
      RenderText={({ TextComponent }) => <TextComponent />}
      RenderInput={({ InputComponent }) => <InputComponent />}
    />
  );
};

const Margin: React.FC<{
  right?: string;
  left?: string;
  top?: string;
  bottom?: string;
  style?: React.CSSProperties;
}> = ({ children, right, left, top, bottom, style }) => (
  <div
    style={{ ...style, marginRight: right, marginLeft: left, marginTop: top, marginBottom: bottom }}
  >
    {children}
  </div>
);

export const typesGallery = () => {
  const [telText, setTelText] = React.useState(some('this text uses a tel type'));
  const [urlText, setUrlText] = React.useState(some('this text uses an url type'));
  const [weekText, setWeekText] = React.useState(some('this text uses a week type'));
  const [dateText, setDateText] = React.useState(some('this text uses a date type'));
  const [colorText, setColorText] = React.useState(some('this text uses a color type'));
  const [monthText, setMonthText] = React.useState(some('this text uses a month type'));
  const [datetimeLocalText, setDatetimeLocalText] = React.useState(
    some('this text uses a datetime-local type')
  );

  const Wrapper: React.FC = ({ children }) => (
    <Margin right="20px" bottom="40px">
      {children}
    </Margin>
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <Wrapper>
        <EditableText
          text={telText}
          onSetText={setTelText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="tel" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={urlText}
          onSetText={setUrlText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="url" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={weekText}
          onSetText={setWeekText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="week" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={dateText}
          onSetText={setDateText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="date" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={colorText}
          onSetText={setColorText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="color" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={monthText}
          onSetText={setMonthText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="month" />}
        />
      </Wrapper>
      <Wrapper>
        <EditableText
          text={datetimeLocalText}
          onSetText={setDatetimeLocalText}
          RenderText={({ TextComponent }) => <TextComponent />}
          RenderInput={({ InputComponent }) => <InputComponent type="datetime-local" />}
        />
      </Wrapper>
    </div>
  );
};

export const mirrorText = () => {
  const [text, setText] = React.useState(some('try editing this text'));
  const [mirroredText, setMirroredText] = React.useState<Option<string>>(none);

  return (
    <div>
      <EditableText
        text={text}
        onChangeText={setMirroredText}
        onSetText={setText}
        RenderText={({ TextComponent }) => <TextComponent />}
        RenderInput={({ InputComponent }) => <InputComponent />}
      />
      <br />
      <br />
      <br />
      <br />
      <div style={{ marginLeft: 'auto', padding: '10px 20px', border: '1px solid', width: '40%' }}>
        <div style={{ fontStyle: 'italic' }}>
          somewhere ese in your app you can have mirrored text:
        </div>
        <div>
          {pipe(
            mirroredText,
            alt(() => text),
            getOrElse(() => '')
          )}
        </div>
      </div>
    </div>
  );
};

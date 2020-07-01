## React editble text

Very simple component to make your strings editable by double-clicking on them:

```ts
<EditableText
  text={some("editable text")}
  onSetText={(newText: Option<string>) => {/* save my new text */}}
  RenderText={({ TextComponent }) => <TextComponent />}
  RenderInput={({ InputComponent }) => <InputComponent />}
/>
```

`InputComponent` supports many different input types:
```ts
<EditableText
  text={some("editable text")}
  onSetText={(newText: Option<string>) => {/* save my new text */}}
  RenderText={({ TextComponent }) => <TextComponent />}
  RenderInput={({ InputComponent }) => <InputComponent type={'tel' || 'url' || 'week' || 'date' || 'color' || 'month' || 'datetime-local'} />}
/>
```


> *N.B.*: the component exposes monadic APIs, therefore it has `fp-ts` as a peer dependency


**Props**:
```ts
interface {
  RenderInput: TextEditableInputComponent;
  RenderText: TextEditableTextComponent;
  className?: string;
  disabled?: boolean;
  initialState?: EditState;
  onChangeText?: (newText: Option<string>) => void;
  onClick?: (v: Option<string>) => void;
  onSetText: (newText: Option<string>) => void;
  text: Option<string>;
}

type TextEditableInputComponent = React.FC<{
  InputComponent: React.FC<{
    className?: string;
    style?: React.CSSProperties;
    type?: 'tel' | 'url' | 'week' | 'date' | 'color' | 'month' | 'datetime-local';
  }>
}>;

type TextEditableTextComponent = React.FC<{
  TextComponent: React.FC<{ TextComponent: React.FC<{
    className?: string;
    style?: React.CSSProperties;
  }>
}>;

type EditState = 'edit' | 'text';
```

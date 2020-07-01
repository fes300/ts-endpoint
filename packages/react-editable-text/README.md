## react-editble-text

### install

```
$> yarn add @fes300/react-editable-text
```

> _N.B._: the component exposes monadic APIs, therefore it has `fp-ts` as a peer dependency

### description

`react-editable-text` is a very simple component to make your strings editable by double-clicking on them:
(detailed and interactive documentation can be found at https://determined-nobel-255bb0.netlify.app/?path=/docs/editabletext--mirror)

```ts
<EditableText
  text={some('editable text')}
  onSetText={(newText: Option<string>) => {
    /* save my new text */
  }}
  RenderText={({ TextComponent }) => <TextComponent />}
  RenderInput={({ InputComponent }) => <InputComponent />}
/>
```

`InputComponent` supports many different input types:

```ts
<EditableText
  text={some('editable text')}
  onSetText={(newText: Option<string>) => {
    /* save my new text */
  }}
  RenderText={({ TextComponent }) => <TextComponent />}
  RenderInput={({ InputComponent }) => (
    <InputComponent
      type={'tel' || 'url' || 'week' || 'date' || 'color' || 'month' || 'datetime-local'}
    />
  )}
/>
```

### props

| prop         | description                                                                             | type                                | optional | default  |
| ------------ | --------------------------------------------------------------------------------------- | ----------------------------------- | -------- | -------- |
| text         | the text value                                                                          | Option\<string\>                    | false    | -        |
| onSetText    | callback triggered when the user save (by pressing enter) the new text                  | (newText: Option\<string\>) => void | false    | -        |
| RenderInput  | function to render a custom Input                                                       | TextEditableInputComponent          | false    | -        |
| RenderText   | function to render a custom Text                                                        | TextEditableTextComponent           | false    | -        |
| className    | className attached to the Text/Input wrapper                                            | string                              | true     | ""       |
| disabled     | if set to true the user will not be able to modify the input or double-clck on the text | boolean                             | true     | false    |
| initialState | if the initial UI shows the Text ot the Input component                                 | EditState                           | true     | "text"   |
| onChangeText | optional callback triggered at every change of the input value                          | (newText: Option\<string\>) => void | true     | () => {} |
| onClick      | optional callback triggered when the text is clicked once                               | (newText: Option\<string\>) => void | true     | () => {} |

```ts
type EditState = 'edit' | 'text';

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
```

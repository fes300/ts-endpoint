import * as React from 'react';
import { useState } from 'react';
import { Option, fromPredicate, getOrElse } from 'fp-ts/lib/Option';

const nonEmptyString = fromPredicate((s: string) => s !== '');
const defaultToEmptyString = getOrElse(() => '');

interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}
type InputComponent = React.FC<
  StyleProps & {
    type?: 'tel' | 'url' | 'week' | 'date' | 'color' | 'month' | 'datetime-local';
  }
>;
type TextComponent = React.FC<StyleProps>;

type TextEditableInputComponent = React.FC<{ InputComponent: InputComponent }>;
type TextEditableTextComponent = React.FC<{ TextComponent: TextComponent }>;

export type EditState = 'edit' | 'text';

interface Props {
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

let clickTriggers: number[] = [];

/**
 * @description EditableText will only rerender if the "text" property changes.
 */
const EditableText: React.FunctionComponent<Props> = React.memo(
  ({
    RenderInput,
    RenderText,
    className,
    disabled,
    initialState,
    onChangeText,
    onClick,
    onSetText,
    text,
  }) => {
    const [editState, setEditState] = useState<EditState>(initialState ?? 'text');
    const inputEl = React.useRef<HTMLInputElement | null>(null);

    const InputComponent: InputComponent = ({ className, style, type }) => (
      <input
        className={className}
        style={style}
        disabled={disabled ?? false}
        onChange={(e) => onChangeText?.(nonEmptyString(e.target.value))}
        defaultValue={defaultToEmptyString(text)}
        ref={inputEl}
        type={type ?? 'text'}
        autoFocus={true}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          onChangeText?.(text);
          setEditState('text');
        }}
        onKeyDown={(e) => {
          if (inputEl.current === null) {
            return;
          }
          if (e.key === 'Enter' || e.keyCode === 9 /* Tab */) {
            onSetText(nonEmptyString(inputEl.current.value));
            setEditState('text');
          }
          if (e.key === 'Escape') {
            onChangeText?.(text);
            setEditState('text');
          }
        }}
      />
    );

    const TextComponent: TextComponent = ({ className, style }) => (
      <div
        className={className}
        ref={() => {}}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) {
            return;
          }
          // this is needed to avoid running onClick handlers on doubleClick
          const trigger = window.setTimeout(() => onClick?.(text), 200);
          clickTriggers.push(trigger);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (disabled) {
            return;
          }
          clickTriggers.map(clearTimeout);
          clickTriggers = [];
          setEditState('edit');
        }}
      >
        {defaultToEmptyString(text)}
      </div>
    );

    return (
      <div className={`react-editable-text ${className ?? ''})`}>
        {editState === 'edit' ? (
          <RenderInput InputComponent={InputComponent} />
        ) : (
          <RenderText TextComponent={TextComponent} />
        )}
      </div>
    );
  },
  (oldProps, newProps) => oldProps.text === newProps.text
);

export default EditableText;

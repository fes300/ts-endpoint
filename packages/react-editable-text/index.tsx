import * as React from 'react';
import { useState } from 'react';

interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}
type InputComponent = React.FC<
  StyleProps & {
    type?: 'tel' | 'url' | 'week' | 'date' | 'color' | 'file' | 'month' | 'datetime-local';
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
  onChangeText?: (newText?: string) => void;
  onClick?: (v: string) => void;
  onSetText: (newText: string) => void;
  text: string;
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
        onChange={(e) => onChangeText?.(e.target.value)}
        defaultValue={text}
        ref={inputEl}
        type={type ?? 'text'}
        autoFocus={true}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          // TODO(quality) this is not the best api...
          onChangeText?.(undefined);
          setEditState('text');
        }}
        onKeyDown={(e) => {
          if (inputEl.current === null) {
            return;
          }
          if (e.key === 'Enter' || e.keyCode === 9 /* Tab */) {
            onSetText(inputEl.current.value);
            setEditState('text');
          }
          if (e.key === 'Escape') {
            // TODO(quality) this is not the best api...
            onChangeText?.(undefined);
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
        {text}
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

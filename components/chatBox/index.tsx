import React, { FC, useCallback, useEffect, useRef } from 'react';
import { ChatArea, Form, MentionsTextarea, SendButton, Toolbox } from './styles';
import autosize from 'autosize';

interface Prop {
  chat: string;
  onSubmitForm: (e: React.FormEvent<HTMLElement>) => void;
  onChangeChat: (e: any) => void;
  placeHolder: string;
}

const ChatBox: FC<Prop> = ({ chat, onSubmitForm, onChangeChat, placeHolder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeyDownChat = useCallback(
    (e: any) => {
      console.log(e.nativeEvent.isComposing);
      // 한글 입력시 마지막 엔터 입력시  e.nativeEvent.isComposing = true, false가 함께 입력됨
      // 마지막 false가 입력될 때 채팅 전송
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm],
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeyDownChat}
          placeholder={placeHolder}
          ref={textareaRef}
        />
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;

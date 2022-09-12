import ChatBox from '@components/chatBox';
import ChatList from '@components/chatList';
import useInput from '@hooks/useInput';
import React, { useCallback } from 'react';
import { Container, Header } from './styles';

const Channel = () => {
  const [chat, onChangeChat, setChat] = useInput('');

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      setChat('');
    },
    [chat],
  );

  return (
    <Container>
      <Header>채널</Header>
      <ChatList />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} placeHolder="" />
    </Container>
  );
};

export default Channel;

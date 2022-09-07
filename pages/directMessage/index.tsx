import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React from 'react';
import useSWR from 'swr';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import ChatBox from '@components/chatBox';
import ChatList from '@components/chatList';

const directMessage = () => {
  const { workspace, id } = useParams<{ workspace?: string; id?: string }>();
  const { data: userData } = useSWR(`/api/workspace/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList />
      <ChatBox chat="" />
    </Container>
  );
};

export default directMessage;

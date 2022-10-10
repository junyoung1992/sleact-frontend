import { IDM } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { Container, DragOver, Header } from './styles';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import ChatBox from '@components/chatBox';
import ChatList from '@components/chatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import dayjs from 'dayjs';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace?: string; id?: string }>();
  const { data: myData } = useSWR('/api/users', fetcher);
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/members/${id}`, fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const [chat, onChangeChat, setChat] = useInput('');
  const [dragOver, setDragOver] = useState(false);

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            senderId: myData.id,
            sender: myData,
            receiverId: userData.id,
            receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false) // optimistic ui: 안정성 vs 사용성
          .then(() => {
            setChat('');
            scrollbarRef.current?.scrollToBottom();
          });

        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat })
          .then(() => {
            localStorage.setItem(`${workspace}-${id}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
            mutateChat();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, id, mutateChat, myData, setChat, userData, workspace],
  );

  const onMessage = useCallback(
    (data: IDM) => {
      // 상대방의 채팅만 mutateChat
      // 내가 입력한 채팅은 socket.io를 통해 들어오면 안됨
      if (data.senderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          // 상대방이 채팅을 입력했을 때 스크롤이 하단으로 내려오는 기준 설정
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log('scrollToBottom:', scrollbarRef.current?.getValues);
              scrollbarRef.current.scrollToBottom();
            }
          }
        });
      }
    },
    [id, mutateChat, myData],
  );

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [onMessage, socket]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  // 채팅 확인 시점: local storage에 저장
  // dm unread 채팅 수 확인할 때 사용
  useEffect(() => {
    localStorage.setItem(`${workspace}-${id}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
  }, [id, workspace]);

  const onDragOver = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(e);

      setDragOver(true);
    },
    [setDragOver],
  );

  const onDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(e);

      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            console.log(e.dataTransfer.items[i]);
            const file = e.dataTransfer.items[i].getAsFile();
            console.log('... file[' + i + '].name = ' + file.name);
            formData.append('image', file);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }

      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${id}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
        mutateChat();
      });
    },
    [id, mutateChat, workspace],
  );

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container onDragOver={onDragOver} onDrop={onDrop}>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.name} />
        <span>{userData.name}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} placeHolder="" />
      {dragOver && <DragOver>업로드</DragOver>}
    </Container>
  );
};

export default DirectMessage;

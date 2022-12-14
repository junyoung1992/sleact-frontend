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
            senderName: myData.name,
            senderEmail: myData.email,
            receiverId: userData.id,
            // receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false) // optimistic ui: ????????? vs ?????????
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
      // ???????????? ????????? mutateChat
      // ?????? ????????? ????????? socket.io??? ?????? ???????????? ??????
      if (data.senderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          // ???????????? ????????? ???????????? ??? ???????????? ???????????? ???????????? ?????? ??????
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

  // ?????? ??? ???????????? ?????? ?????????
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  // ?????? ?????? ??????: local storage??? ??????
  // dm unread ?????? ??? ????????? ??? ??????
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
      {dragOver && <DragOver>?????????</DragOver>}
    </Container>
  );
};

export default DirectMessage;

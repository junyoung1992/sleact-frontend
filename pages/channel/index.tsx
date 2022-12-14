import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { Container, DragOver, Header } from './styles';
import { useParams } from 'react-router';
import ChatBox from '@components/chatBox';
import ChatList from '@components/chatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import InviteChannelModal from '@components/inviteChannelModal';
import dayjs from 'dayjs';
import { Client, IMessage } from '@stomp/stompjs';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace?: string; channel?: string }>();
  const { data: myData } = useSWR('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  // const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const [chat, onChangeChat, setChat] = useInput('');
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            userId: myData.id,
            username: myData.name,
            email: myData.email,
            // user: myData,
            channelId: channelData.id,
            channelName: channelData.name,
            // channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false) // optimistic ui: ????????? vs ?????????
          .then(() => {
            localStorage.setItem(`${workspace}-${channel}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
            setChat('');
            scrollbarRef.current?.scrollToBottom();
          });

        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, { content: chat })
          .then(() => {
            mutateChat();
          })
          .catch(console.error);
      }
    },
    [channel, channelData, chat, chatData, mutateChat, myData, setChat, workspace],
  );

  // const onMessage = useCallback(
  //   (data: IChat) => {
  //     // ???????????? ????????? mutateChat
  //     // ?????? ????????? ????????? socket.io??? ?????? ???????????? ??????
  //     if (
  //       data.channelName === channel &&
  //       (data.content.startsWith('uploads\\') || data.content.startsWith('uploads/') || data.userId !== myData.id)
  //     ) {
  //       mutateChat((chatData) => {
  //         chatData?.[0].unshift(data);
  //         return chatData;
  //       }, false).then(() => {
  //         // ???????????? ????????? ???????????? ??? ???????????? ???????????? ???????????? ?????? ??????
  //         if (scrollbarRef.current) {
  //           if (
  //             scrollbarRef.current.getScrollHeight() <
  //             scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
  //           ) {
  //             console.log('scrollToBottom:', scrollbarRef.current?.getValues);
  //             scrollbarRef.current.scrollToBottom();
  //           }
  //         }
  //       });
  //     }
  //   },
  //   [channel, mutateChat, myData],
  // );

  // useEffect(() => {
  //   socket?.on('message', onMessage);
  //   return () => {
  //     socket?.off('message', onMessage);
  //   };
  // }, [onMessage, socket]);

  // ?????? ??? ???????????? ?????? ?????????
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  // ?????? ?????? ??????: local storage??? ??????
  // ?????? unread ?????? ??? ????????? ??? ??????
  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
  }, [channel, workspace]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

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

      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${channel}`, dayjs(new Date().getTime()).format('YYYY-MM-DDTHH:mm:ss'));
        mutateChat();
      });
    },
    [channel, mutateChat, workspace],
  );

  const onChangeFile = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(e);

      const formData = new FormData();
      if (e.target.file) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            console.log(e.dataTransfer.items[i]);
            const file = e.dataTransfer.items[i].getAsFile();
            console.log('... file[' + i + '].name = ' + file.name);
            formData.append('image', file);
          }
        }
      }

      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
        mutateChat();
      });
    },
    [channel, mutateChat, workspace],
  );

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!myData) {
    return null;
  }

  return (
    <Container onDragOver={onDragOver} onDrop={onDrop}>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} placeHolder="" />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      {/* <input type="file" multiple onChange={onChangeFile} /> */}
      {dragOver && <DragOver>?????????</DragOver>}
    </Container>
  );
};

export default Channel;

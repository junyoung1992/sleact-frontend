import Chat from '@components/chat';
import { IChat, IDM } from '@typings/db';
import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatSections: { [key: string]: (IChat | IDM)[] };
  setSize: (f: (size: number) => number) => Promise<(IChat | IDM)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(({ chatSections, setSize, isEmpty, isReachingEnd }, scrollbarRef) => {
  const onScroll = useCallback(
    (values: positionValues) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        console.log('가장 위');
        setSize((prevSize) => prevSize + 1).then(() => {
          // 스크롤 위치 유지
          const current = (scrollbarRef as MutableRefObject<Scrollbars>)?.current;
          if (current) {
            console.log(current?.getScrollHeight(), values.scrollHeight);
            current.scrollTop(current?.getScrollHeight() - values.scrollHeight);
          }
        });
      }
    },
    [isReachingEnd, scrollbarRef, setSize],
  );

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
});

export default ChatList;

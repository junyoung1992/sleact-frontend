import { IChat, IDM, IUser } from '@typings/db';
import React, { FC, memo, useMemo } from 'react';
import { ChatWrapper } from './styles';
import gravator from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';

interface Props {
  data: IChat | IDM;
}

const Chat: FC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string }>();

  const user: IUser = 'Sender' in data ? data.Sender : data.User;

  const result = useMemo<(string | JSX.Element)[]>(() => {
    return regexifyString({
      input: data.content,
      pattern: /@\[(.+?)\]\((\d+?)\)|\n]/g,
      decorator(match, index) {
        const arr = match.match(/@\[(.+?)\]\((\d+?)\)/)!; // ! : non-null assertion
        if (arr) {
          return (
            <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
              @{arr[1]}
            </Link>
          );
        }
        return <br key={index} />;
      },
    });
  }, [data.content, workspace]);

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravator.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);

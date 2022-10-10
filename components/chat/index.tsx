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

const BACK_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3095' : 'http://localhost:3095';
const Chat: FC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string }>();

  const user: IUser = 'sender' in data ? data.sender : data.user;

  const result = useMemo(
    () =>
      data.content.startsWith('uploads\\') || data.content.startsWith('uploads/') ? (
        <img src={`${BACK_URL}/${data.content}`} style={{ maxHeight: 200 }} alt={data.content} />
      ) : (
        regexifyString({
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
        })
      ),
    [data.content, workspace],
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravator.url(user.email, { s: '36px', d: 'retro' })} alt={user.name} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.name}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);

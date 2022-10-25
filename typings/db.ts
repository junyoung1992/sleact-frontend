export interface IUser {
  id: number;
  name: string;
  email: string;
  workspaces: IWorkspace[];
}

export interface IUserWithOnline extends IUser {
  online: boolean;
}

export interface IChannel {
  id: number;
  name: string;
  private: boolean; // 비공개 채널 여부, 강좌에서는 모두 false(공개)
  workspaceId: number;
}

export interface IChat {
  // 채널의 채팅
  id: number;
  userId: number;
  username: string;
  email: string;
  // user: IUser; // 보낸 사람
  content: string;
  createdAt: Date;
  channelId: number;
  channelName: string;
  // channel: IChannel;
}

export interface IDM {
  // DM 채팅
  id: number;
  senderId: number; // 보낸 사람 아이디
  senderName: string;
  senderEmail: string;
  // sender: IUser;
  receiverId: number; // 받는 사람 아이디
  // receiver: IUser;
  content: string;
  createdAt: Date;
}

export interface IWorkspace {
  id: number;
  name: string;
  url: string; // 주소 창에 보이는 주소
  ownerId: number; // 워크스페이스 만든 사람 아이디
}

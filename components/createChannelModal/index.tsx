import Modal from '@components/modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/signup/styles';
import React from 'react';
import { useCallback, VFC } from 'react';

interface Props {
  show: boolean;
  onCloseModal: () => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal }) => {
  const [newChannel, onChangeNewChannel] = useInput('');
  const onCreateChannel = useCallback(() => {}, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널 이름</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel}></Input>
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;

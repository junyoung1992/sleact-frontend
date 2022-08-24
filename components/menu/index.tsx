import React, { CSSProperties, FC, PropsWithChildren, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from './styles';

interface Props {
  style: CSSProperties;
  show: boolean;
  onCloseModal: (e: any) => void;
}
const Menu: FC<PropsWithChildren<Props>> = ({ children, style, show, onCloseModal }) => {
  const stopPropagation = useCallback((e: any) => {
    e.stopPropagation();
  }, []);

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {show && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

Menu.defaultProps = {
  show: true,
};

export default Menu;

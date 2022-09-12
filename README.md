# Sleact - Front

Inflearn) Slack 클론 코딩[실시간 채팅 with React] 강의 학습<br />
https://github.com/ZeroCho/sleact

## Dependencies

```bash
npm i react react-dom \
    typescript @types/react @types/react-dom \
    cross-env ts-node \
    react-router react-router-dom \
    @loadable/component \
    @emotion/react @emotion/styled \
    axios swr \
    gravatar @types/gravatar \
    react-mentions @types/react-mentions
    autosize @types/autosize
```

```bash
npm i -D eslint \
    prettier eslint-plugin-prettier eslint-config-prettier \
    eslint-config-react-app eslint-plugin-flowtype eslint-plugin-import \
    eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react \
    webpack webpack-cli webpack-dev-server \
    @types/node @types/webpack @types/webpack-dev-server \
    babel-loader @babel/eslint-parser @babel/core @babel/preset-typescript \
    @babel/preset-env @babel/preset-typescript @babel/preset-react \
    style-loader css-loader \
    react-refresh@"^0.12.0" \
    @pmmmwh/react-refresh-webpack-plugin@"^0.5.0-rc.0" \
    fork-ts-checker-webpack-plugin \
    @types/react-router @types/react-router-dom \
    @types/loadable__component
```

## Structure

```
.
|-- pages      : 서비스 페이지
|   |-- login
|   |-- signUp
|   |-- channel
|   `-- directMessage
|-- components : 컴포넌트
|-- layouts    : 공통 레이아웃
|-- hooks
|-- typings
`-- utils
```

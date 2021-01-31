import React from 'react';
import { Header, Message } from 'semantic-ui-react';

function Index() {
  return (
    <div>
      <Header as="h1" className="dividing artivle-title">首頁</Header>
      <Message size='big'>嘿，歡迎您回來。</Message>
    </div>
  );
}

export default Index;


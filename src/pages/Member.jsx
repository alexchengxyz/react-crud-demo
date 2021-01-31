import React, { useState, useEffect } from 'react';
import { Header, Table, Button, Modal, Form, Message, Pagination } from 'semantic-ui-react';
import axios from 'axios';
import Search from '../components/Search';

const moment = require('moment');
const postsPerPage = 20;

function Member(){
  const [userList, setUserList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState('');
  const [search, setSearch] = useState('');
  const [searchTotal, setSearchTotal] = useState('');
  const [paginationTotal, setPaginationTotal] = useState('');
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [addError, setAddError] = useState(false);
  const [editError, setEditError] = useState(false);

  const [newMemberData, setNewMemberData] = useState({
    username: '',
    enable: 0,
    locked: 0
  });

  const [editMemberData, setEditMemberData] = useState({
    id: '',
    username: '',
    enable: 0,
    locked: 0
  });

  useEffect( () => {
    refresh(activePage);
  }, [activePage]);

  // 刷新資料
  function refresh(number) {
    let firstPost = (number * postsPerPage) - postsPerPage ;
    let pageNoUrl  = new URLSearchParams();

    pageNoUrl.set('first_result', firstPost);
    pageNoUrl.set('max_results', postsPerPage);

    axios.get('/api/users?' + pageNoUrl).then((res) => {
      let itemTotal = res.data.pagination.total;
      let newPaginationTotal = Math.ceil(itemTotal / postsPerPage);

      setUserList(res.data.ret);
      setTotal(itemTotal);
      setSearch('');
      setPaginationTotal(newPaginationTotal);
    })

  }

  // 新增資料
  function addMember() {
    if (newMemberData.username) {
      axios.post('/api/user', newMemberData).then((res) => {
        const newUserList = [res.data.ret, ...userList];

        setUserList(newUserList);
        setActivePage(1);
        setTotal(total + 1);
        setPaginationTotal(paginationTotal);
        setAddMemberModal(false);

        setNewMemberData({
          username: '',
          enable: 0,
          locked: 0
        });

        refresh(1);
      });
    } else {
      setAddError(true);
      setAddMemberModal(true);
    }
  }

  // 編輯資料
  function editMember(id, username, enable, locked) {
    setEditMemberData({ id, username, enable, locked });
    setEditMemberModal(!editMemberModal);
  }

  function updateMember() {
    if (editMemberData.username) {
      let insertId = editMemberData.id;

      let insertData = {
        username: editMemberData.username,
        enable: editMemberData.enable,
        locked:  editMemberData.locked
      }

      axios.put('/api/user/' + insertId, insertData).then(() => {
        if (search) {
          formSearch(search, activePage);
        } else {
          refresh(activePage);
        }

        setActivePage(activePage);
        setEditMemberModal(false);
        setEditError(false);

        setEditMemberData({
          id: '',
          username: '',
          enable: '',
          locked: ''
        });
      });
    } else {
      setEditError(true);
    }
  }

  // 刪除資料
  function deleteMember(id) {
    if (confirm('請確認是否刪除')) {
      axios.delete('/api/user/' + id).then(() => {
        let number;
        let allItem;

        if (search) {
          allItem = searchTotal;
        } else {
          allItem = total;
        }

        let changeNumber = Math.ceil((allItem - 1) / postsPerPage);

        if (activePage > changeNumber) {
          number = changeNumber;
        } else {
          number = activePage;
        }

        setActivePage(number);

        if (search) {
          formSearch(search, number);
        } else {
          refresh(number);
        }
      });
    } else {
      return false;
    }
  }

  // 搜尋
  function formSearch(searchText, number) {
    let firstPost = (number * postsPerPage) - postsPerPage ;
    let proSearchText = searchText.toLowerCase();
    let getYear = proSearchText.substring(0,4);
    let getMoth = proSearchText.substr(5,2);
    let getDay = proSearchText.substr(8,2);
    let getHours = proSearchText.substr(13,2);
    let getMinute = proSearchText.substr(-2);
    let getDate;
    let getTime;
    let getAllTime;
    let searchUrl  = new URLSearchParams();

    searchUrl.set('first_result', firstPost);
    searchUrl.set('max_results', postsPerPage);

    if (!isNaN(proSearchText)) {
      searchUrl.set('id', proSearchText);
    }

    // 比對年月日
    if(
      !isNaN(getYear)
      && !isNaN(getMoth)
      && !isNaN(getDay)
      && proSearchText.length === 10
      || proSearchText.length === 18
    ){
      getDate = getYear + '-' + getMoth + '-' + getDay;
    }

    // 比對所有時間
    if(
      !isNaN(getYear)
      && !isNaN(getMoth)
      && !isNaN(getDay)
      && !isNaN(getHours)
      && !isNaN(getMinute)
      && proSearchText.length === 18
    ){
      getTime = getHours + ':' + getMinute;
      getAllTime = getYear + '-' + getMoth + '-' + getDay + ' / ' + getTime;
    }

    if (
      proSearchText !== '否'
      && proSearchText !== '是'
      && proSearchText !== getDate
      && proSearchText !== getAllTime
    ) {
      searchUrl.set('username', proSearchText);
    }

    if (proSearchText === '否') {
      searchUrl.set('enable', 0);
      searchUrl.set('locked', 0);
    }

    if (proSearchText === '是') {
      searchUrl.set('enable', 1);
      searchUrl.set('locked', 1);
    }

    // 搜尋年月日
    if (proSearchText === getDate && proSearchText.length === 10) {
      let timeStart = moment().format('T00:00:00+00:00');
      let timeEnd = moment().format('T24:59:59+59:59');

      searchUrl.set('start_created_at', getDate + timeStart);
      searchUrl.set('end_created_at', getDate + timeEnd);
    }

    // 搜尋年月日時
    if (proSearchText === getAllTime && proSearchText.length === 18) {
      let timeStart = moment().format(':00+00:00');
      let timeEnd = moment().format(':59+59:59');

      searchUrl.set('start_created_at', getDate + 'T' + getTime + timeStart);
      searchUrl.set('end_created_at', getDate + 'T' + getTime + timeEnd);
    }

    axios.get('/api/users?' + searchUrl).then((res) => {
      let dataPageTotal = res.data.pagination.total;
      let newPaginationTotal = Math.ceil(dataPageTotal / postsPerPage);

      setUserList(res.data.ret);
      setSearch(searchText);
      setSearchTotal(dataPageTotal);
      setPaginationTotal(newPaginationTotal);
    });
  }

  // 分頁刷頁
  function handlePaginationChange(e, {activePage}) {
    setActivePage(activePage);

    if (search){
      formSearch(search, activePage);
    } else {
      refresh(activePage);
    }
  }

  // 彈跳視窗 - 新增資料
  function newToggleModal() {
    setAddMemberModal(!addMemberModal);
    setAddError(false);
  }

  // 彈跳視窗 - 編輯資料
  function editToggleModal() {
    setEditMemberModal(!editMemberModal);
    setEditError(false);
  }

  let showUserList;
  let showPagination;
  let noInfo;

  // 顯示列表
  if (total) {
    showUserList = userList.map((userData) => {
      let showEnable;
      let showLocked;
      let getDate = userData.created_at.slice(0, 10);
      let getTime = userData.created_at.slice(11, 16);
      let showTime = getDate + ' / ' + getTime;

      // 將enable與locked從值轉為中文字串
      if (userData.enable === 0) {
        showEnable = '否';
      } else {
        showEnable = '是';
      }

      if (userData.locked === 0) {
        showLocked = '否';
      } else {
        showLocked = '是';
      }

      return (
        <Table.Row key={userData.id} data-testid="displayList">
          <Table.Cell>{userData.id}</Table.Cell>
          <Table.Cell>{userData.username}</Table.Cell>
          <Table.Cell>{showEnable}</Table.Cell>
          <Table.Cell>{showLocked}</Table.Cell>
          <Table.Cell>{showTime}</Table.Cell>
          <Table.Cell>
            <Button
              color="teal"
              onClick={() => editMember(userData.id, userData.username, userData.enable, userData.locked)}
            >
              編輯
            </Button>
            <Button
              color="red"
              onClick={() => deleteMember(userData.id)}
            >
              刪除
            </Button>
          </Table.Cell>
        </Table.Row>
      );
    });
  }

  if (total < 1 || (search && searchTotal < 1)) {
    noInfo = (
      <Table.Row>
        <Table.Cell colSpan="7">
          <Message>
            <Message.Header>找不到符合條件的內容。</Message.Header>
          </Message>
        </Table.Cell>
      </Table.Row>
    );
  }

  // 顯示頁碼
  if (paginationTotal > 1) {
    showPagination = (
      <div className="ui.clearing.segment">
        <div style={{float: 'right', marginBottom: '40px'}} className="ui pagination menu">
          <Pagination
            activePage={activePage}
            onPageChange={handlePaginationChange}
            totalPages={paginationTotal}
          />
        </div>
      </div>
    );
  }

  return(
    <div>
        <Header as="h1" className="dividing artivle-title">會員管理</Header>

        <div style={{textAlign: 'right'}}>
          <Search
            value={search}
            onChange={(e) => {
              let value = e.target.value;
              setSearch(value);
              setActivePage(1);
              formSearch(value, 1);
            }}
          />
          <Button color="blue" onClick={newToggleModal}>新增會員</Button>
        </div>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>序號</Table.HeaderCell>
              <Table.HeaderCell>名字</Table.HeaderCell>
              <Table.HeaderCell>是否啟用</Table.HeaderCell>
              <Table.HeaderCell>是否鎖定</Table.HeaderCell>
              <Table.HeaderCell>建立時間</Table.HeaderCell>
              <Table.HeaderCell>設定</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {showUserList}
            {noInfo}
          </Table.Body>
        </Table>

        {showPagination}

        {/* 彈跳視窗 - 新增資料 */}
        <Modal open={addMemberModal} data-testid="addMemberModal">
          <Modal.Header>新增會員</Modal.Header>
          <Modal.Content>
            <Form error={addError}>
              <Form.Group widths='equal'>
                <Form.Input
                  fluid
                  label='姓名'
                  error={addError}
                  value={newMemberData.username}
                  onChange={ e => setNewMemberData({...newMemberData, username: e.target.value }) }
                />
              </Form.Group>
              <Message error content="請填寫姓名" />
              <Form.Group widths='equal'>
                <Form.Field
                  label="是否啟動"
                  control="select"
                  value={newMemberData.enable}
                  onChange={ e => setNewMemberData({ ... newMemberData, enable: Number(e.target.value) }) }
                  data-testid="addMemberEnable"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </Form.Field>
                <Form.Field
                  label="是否鎖定"
                  control="select"
                  value={newMemberData.locked}
                  onChange={ e => setNewMemberData({ ... newMemberData, locked: Number(e.target.value) }) }
                  data-testid="addMemberLocked"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </Form.Field>
              </Form.Group>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={addMember}>確定</Button>
            <Button onClick={newToggleModal}>取消</Button>
          </Modal.Actions>
        </Modal>

        {/* 彈跳視窗 - 編輯資料 */}
        <Modal open={editMemberModal} data-testid="editMemberModal">
          <Modal.Header>修改會員資料</Modal.Header>
          <Modal.Content>
            <Form error={editError}>
              <Form.Group widths='equal'>
                <Form.Input
                  fluid
                  label='姓名'
                  error={editError}
                  value={editMemberData.username}
                  onChange={ e => setEditMemberData({ ... editMemberData, username: e.target.value }) }
                />
              </Form.Group>
              <Message error content="請填寫姓名" />
              <Form.Group widths='equal'>
                <Form.Field
                  label="是否啟動"
                  control="select"
                  value={editMemberData.enable}
                  onChange={ e => setEditMemberData({ ... editMemberData, enable: Number(e.target.value) }) }
                  data-testid="editMemberEnable"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </Form.Field>
                <Form.Field
                  label="是否鎖定"
                  control="select"
                  value={editMemberData.locked}
                  onChange={ e => setEditMemberData({ ... editMemberData, locked: Number(e.target.value) }) }
                  data-testid="editMemberLocked"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </Form.Field>
              </Form.Group>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={updateMember}>更新</Button>
            <Button onClick={editToggleModal}>取消</Button>
          </Modal.Actions>
        </Modal>
    </div>
  );
}

export default Member;

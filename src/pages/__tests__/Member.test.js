import React from 'react';
import { render, cleanup, waitForElement, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Member from '../Member';

jest.mock('axios');

afterEach(cleanup);

test('first render show 20 item', async () => {
  const userList = [
    { id: 1, username: "user1", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 2, username: "user2", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 3, username: "user3", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 4, username: "user4", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 5, username: "user5", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 6, username: "user6", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 7, username: "user7", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 8, username: "user8", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 9, username: "user9", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 10, username: "user10", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 11, username: "user11", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 12, username: "user12", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 13, username: "user13", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 14, username: "user14", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 15, username: "user15", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 16, username: "user16", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 17, username: "user17", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 18, username: "user18", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 19, username: "user19", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 20, username: "user20", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
  ]

  const resp = {
    data: {
      ret: userList,
      pagination: { total: userList.length }
    }
  };

  axios.get.mockResolvedValue(resp);

  const { getAllByTestId } = render(<Member />);
  const item = await waitForElement( () => getAllByTestId('displayList') );

  expect(item).toHaveLength(20);
});

test('add new item', async () => {
  const { getByTestId, findAllByTestId, getByText } = render(<Member />);
  let addButton = getByText('新增會員');

  const resp = {
    data: {
      ret: { id: 21, username: "alex", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" }
    }
  }

  // 打開新增會員視窗
  fireEvent.click(addButton);
  let addMemberModal = getByTestId('addMemberModal');
  expect(addMemberModal).toHaveTextContent('新增會員');

  // 輸入資料並送出
  fireEvent.change(addMemberModal.querySelector('input'), { target: { value: 'alex' } });
  fireEvent.change(getByTestId('addMemberEnable'), { target: { value: '1' } });
  fireEvent.change(getByTestId('addMemberLocked'), { target: { value: '0' } });

  expect(getByTestId('addMemberEnable').value).toBe('1');
  expect(getByTestId('addMemberLocked').value).toBe('0');

  axios.post.mockResolvedValue(resp);

  let addItem;

  await act( async () => {
    await fireEvent.click(getByText('確定'));
    // 取回列表資料
    addItem = await findAllByTestId('displayList');
  });

  expect(addItem).toHaveLength(1);
  expect(addItem[0].textContent).toEqual('21alex是否2019-08-13 / 17:54編輯刪除')
});

test('enter null value and show error message', async () => {
  const { getByTestId, getByText } = render(<Member />);
  let addButton = getByText('新增會員');

  await act( async() => {
    // 打開新增會員視窗
    fireEvent.click(addButton);
  });

  let addMemberModal = getByTestId('addMemberModal');
  expect(addMemberModal).toHaveTextContent('新增會員');

  // 輸入資料並送出
  fireEvent.change(addMemberModal.querySelector('input'), { target: { value: '' } });
  fireEvent.change(getByTestId('addMemberEnable'), { target: { value: '1' } });
  fireEvent.change(getByTestId('addMemberLocked'), { target: { value: '0' } });
  fireEvent.click(getByText('確定'));

  expect(addMemberModal.querySelector('form')).toHaveClass('error');
});

describe('edit item and finish edit result', () => {
  afterEach(cleanup);

  test('username is null and send edit message,check have error class', async () => {
    const { getByTestId, findAllByTestId, getByText, getAllByText } = render(<Member />);
    await findAllByTestId('displayList');
    let editButton = getAllByText('編輯');

    // 打開編輯視窗
    fireEvent.click(editButton[0]);

    let editMemberModal = getByTestId('editMemberModal');
    let clickUpdate = getByText('更新');
    let clickCancel = getByText('取消');

    // 更換內容並送出
    fireEvent.change(editMemberModal.querySelector('input'), { target: { value: '' } });
    fireEvent.click(clickUpdate);
    fireEvent.click(clickCancel);

    expect(editMemberModal.querySelector('form')).toHaveClass('error');
    expect(editMemberModal).not.toHaveTextContent('新增會員');
  });

  test('username is not null and send edit message', async () => {
    const { getByTestId, findAllByTestId, getByText, getAllByText } = render(<Member />);
    await findAllByTestId('displayList');
    let editButton = getAllByText('編輯');
    const newResp = {
      data: {
        ret: { id: 1, username: "bob", enable: 1, locked: 1, created_at: "2019-08-13T17:54:31+00:00" }
      }
    }

    // 打開編輯視窗
    fireEvent.click(editButton[0]);

    let editMemberModal = getByTestId('editMemberModal');
    let clickUpdate = getByText('更新');

    expect(editMemberModal.querySelector('input').value).toBe('user1');

    // 更換內容並送出
    fireEvent.change(editMemberModal.querySelector('input'), { target: { value: 'bob' } });
    fireEvent.change(getByTestId('editMemberEnable'), { target: { value: '1' } });
    fireEvent.change(getByTestId('editMemberLocked'), { target: { value: '1' } });

    expect(getByTestId('editMemberEnable').value).toBe('1');
    expect(getByTestId('editMemberLocked').value).toBe('1');

    axios.put.mockResolvedValue(newResp);

    await act( async() => {
      await fireEvent.click(clickUpdate);
    });
  });

  test('check return message', async () => {
    const resp = {
      data: {
        ret: [
          { id: 1, username: "bob", enable: 1, locked: 1, created_at: "2019-08-13T17:54:31+00:00" },
          { id: 2, username: "user2", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
        ],
        pagination: { total: 2 }
      }
    };

    // 重製mock並回傳新的mock
    axios.get.mockRestore();
    axios.get.mockResolvedValue(resp);

    const { getAllByTestId } = render(<Member />);
    const item = await waitForElement( () => getAllByTestId('displayList') );

    expect(item[0].textContent).toEqual('1bob是是2019-08-13 / 17:54編輯刪除');
  });
});

describe('search result', () => {
  afterEach(cleanup);

  test('enter id and check input value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: '1' } });
    });

    expect(searchInput.value).toBe('1');
  });

  test('enter username and check input value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: 'user1' } });
    });

    expect(searchInput.value).toBe('user1');
  });

  test('enter 否 and check select value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: '否' } });
    });

    expect(searchInput.value).toBe('否');
  });

  test('enter 是 and check select value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: '是' } });
    });

    expect(searchInput.value).toBe('是');
  });

  test('enter year,month,day and check input value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: '2019-08-13' } });
    });

    expect(searchInput.value).toBe('2019-08-13');
  });

  test('enter year,month,day,time and check input value', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    await act( async() => {
      fireEvent.change(searchInput, { target: { value: '2019-08-13 / 17:54' } });
    });

    expect(searchInput.value).toBe('2019-08-13 / 17:54');
  });

  test('enter value and delete item', async () => {
    window.confirm = jest.fn(() => true);
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    fireEvent.change(searchInput, { target: { value: 'user1' } });

    const { findAllByTestId, getAllByText } = render(<Member />);

    // 取回列表資料
    await findAllByTestId('displayList');

    const mockDelet = axios.delete.mockResolvedValue();

    await act( async() => {
      await fireEvent.click(getAllByText('刪除')[0]);
    });

    expect(mockDelet).toBeCalled();
  });

  test('enter search value and edit item', async () => {
    const { getByPlaceholderText } = render(<Member />);
    const searchInput = getByPlaceholderText('搜尋');

    // 輸入搜尋欄位
    fireEvent.change(searchInput, { target: { value: 'user1' } });

    const { findAllByTestId } = render(<Member />);

    // 取回列表資料
    await findAllByTestId('displayList');

    const { getByText, getAllByText } = render(<Member />);

    await act( async() => {
      // 打開編輯視窗
      await fireEvent.click(getAllByText('編輯')[0]);
    });

    const clickUpdate = getByText('更新');
    const mockEdit = axios.put.mockResolvedValue();

    await act( async() => {
      // 點擊更新
      await fireEvent.click(clickUpdate);
    });

    expect(mockEdit).toBeCalled();
  });
});

describe('delete item', () => {
  test('delete item amd check it finish', async () => {
    window.confirm = jest.fn(() => true);
    const { findAllByTestId, getAllByText } = render(<Member />);

    const deleteResp = {
      data: {
        ret: { id: 1, username: "user1", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
      }
    };

    // 取回列表資料
    await findAllByTestId('displayList');

    const mockDelet = axios.delete.mockResolvedValue(deleteResp);

    await act( async() => {
      await fireEvent.click(getAllByText('刪除')[0]);
    });

    expect(mockDelet).toBeCalled();
  });

  test('delete item but click cancel button', async () => {
    window.confirm = jest.clearAllMocks();
    window.confirm = jest.fn(() => false)
    const { findAllByTestId, getAllByText } = render(<Member />);
    const deleteResp = {
      data: {
        ret: { id: 1, username: "user1", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
      }
    };

    // 取回列表資料
    await findAllByTestId('displayList');

    const mockDelet = axios.delete.mockResolvedValue(deleteResp);

    await act( async() => {
      await fireEvent.click(getAllByText('刪除')[0]);
    });

    expect(mockDelet).not.toBeCalled();
  });
});

test('first render, the item total > 20 and show pagination', async () => {
  const userList = [
    { id: 1, username: "user1", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 2, username: "user2", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 3, username: "user3", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 4, username: "user4", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 5, username: "user5", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 6, username: "user6", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 7, username: "user7", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 8, username: "user8", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 9, username: "user9", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 10, username: "user10", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 11, username: "user11", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 12, username: "user12", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 13, username: "user13", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 14, username: "user14", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 15, username: "user15", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 16, username: "user16", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 17, username: "user17", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 18, username: "user18", enable: 0, locked: 0, created_at: "2019-08-10T09:47:22+00:00" },
    { id: 19, username: "user19", enable: 1, locked: 0, created_at: "2019-08-13T17:54:31+00:00" },
    { id: 20, username: "user20", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
    { id: 21, username: "user21", enable: 1, locked: 0, created_at: "2019-08-09T18:40:50+00:00" },
  ]

  const resp = {
    data: {
      ret: userList,
      pagination: { total: userList.length }
    }
  };

  // 重製mock並回傳新的mock
  axios.get.mockRestore();
  axios.get.mockResolvedValue(resp);

  const { findAllByTestId, getByRole, getByPlaceholderText } = render(<Member />);
  const searchInput = getByPlaceholderText('搜尋');

  fireEvent.change(searchInput, { target: { value: null } });

  await findAllByTestId('displayList');

  const item = await waitForElement( () => getByRole('navigation') );
  const nextButton = item.querySelectorAll('a')[3];

  expect(nextButton).toHaveTextContent('2');

  await act( async() => {
    fireEvent.click(nextButton);
  });
});

test('search item and show pagination', async () => {
  const { findAllByTestId, getByPlaceholderText, getByRole } = render(<Member />);
  const searchInput = getByPlaceholderText('搜尋');

  fireEvent.change(searchInput, { target: { value: '否' } });

  expect(searchInput.value).toBe('否');

  await findAllByTestId('displayList');

  const item = await waitForElement( () => getByRole('navigation') );
  const nextButton = item.querySelectorAll('a')[3];

  expect(nextButton).toHaveTextContent('2');

  await act( async() => {
    fireEvent.click(nextButton);
  });
});

test('delete item amd retun result, pagination 2 become to 1', async () => {
  window.confirm = jest.fn(() => true);

  const { findAllByTestId, getAllByText, getByRole } = render(<Member />);
  const item = await waitForElement( () => getByRole('navigation') );
  const nextButton = item.querySelectorAll('a')[3];

  fireEvent.click(nextButton);
  axios.delete.mockResolvedValue();

  await findAllByTestId('displayList');

  await act( async() => {
    await fireEvent.click(getAllByText('刪除')[0]);
  });
});

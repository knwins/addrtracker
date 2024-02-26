"use client";
import React, {useEffect, useState} from 'react';
import {ProTable} from "@ant-design/pro-components";
import {Button, Dropdown, FloatButton, Input, Menu, message, Modal, Progress, Spin} from 'antd';
import getZksyncData from "@/services/zksync";

const {TextArea} = Input;
import {saveAs} from 'file-saver';
import * as XLSX from 'xlsx';
import {DownOutlined} from "@ant-design/icons";

const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const dataBlob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});

    saveAs(dataBlob, fileName + '.xlsx');
};
const addressFormatOptions = {
    full: {
        format: (address) => address,
        width: 370,
    },
    short: {
        format: (address) => `${address.substring(0, 4)}****${address.substring(address.length - 4)}`,
        width: 150,
    },
    hidden: {
        format: () => '****',
        width: 100,
    },
};
const App = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [addresses, setAddresses] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [notes, setNotes] = useState({});
    const [addressFormat, setAddressFormat] = useState('full');
    useEffect(() => {
        const savedNotes = localStorage.getItem('zksyncAddressNotes');
        setNotes(savedNotes ? JSON.parse(savedNotes) : {});
    }, []);
    const handleNoteChange = (newNote, address) => {
        const newNotes = {...notes, [address]: newNote};
        setNotes(newNotes);
        window.localStorage.setItem('zksyncAddressNotes', JSON.stringify(newNotes));
    };

    const addressDropdownMenu = (
        <Menu onClick={(e) => setAddressFormat(e.key)}>
            <Menu.Item key="full">显示完整地址</Menu.Item>
            <Menu.Item key="short">显示前4后4</Menu.Item>
            <Menu.Item key="hidden">隐藏地址</Menu.Item>
        </Menu>
    );

    const addressColumnTitle = (
        <Dropdown overlay={addressDropdownMenu} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                地址 <DownOutlined/>
            </a>
        </Dropdown>
    );
    const columns = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
            render: (_, record, index) => <> {index + 1} </>,
            align: 'center',
        },
        {
            title: addressColumnTitle,
            dataIndex: 'address',
            key: 'address',
            render: (address) => addressFormatOptions[addressFormat].format(address),
            width: addressFormatOptions[addressFormat].width,
        },
        {
            title: '备注',
            dataIndex: 'note',
            key: 'note',
            render: (_, record) => (
                <TextArea
                    defaultValue={notes[record.address] || ''}
                    onBlur={(e) => handleNoteChange(e.target.value, record.address)}
                    autoSize={{minRows: 1}}
                    style={{minHeight: '32px'}}
                />
            ),
            align: 'center',
            width: 100,
        },
        {
            title: 'ETH Mainnet',
            dataIndex: 'mainnet',
            key: 'mainnet',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'mainnet_balance',
                    key: 'mainnet_balance',
                    align: 'right',
                    sorter: (a, b) => a.mainnet_balance - b.mainnet_balance,
                },
                {
                    title: 'TX',
                    dataIndex: 'mainnet_tx',
                    key: 'mainnet_tx',
                    align: 'right',
                    sorter: (a, b) => a.mainnet_tx - b.mainnet_tx,
                },
            ],
        },
        {
            title: 'zkSync Lite',
            dataIndex: 'zksynclite',
            key: 'zksynclite',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'lite_eth',
                    key: 'lite_eth',
                    align: 'right',
                    sorter: (a, b) => a.lite_eth - b.lite_eth,
                },
                {
                    title: 'TX',
                    dataIndex: 'lite_tx',
                    key: 'lite_tx',
                    align: 'right',
                    sorter: (a, b) => a.lite_tx - b.lite_tx,
                },
            ],
        },
        {
            title: 'zkSync Era',
            dataIndex: 'zksync',
            key: 'zksyncera',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'era_balance',
                    key: 'era_balance',
                    align: 'right',
                    sorter: (a, b) => a.era_balance - b.era_balance,
                },
                {
                    title: 'TX',
                    dataIndex: 'era_tx',
                    key: 'era_tx',
                    align: 'right',
                    sorter: (a, b) => a.era_tx - b.era_tx,
                },
                {
                    title: '日',
                    dataIndex: 'era_day',
                    key: 'era_day',
                    align: 'right',
                    sorter: (a, b) => a.era_day - b.era_day,
                },
                {
                    title: '周',
                    dataIndex: 'era_week',
                    key: 'era_week',
                    align: 'right',
                    sorter: (a, b) => a.era_week - b.era_week,
                },
                {
                    title: '月',
                    dataIndex: 'era_month',
                    key: 'era_month',
                    align: 'right',
                    sorter: (a, b) => a.era_month - b.era_month,
                },
                {
                    title: '合约',
                    dataIndex: 'era_contract',
                    key: 'era_contract',
                    align: 'right',
                    sorter: (a, b) => a.era_contract - b.era_contract,
                },
                {
                    title: '最后交易',
                    dataIndex: 'era_last_tx',
                    key: 'era_last_tx',
                    align: 'right',
                    width: 110,
                },
                {
                    title: 'VOL(E)',
                    dataIndex: 'era_vol',
                    key: 'era_vol',
                    align: 'right',
                    sorter: (a, b) => a.era_vol - b.era_vol,
                },
                {
                    title: 'Gas(E)',
                    dataIndex: 'era_gas',
                    key: 'era_gas',
                    align: 'right',
                    sorter: (a, b) => a.era_gas - b.era_gas,
                }
            ],
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                record.loading ? <Spin size="small"/> :
                    <Button danger size={'small'} onClick={() => handleDelete(record.address)}>删除</Button>
            ),
        },
    ];
    const chunkArray = (arr, size) =>
        arr.length > size
            ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
            : [arr];
    const fetchData = async () => {
        setIsModalVisible(false);
        setLoading(true);
        setProgress(0);

        const inputAddresses = addresses.split(/[\s,]+/).filter(Boolean);
        const uniqueInputAddresses = Array.from(new Set(inputAddresses.map(address => address.toLowerCase())));
        const existingAddresses = data.map(item => item.address.toLowerCase());
        const newAddresses = uniqueInputAddresses.filter(address => !existingAddresses.includes(address));
        const initialData = [...data, ...newAddresses.map(address => ({
            address,
            loading: true,
        }))];

        setData(initialData);
        const batchSize = 5;
        for (let i = 0; i < newAddresses.length; i += batchSize) {
            const batch = newAddresses.slice(i, i + batchSize);
            await Promise.all(batch.map(async (address) => {
                try {
                    const res = await getZksyncData(address);
                    setData(currentData => {
                        const newData = [...currentData];
                        const itemIndex = newData.findIndex(item => item.address.toLowerCase() === address);
                        if (itemIndex !== -1) {
                            newData[itemIndex] = {...newData[itemIndex], ...res, loading: false};
                        }
                        return newData;
                    });
                } catch (error) {
                    console.error(`Error fetching data for address: ${address}`, error);
                    setData(currentData => {
                        const newData = [...currentData];
                        const itemIndex = newData.findIndex(item => item.address.toLowerCase() === address);
                        if (itemIndex !== -1) {
                            newData[itemIndex] = {...newData[itemIndex], loading: false, error: true};
                        }
                        return newData;
                    });
                }
            }));
            setProgress((i + batchSize) / newAddresses.length * 100);
        }
        setLoading(false);
    };

    const refreshSelectedData = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择至少一个地址');
            return;
        }

        setData(currentData => currentData.map(item =>
            selectedRowKeys.includes(item.key) ? {...item, loading: true} : item
        ));

        const chunks = chunkArray([...selectedRowKeys], 5);

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async key => {
                const itemIndex = data.findIndex(item => item.key === key);
                if (itemIndex !== -1) {
                    try {
                        const item = data[itemIndex];
                        const updatedData = await getZksyncData(item.address);
                        setData(prevData => prevData.map(dataItem =>
                            dataItem.key === key ? {...dataItem, ...updatedData, loading: false} : dataItem
                        ));
                    } catch (error) {
                        console.error(`Error updating data for address: ${data[itemIndex].address}`, error);
                        message.error(`更新地址 ${data[itemIndex].address} 的数据时出错`);
                        setData(prevData => prevData.map(dataItem =>
                            dataItem.key === key ? {...dataItem, loading: false, error: true} : dataItem
                        ));
                    }
                }
            }));
        }

        setSelectedRowKeys([]);
        message.success('选中的地址数据已刷新');
    };

    const handleDeleteSelected = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择至少一个地址');
            return;
        }
        const newData = data.filter(item => !selectedRowKeys.includes(item.key));
        setData(newData);
        setSelectedRowKeys([]);
        message.success('选中的地址已删除');
    };
    useEffect(() => {
        const storedData = localStorage.getItem('zksyncData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        if (!isInitialLoad) {
            localStorage.setItem('zksyncData', JSON.stringify(data));
        }
    }, [data, isInitialLoad]);

    const handleDelete = (key) => {
        const newData = data.filter(item => item.key !== key);
        setData(newData);
    }
    return (
        <>
            {loading && <Progress percent={Math.round(progress)}/>}
            <ProTable
                columns={columns}
                dataSource={data}
                rowKey="address"
                bordered
                ghost={true}
                pagination={false}
                search={false}
                sticky
                scroll={{x: 1500}}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                toolBarRender={() => [
                    <Button key="back" type={'link'} onClick={() => window.location.href = '/'}>首页</Button>,
                    <Button key="addAddress" onClick={() => setIsModalVisible(true)}>
                        添加地址
                    </Button>,
                    <Button key="refreshSelected" type="default" onClick={refreshSelectedData}>
                        刷新选中行数据
                    </Button>,
                    <Button key="deleteSelected" onClick={handleDeleteSelected}>删除选中地址</Button>,
                    <Button onClick={() => exportToExcel(data, 'zkSyncData')}>导出数据</Button>,
                ]}
            />
            <Modal
                title="输入地址"
                open={isModalVisible}
                onOk={fetchData}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <TextArea
                    placeholder="请输入地址，多个地址请用逗号、空格或换行符分隔"
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    style={{height: 400}}
                />
            </Modal>
            <FloatButton.BackTop visibilityHeight={100} style={{right: 100, bottom: 100}} type="primary"/>
        </>
    );
};

export default App;

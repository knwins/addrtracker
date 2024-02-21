"use client";
import React, {useEffect, useState} from 'react';
import {ProTable} from "@ant-design/pro-components";
import {Button, Input, message, Modal, Progress, Spin} from 'antd';
import getLineaData from "@/services/linea";

const {TextArea} = Input;
import {saveAs} from 'file-saver';
import * as XLSX from 'xlsx';
import getZksyncData from "@/services/zksync";

const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const dataBlob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});

    saveAs(dataBlob, fileName + '.xlsx');
};

const App = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [addresses, setAddresses] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            width: 350,
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
            title: 'Linea',
            dataIndex: 'linea',
            key: 'linea',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'linea_balance',
                    key: 'linea_balance',
                    align: 'right',
                    sorter: (a, b) => a.linea_balance - b.linea_balance,
                },
                {
                    title: 'TX',
                    dataIndex: 'linea_tx',
                    key: 'linea_tx',
                    align: 'right',
                    sorter: (a, b) => a.linea_tx - b.linea_tx,
                },
                {
                    title: '日',
                    dataIndex: 'linea_day',
                    key: 'linea_day',
                    align: 'right',
                    sorter: (a, b) => a.linea_day - b.linea_day,
                },
                {
                    title: '周',
                    dataIndex: 'linea_week',
                    key: 'linea_week',
                    align: 'right',
                    sorter: (a, b) => a.linea_week - b.linea_week,
                },
                {
                    title: '月',
                    dataIndex: 'linea_month',
                    key: 'linea_month',
                    align: 'right',
                    sorter: (a, b) => a.linea_month - b.linea_month,
                },
                {
                    title: '最后交易',
                    dataIndex: 'linea_last_tx',
                    key: 'linea_last_tx',
                    align: 'right',
                    width: 90,
                },
                {
                    title: 'VOL(E)',
                    dataIndex: 'linea_vol',
                    key: 'linea_vol',
                    align: 'right',
                    sorter: (a, b) => a.linea_vol - b.linea_vol,
                },
                {
                    title: 'Gas(E)',
                    dataIndex: 'linea_gas',
                    key: 'linea_gas',
                    align: 'right',
                    sorter: (a, b) => a.linea_gas - b.linea_gas,
                },
                {
                    title: 'LXP',
                    dataIndex: 'xp_balance',
                    key: 'xp_balance',
                    align: 'right',
                    sorter: (a, b) => a.xp_balance - b.xp_balance,
                }
            ],
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="link" onClick={() => handleDelete(record.key)}>删除</Button>
            ),
        }
    ];
    const chunkArray = (arr, size) =>
        arr.length > size
            ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
            : [arr];
    const fetchData = async () => {
        setIsModalVisible(false);
        setLoading(true);
        const uniqueAddresses = Array.from(new Set(addresses.split(/[\s,]+/).filter(Boolean)));
        const chunks = chunkArray([...uniqueAddresses], 5);

        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(async address => {
                    try {
                        const res = await getLineaData(address);
                        setData(data => {
                            const index = data.findIndex(item => item.address === address);
                            if (index > -1) {
                                return [...data.slice(0, index), res, ...data.slice(index + 1)];
                            } else {
                                return [...data, res];
                            }
                        });
                    } catch (error) {
                        console.error(`Error fetching data for address: ${address}`, error);
                    }
                })
            );
            setProgress(prevProgress => prevProgress + (chunk.length / uniqueAddresses.length) * 100);
        }

        setLoading(false);
        message.success('所有地址的数据已更新');
    };

    const refreshSelectedData = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择至少一个地址');
            return;
        }

        setLoading(true);
        const chunks = chunkArray([...selectedRowKeys], 5);

        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(async key => {
                    const itemIndex = data.findIndex(item => item.key === key);
                    if (itemIndex !== -1) {
                        try {
                            const item = data[itemIndex];
                            const updatedData = await getLineaData(item.address);
                            setData(prevData => {
                                prevData[itemIndex] = {...item, ...updatedData, address: item.address};
                                return [...prevData];
                            });
                        } catch (error) {
                            console.error(`Error updating data for address: ${item.address}`, error);
                            message.error(`更新地址 ${item.address} 的数据时出错`);
                        }
                    }
                })
            );
            setProgress(prevProgress => prevProgress + (chunk.length / selectedRowKeys.length) * 100);
        }

        setLoading(false);
        setSelectedRowKeys([]);
        message.success('选中的地址数据已刷新');
    };
    // const refreshSelectedData = async () => {
    //     if (selectedRowKeys.length === 0) {
    //         message.warning('请先选择至少一个地址');
    //         return;
    //     }
    //
    //     setLoading(true);
    //     const total = selectedRowKeys.length;
    //     let count = 0;
    //
    //     for (const key of selectedRowKeys) {
    //         setProgress((count / total) * 100);
    //
    //         const itemIndex = data.findIndex(item => item.key === key);
    //         if (itemIndex !== -1) {
    //             const item = data[itemIndex];
    //             try {
    //                 const updatedData = await getLineaData(item.address);
    //                 data[itemIndex] = {...item, ...updatedData, address: item.address};
    //                 count++;
    //             } catch (error) {
    //                 console.error("Error updating data for address:", item.address, error);
    //                 message.error(`更新地址 ${item.address} 的数据时出错`);
    //             }
    //         }
    //         setData([...data]);
    //     }
    //
    //     setProgress(100);
    //     setLoading(false);
    //     setSelectedRowKeys([]);
    //     message.success('选中的地址数据已刷新');
    // };

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
        const storedData = localStorage.getItem('lineaData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        if (!isInitialLoad) {
            localStorage.setItem('lineaData', JSON.stringify(data));
        }
    }, [data, isInitialLoad]);
    // const fetchData = async () => {
    //     setIsModalVisible(false);
    //     setLoading(true);
    //     const uniqueAddresses = new Set(addresses.split(/[\s,]+/).filter(Boolean));
    //     const total = uniqueAddresses.size;
    //     let count = 0;
    //     for (const address of uniqueAddresses) {
    //         const res = await getLineaData(address);
    //         const index = data.findIndex(item => item.address === address);
    //         if (index > -1) {
    //             data[index] = res;
    //         } else {
    //             setData(data => [...data, res]);
    //         }
    //         count += 1;
    //         setProgress((count / total) * 100);
    //         if (count === total) {
    //             setLoading(false);
    //             message.success('所有地址的数据已更新');
    //         }
    //     }
    // };
    const handleDelete = (key) => {
        const newData = data.filter(item => item.key !== key);
        setData(newData);
    }
    return (
        <>
            {loading && <Progress percent={Math.round(progress)}/>}
            <Spin spinning={loading} tip={`正在获取数据... `}>
                <ProTable
                    columns={columns}
                    dataSource={data}
                    rowKey="address"
                    bordered
                    ghost={true}
                    pagination={{
                        showQuickJumper: true,
                    }}
                    search={false}
                    scroll={{x: 1300, y: 600}}
                    sticky
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
                        <Button onClick={() => exportToExcel(data, 'LineaData')}>导出数据</Button>,
                    ]}
                />
            </Spin>
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
        </>
    );
};

export default App;

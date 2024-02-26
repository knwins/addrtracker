"use client";
import React, {useState} from 'react';
import {Button, Modal, Input, message, Col, Row, Card, Typography, Space, Image} from 'antd';
import {useRouter} from 'next/navigation';
import {GithubOutlined, MessageOutlined} from '@ant-design/icons';
import axios from "axios";

const {TextArea} = Input;
const {Title, Text} = Typography;

const NavigationImage = ({src, alt, path, title}) => {
    const router = useRouter();

    // 点击时的样式变化
    const handleImageClick = () => {
        router.push(path);
    };

    return (
        <Col xs={24} sm={12} md={8} lg={6} xl={6}
             style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20}}>
            <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <Image
                    src={src}
                    alt={alt}
                    width={120}
                    height={120}
                    style={{objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.2s ease'}}
                    preview={false}
                    onClick={handleImageClick}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </div>
            <div style={{marginTop: 12}}>
                <Text style={{fontSize: '18px'}}>{title}</Text>
            </div>
        </Col>
    );
};


export default function Home() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [feedbackTitle, setFeedbackTitle] = useState('');
    const [feedbackContent, setFeedbackContent] = useState('');
    const navigationImages = [
        {src: "/zkera.png", alt: "zkSync", path: "/zksync", title: "zkSync"},
        {src: "/linea.png", alt: "Linea", path: "/linea", title: "Linea"},
        {src: "/base.png", alt: "Base", path: "/base", title: "Base"},
        {src: "/scroll.png", alt: "Scroll", path: "/scroll", title: "Scroll"},
    ];


    const showModal = () => setIsModalVisible(true);
    // const handleOk = async () => {
    //     try {
    //         const apiEndpoint = `https://api.day.app/T9gia4FCEd5NNmDCzHnNhT/${encodeURIComponent(feedbackTitle)}/${encodeURIComponent(feedbackContent)}`;
    //         await axios.post(apiEndpoint);
    //         message.success('反馈发送成功！');
    //         setIsModalVisible(false);
    //         setFeedbackTitle('');
    //         setFeedbackContent('');
    //     } catch (error) {
    //         console.error('反馈发送失败：', error);
    //         message.error('反馈发送失败，请稍后再试。');
    //     }
    // };
    const handleCancel = () => setIsModalVisible(false);

    return (
        <Row justify="center" align="middle" style={{padding: '24px'}}>
            <Col span={24} lg={16} xl={12}>
                <Card>
                    <Typography>
                        <Title level={2} style={{
                            textAlign: 'center',
                            marginTop: '20px',
                            marginBottom: '20px'
                        }}>AddrTracker</Title>
                    </Typography>
                    <Row gutter={[16, 16]} justify="center">
                        {navigationImages.map(({src, alt, path, title}) => (
                            <NavigationImage key={src} src={src} alt={alt} path={path} title={title}/>
                        ))}
                    </Row>
                   
                </Card>
            </Col>
             <Space direction="vertical" size="middle"
                           style={{display: 'flex', justifyContent: 'center', width: '100%', marginTop: 24}}>
                        <Button block icon={<GithubOutlined/>} size="large" type="link"
                                style={{marginTop: '16px'}}
                                onClick={() => window.open('https://github.com/wxtsky/addrtracker', '_blank')}> 作者GitHub</Button>
                    </Space>
        </Row>
    );
}

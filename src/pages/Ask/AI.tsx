import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, List, Typography } from 'antd';
import { SendOutlined, SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import background from '../../assets/2.png';
import styles from './AI.module.css';

const { Title, Text } = Typography;

// 修改容器样式，使用背景图片
const Container = styled.div`
  min-height: 100vh;
  background: url(${background}) no-repeat center center;
  background-size: cover;
  position: relative;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.div`
  cursor: pointer;
  padding: 0.5rem 1rem;
  &:hover {
    color: #1976d2;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Content = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ChatHistoryContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TimeSection = styled.div`
  margin-bottom: 2rem;
`;

const SearchBar = styled(Input.Search)`
  margin-bottom: 1rem;
`;

interface ChatMessage {
  question: string;
  answer: string;
  timestamp: string;
}

// GLM服务
const glm = {
  apiKey: "36ca51231d044d5c86071f0b12f7fb81.CR2DF03C8VzRXLpf",
  apiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",

  async getResponse(prompt: string): Promise<string | null> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      };
      
      const payload = {
        "model": "glm-4-flashx",
        "messages": [{ "role": "user", "content": prompt }]
      };
      
      const response = await axios.post(
        this.apiUrl,
        payload,
        { headers }
      );
      
      if (response.status === 200) {
        return response.data.choices[0].message.content;
      }
      
      console.error(`API请求失败: ${response.status}`);
      return null;
      
    } catch (error) {
      console.error(`调用API时出错:`, error);
      return null;
    }
  }
};

const AI: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [searchText, setSearchText] = useState('');
  const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(new Set());

  // 获取历史记录
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('http://10.196.102.182:5001/get_all_messages');
      const messages = response.data
        .filter((msg: any) => msg.message_type === 'qa')
        .map((msg: any) => ({
          question: msg.user_input,
          answer: msg.model_response,
          timestamp: msg.timestamp
        }));
      setChatHistory(messages);
    } catch (error) {
      console.error('获取历史记录失败:', error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await glm.getResponse(input);
      if (response) {
        setAnswer(response);
        // 添加到历史记录
        const newMessage = {
          question: input,
          answer: response,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [newMessage, ...prev]);
        setInput('');
        
        // 存储到服务器时添加消息类型标记
        await axios.post('http://10.196.102.182:5001/store_message', {
          user_input: input,
          model_response: response,
          timestamp: new Date().toISOString(),
          message_type: 'qa'
        });
      } else {
        message.error('获取回答失败，请重试');
      }
    } catch (error) {
      message.error('发生错误，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 按时间分组历史记录
  const groupChatHistory = () => {
    const filtered = searchText
      ? chatHistory.filter(msg => 
          msg.question.toLowerCase().includes(searchText.toLowerCase()) ||
          msg.answer.toLowerCase().includes(searchText.toLowerCase())
        )
      : chatHistory;

    const now = new Date();
    const thisWeek = filtered.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return (now.getTime() - msgDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    });

    const thisMonth = filtered.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
    });

    const thisYear = filtered.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate.getFullYear() === now.getFullYear();
    });

    return { thisWeek, thisMonth, thisYear };
  };

  const toggleCollapse = (timestamp: string) => {
    setCollapsedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(timestamp)) {
        newSet.delete(timestamp);
      } else {
        newSet.add(timestamp);
      }
      return newSet;
    });
  };

  const renderChatList = (messages: ChatMessage[], title: string) => {
    if (messages.length === 0) return null;

    return (
      <TimeSection>
        <Title level={4}>{title}</Title>
        <List
          itemLayout="vertical"
          dataSource={messages}
          renderItem={item => (
            <List.Item>
              <Card style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Text strong>问：{item.question}</Text>
                  <Button 
                    type="text" 
                    icon={collapsedMessages.has(item.timestamp) ? <DownOutlined /> : <UpOutlined />}
                    onClick={() => toggleCollapse(item.timestamp)}
                  />
                </div>
                {!collapsedMessages.has(item.timestamp) && (
                  <div style={{ margin: '1rem 0' }}>
                    <Text>答：{item.answer}</Text>
                  </div>
                )}
                <Text type="secondary">
                  {new Date(item.timestamp).toLocaleString('zh-CN')}
                </Text>
              </Card>
            </List.Item>
          )}
        />
      </TimeSection>
    );
  };

  const { thisWeek, thisMonth, thisYear } = groupChatHistory();

  return (
    <Container>
      <Nav>
        <Logo>智普清颜</Logo>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <NavItem onClick={() => navigate('/emotion')}>当前状况</NavItem>
          <NavItem onClick={() => navigate('/advice')}>护肤建议</NavItem>
          <NavItem onClick={() => navigate('/history')}>历史记录</NavItem>
          <NavItem onClick={() => navigate('/ai')}>智能问答</NavItem>
        </div>
      </Nav>
      <Content>
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Input.Search
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSearch={handleSubmit}
              placeholder="请输入您的问题..."
              enterButton={
                <Button type="primary" icon={<SendOutlined />} loading={loading}>
                  发送
                </Button>
              }
              size="large"
            />
          </div>
          
          {answer && (
            <Card style={{ background: 'rgba(255, 255, 255, 0.95)', marginBottom: '2rem' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {answer}
              </div>
            </Card>
          )}
        </div>

        <ChatHistoryContainer>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            历史会话
          </Title>
          <SearchBar
            placeholder="搜索历史会话"
            allowClear
            enterButton={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
          />
          {renderChatList(thisWeek, '本周')}
          {renderChatList(thisMonth, '本月')}
          {renderChatList(thisYear, '本年')}
        </ChatHistoryContainer>
      </Content>
    </Container>
  );
};

export default AI;